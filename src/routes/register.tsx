import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth, AuthLoading } from "@/lib/auth";

interface RegisterSearch {
  redirect?: string;
}

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Регистрация — LoveSpace" }] }),
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, user, loading, configured } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: search.redirect ?? "/onboarding", replace: true });
    }
  }, [loading, user, navigate, search.redirect]);

  if (loading) return <AuthLoading />;
  if (user) return <AuthLoading />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Заполни email и пароль.");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (password !== password2) {
      setError("Пароли не совпадают.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim(), password);
      toast.success("Аккаунт создан. Добро пожаловать в LoveSpace!");
    } catch (err) {
      setError(friendlyRegisterError(err));
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
              Создание аккаунта
            </p>
          </div>
        </div>

        <main className="rounded-[34px] border border-border bg-card/80 p-8 shadow-xl backdrop-blur-2xl">
          <h1 className="font-display text-3xl font-black leading-tight">Начнём вашу историю</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Зарегистрируйся, и затем создадим вашу пару.
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
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              placeholder="Минимум 6 символов"
            />
            <Field
              icon={<Lock size={16} />}
              label="Повтори пароль"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={setPassword2}
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
                  Создать аккаунт
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              search={search.redirect ? { redirect: search.redirect } : undefined}
              className="font-black text-primary hover:underline"
            >
              Войти
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

function friendlyRegisterError(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Этот email уже используется.";
    case "auth/invalid-email":
      return "Некорректный email.";
    case "auth/weak-password":
      return "Пароль слишком слабый. Минимум 6 символов.";
    case "auth/network-request-failed":
      return "Проблема с сетью. Проверь интернет.";
    default:
      return err instanceof Error ? err.message : "Не удалось создать аккаунт.";
  }
}
