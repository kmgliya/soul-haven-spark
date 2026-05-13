import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppState, type CoupleType, type PartnerProfile } from "@/lib/state";
import { useAuth, RequireAuth } from "@/lib/auth";
import {
  createCouple,
  joinCoupleByCode,
  normalizeCoupleCode,
  normalizeStartDateForStorage,
  findCoupleByMemberReliable,
} from "@/lib/couple";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Share2,
  Copy,
  Check,
  Calendar as CalendarIcon,
  Sparkles,
  Users,
  KeyRound,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Начать — LoveSpace" }] }),
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return (
    <RequireAuth>
      <Onboarding />
    </RequireAuth>
  );
}

const STEPS = ["profile", "mode", "code", "type", "start"] as const;
type Step = (typeof STEPS)[number];
type Mode = "create" | "join";
const EMOJIS = ["🐶", "🐱", "🐰", "🐻", "🐼", "🦊", "🐨", "🦄"];

function generateCoupleCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [s] = useAppState();

  const [step, setStep] = useState<Step>("profile");
  const [mode, setMode] = useState<Mode>("create");

  const [name, setName] = useState(s.me.name && s.me.name !== "Ты" ? s.me.name : "");
  const [emoji, setEmoji] = useState(s.me.emoji ?? "🍂");
  const [avatarImage, setAvatarImage] = useState<string | null>(s.me.avatarImage ?? null);
  const [coupleCode, setCoupleCode] = useState(() => generateCoupleCode());
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [coupleType, setCoupleType] = useState<CoupleType>(s.coupleType ?? "together");
  const [startDate, setStartDate] = useState(() =>
    (s.startDate ? s.startDate : new Date().toISOString()).slice(0, 10),
  );
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Если пользователь уже состоит в паре — отправляем сразу на /home.
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user) return;
      try {
        const existing = await findCoupleByMemberReliable(user.uid);
        if (cancelled) return;
        if (existing) {
          navigate({ to: "/home", replace: true });
          return;
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("[onboarding] findCoupleByMemberReliable failed", err);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  const visibleSteps: readonly Step[] =
    mode === "join" ? (["profile", "mode", "code"] as const) : STEPS;
  const stepIdx = Math.max(0, visibleSteps.indexOf(step));
  const isLast = step === visibleSteps[visibleSteps.length - 1];

  function next() {
    const idx = visibleSteps.indexOf(step);
    const nx = visibleSteps[idx + 1];
    if (nx) setStep(nx);
  }

  function prev() {
    const idx = visibleSteps.indexOf(step);
    const px = visibleSteps[idx - 1];
    if (px) setStep(px);
  }

  function buildProfile(): PartnerProfile {
    return {
      name: name.trim() || "Я",
      emoji,
      avatarImage: avatarImage ?? undefined,
    };
  }

  async function finish() {
    if (!user) return;
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createCouple({
          uid: user.uid,
          profile: buildProfile(),
          coupleCode: normalizeCoupleCode(coupleCode),
          coupleType,
          startDate: normalizeStartDateForStorage(startDate),
        });
        toast.success("Пара создана! Поделись кодом со второй половинкой.");
      } else {
        const code = normalizeCoupleCode(joinCode);
        if (!code) {
          toast.error("Введи код пары.");
          setSubmitting(false);
          return;
        }
        await joinCoupleByCode({
          uid: user.uid,
          profile: buildProfile(),
          coupleCode: code,
        });
        toast.success("Ты в паре! Добро пожаловать.");
      }
      navigate({ to: "/home", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function shareCode() {
    const text = `Код пары LoveSpace: ${coupleCode}`;
    try {
      if ("share" in navigator && typeof navigator.share === "function") {
        await navigator.share({ title: "LoveSpace", text });
        return;
      }
    } catch {
      // ignore and fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // last resort: nothing
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={28} className="animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Подключаемся…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-200px] bottom-[-260px] h-[560px] w-[560px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-12 md:px-10 md:py-14">
        <aside className="relative overflow-hidden rounded-[40px] border border-border bg-card/80 p-8 backdrop-blur-2xl md:col-span-5 md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Heart size={20} className="text-primary" fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-extrabold tracking-tight">LoveSpace</p>
                <p className="text-[11px] font-semibold text-muted-foreground">Онбординг пары</p>
              </div>
            </div>

            <div className="mt-10 space-y-7">
              <p className="font-display text-4xl font-black leading-[0.95] tracking-tighter">
                Настройте <br /> пространство <span className="text-primary">вдвоём</span>
              </p>

              <div className="grid gap-3">
                {[
                  {
                    icon: <Sparkles size={16} className="text-primary" />,
                    t: "Ритуалы и вопросы на каждый день",
                  },
                  {
                    icon: <CalendarIcon size={16} className="text-primary" />,
                    t: "Счётчик дней и важные даты",
                  },
                  {
                    icon: <Heart size={16} className="text-primary" fill="currentColor" />,
                    t: "История и воспоминания",
                  },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="flex items-center gap-3 rounded-[22px] border border-border bg-background/70 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10">
                      {x.icon}
                    </div>
                    <p className="text-sm font-bold text-foreground/85">{x.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 hidden md:block">
            <div className="flex items-center justify-between gap-4 rounded-[28px] border border-border bg-background/70 px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Прогресс
                </p>
                <p className="mt-1 text-sm font-bold text-foreground/80">
                  Шаг {stepIdx + 1} из {visibleSteps.length}
                </p>
              </div>
              <div className="flex w-40 gap-1.5">
                {visibleSteps.map((sId, i) => (
                  <div
                    key={sId}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= stepIdx ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-primary/15 blur-[80px]" />
        </aside>

        <section className="md:col-span-7 md:flex md:flex-col md:justify-center">
          <div className="mb-10 flex items-center justify-between md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart size={20} className="text-primary" fill="currentColor" />
            </div>
            <div className="mx-6 flex flex-1 gap-1.5">
              {visibleSteps.map((sId, i) => (
                <div
                  key={sId}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= stepIdx ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <main className="rounded-[34px] border border-border bg-card/80 p-6 backdrop-blur-2xl shadow-xl md:p-8">
            {step === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-6">
                <h2 className="font-display text-3xl font-black leading-tight md:text-4xl">
                  Давайте настроим <br /> тебя
                </h2>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Имена и аватарки можно поменять позже в профиле.
                </p>

                <div className="mt-8">
                  <PersonCard
                    title="Ты"
                    name={name}
                    onName={setName}
                    emoji={emoji}
                    onEmoji={setEmoji}
                    avatarImage={avatarImage}
                    onAvatarImage={setAvatarImage}
                  />
                </div>
              </div>
            )}

            {step === "mode" && (
              <div className="animate-in fade-in slide-in-from-right-6">
                <h2 className="font-display text-3xl font-black md:text-4xl">Создаём пару</h2>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Создай новую пару или присоединись по коду партнёра.
                </p>

                <div className="mt-8 grid gap-4">
                  <ModeCard
                    icon={<Users size={20} />}
                    title="Создать пару"
                    subtitle="Я первый. Сгенерируем код, чтобы пригласить второго."
                    active={mode === "create"}
                    onClick={() => setMode("create")}
                  />
                  <ModeCard
                    icon={<KeyRound size={20} />}
                    title="Присоединиться по коду"
                    subtitle="Партнёр уже создал пару и поделился кодом."
                    active={mode === "join"}
                    onClick={() => setMode("join")}
                  />
                </div>
              </div>
            )}

            {step === "code" && mode === "create" && (
              <div className="animate-in fade-in slide-in-from-right-6 text-center">
                <h2 className="font-display text-3xl font-black md:text-4xl">Код пары</h2>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Отправь партнёру — он введёт код и вы соединитесь.
                </p>
                <div className="mx-auto mt-8 flex w-full items-center justify-center rounded-[28px] border border-border bg-background/70 px-6 py-8">
                  <span className="font-display text-5xl font-black tracking-widest text-primary">
                    {coupleCode}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <button
                    onClick={shareCode}
                    className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.18em] shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)] hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <Share2 size={16} />
                    Поделиться
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(coupleCode);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1200);
                      } catch {
                        void 0;
                      }
                    }}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <Copy size={16} className="text-primary" />
                    )}
                    {copied ? "OK" : "Копировать"}
                  </button>
                </div>

                <button
                  onClick={() => setCoupleCode(generateCoupleCode())}
                  className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  обновить код
                </button>
              </div>
            )}

            {step === "code" && mode === "join" && (
              <div className="animate-in fade-in slide-in-from-right-6">
                <h2 className="font-display text-3xl font-black md:text-4xl">Введи код пары</h2>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Получи код от партнёра, который уже создал пространство.
                </p>
                <div className="mt-8">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    maxLength={8}
                    className="w-full rounded-[24px] border border-border bg-background/70 px-6 py-6 text-center font-display text-4xl font-black uppercase tracking-[0.5em] text-foreground outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                  <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Регистр не важен — приведём к верхнему автоматически.
                  </p>
                </div>
              </div>
            )}

            {step === "type" && (
              <div className="animate-in fade-in slide-in-from-right-6">
                <h2 className="font-display text-4xl font-bold">Где вы сейчас?</h2>
                <div className="mt-10 space-y-4">
                  {[
                    { v: "together", title: "Живем вместе", icon: "🏠" },
                    { v: "city", title: "В одном городе", icon: "🚇" },
                    { v: "ldr", title: "На расстоянии", icon: "✈️" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setCoupleType(opt.v as CoupleType)}
                      className={`flex w-full items-center gap-6 rounded-[32px] border-2 p-6 transition-all ${
                        coupleType === opt.v
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/70 hover:bg-accent"
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-xl font-bold">{opt.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "start" && (
              <div className="animate-in fade-in slide-in-from-right-6 text-center">
                <h2 className="font-display text-3xl font-black md:text-4xl">
                  С какого дня вы вместе?
                </h2>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Это нужно, чтобы красиво считать дни и отмечать годовщины.
                </p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-8 w-full rounded-[28px] border border-border bg-background/70 p-6 text-center text-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40"
                />
              </div>
            )}
          </main>

          <footer className="mt-8 flex gap-4">
            {stepIdx > 0 && (
              <button
                onClick={prev}
                disabled={submitting}
                className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border bg-background/70 transition-all hover:bg-accent disabled:opacity-50"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <button
              onClick={isLast ? finish : next}
              disabled={submitting || (step === "profile" && !name.trim())}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-3xl bg-primary font-bold text-primary-foreground shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {isLast ? (mode === "join" ? "Присоединиться" : "Создать пару") : "Далее"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-4 rounded-[28px] border-2 p-5 text-left transition-all ${
        active ? "border-primary bg-primary/10" : "border-border bg-background/70 hover:bg-accent"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base font-black text-foreground">{title}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}

function PersonCard({
  title,
  name,
  onName,
  emoji,
  onEmoji,
  avatarImage,
  onAvatarImage,
}: {
  title: string;
  name: string;
  onName: (v: string) => void;
  emoji: string;
  onEmoji: (v: string) => void;
  avatarImage: string | null;
  onAvatarImage: (v: string | null) => void;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-background/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <label className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background/70 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors cursor-pointer">
          <ImagePlus size={14} className="text-primary" />
          фото
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const r = new FileReader();
              r.onload = () => onAvatarImage(String(r.result));
              r.readAsDataURL(file);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-[22px] border border-border bg-card shadow-sm">
          {avatarImage ? (
            <img
              src={avatarImage}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">{emoji}</div>
          )}
        </div>
        <div className="flex-1">
          <input
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Введите своё имя"
            className="w-full rounded-[18px] border border-border bg-background/70 px-4 py-3 text-base font-bold text-foreground outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
          />
          {avatarImage && (
            <button
              onClick={() => onAvatarImage(null)}
              className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              убрать фото
            </button>
          )}
        </div>
      </div>

      {!avatarImage && (
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            или выбери эмодзи
          </p>
          <div className="mt-2 grid grid-cols-8 gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => onEmoji(e)}
                className={`flex aspect-square items-center justify-center rounded-2xl text-lg transition-all ${
                  emoji === e
                    ? "bg-primary text-primary-foreground scale-105"
                    : "bg-accent text-foreground"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
