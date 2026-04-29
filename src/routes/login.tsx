import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth, AuthLoading } from "@/lib/auth";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Вход — LoveSpace" }] }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, loading, configured } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: search.redirect ?? "/home", replace: true });
    }
  }, [loading, user, navigate, search.redirect]);

  if (loading) return <AuthLoading />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Заполни email и пароль.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success("С возвращением!");
    } catch (err) {
      const message = friendlyAuthError(err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[680px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-180px] bottom-[-220px] h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Heart fill="currentColor" size={20} />
          </div>
          <div>
            <p className="font-display text-xl font-black tracking-tight">LoveSpace</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Вход в твой аккаунт
            </p>
          </div>
        </div>

        <main className="rounded-[34px] border border-border bg-card/80 p-8 shadow-xl backdrop-blur-2xl">
          <h1 className="font-display text-3xl font-black leading-tight">С возвращением</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Войди в свой аккаунт, чтобы продолжить историю.
          </p>

          {!configured && (
            <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
              Firebase не настроен. Добавь VITE_FIREBASE_* в `.env.local`.
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field
              icon={<Mail size={16} />}
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
            <Field
              icon={<Lock size={16} />}
              label="Пароль"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-xs font-semibold text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-3xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Войти
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              search={search.redirect ? { redirect: search.redirect } : undefined}
              className="font-black text-primary hover:underline"
            >
              Создать
            </Link>
          </p>
        </main>

        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-3 transition-colors focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        <span className="text-primary">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
      </div>
    </label>
  );
}

function friendlyAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/invalid-email":
      return "Некорректный email.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Неверный email или пароль.";
    case "auth/too-many-requests":
      return "Слишком много попыток. Попробуй чуть позже.";
    case "auth/network-request-failed":
      return "Проблема с сетью. Проверь интернет.";
    default:
      return err instanceof Error ? err.message : "Не удалось войти.";
  }
}
