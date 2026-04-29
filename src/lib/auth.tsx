import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { Navigate, useLocation } from "@tanstack/react-router";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { Heart } from "lucide-react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!mounted.current) return;
      setUser(u);
      setLoading(false);
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      configured,
      async login(email: string, password: string) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase не настроен. Проверь .env.local");
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      },
      async register(email: string, password: string) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase не настроен. Проверь .env.local");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        return cred.user;
      },
      async logout() {
        const auth = getFirebaseAuth();
        if (!auth) return;
        await fbSignOut(auth);
      },
    };
  }, [user, loading, configured]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  return ctx;
}

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
          <Heart size={26} fill="currentColor" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Загружаем твой LoveSpace…
        </p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!user) {
    const search =
      location.pathname && location.pathname !== "/" ? { redirect: location.pathname } : undefined;
    return <Navigate to="/login" search={search} replace />;
  }

  return <>{children}</>;
}

/**
 * Дополнительный гард: пускает только если у пользователя уже есть couple-документ.
 * Иначе редиректит в /onboarding.
 */
export function RequireCouple({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "has" | "none">("loading");

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    setStatus("loading");
    import("@/lib/couple")
      .then(({ findCoupleByMember }) => findCoupleByMember(user.uid))
      .then((c) => {
        if (cancelled) return;
        setStatus(c ? "has" : "none");
      })
      .catch(() => {
        if (!cancelled) setStatus("none");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (status === "loading") return <AuthLoading />;
  if (status === "none") return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
