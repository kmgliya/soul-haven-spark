import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, type CoupleType } from "@/lib/state";
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
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Начать — LoveSpace" }] }),
  component: Onboarding,
});

const STEPS = ["profile", "code", "type", "start"] as const;
type Step = (typeof STEPS)[number];
const EMOJIS = ["🍂", "🍄", "🧣", "🥧", "🦊", "☕", "🕯️", "🧸"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("profile");

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍂");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [coupleCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [coupleType, setCoupleType] = useState<CoupleType>("together");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const stepIdx = STEPS.indexOf(step);

  function next() {
    const nextIdx = stepIdx + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
  }

  function finish() {
    setState({
      onboarded: true,
      me: { name: name || "Я", emoji, avatarImage: avatarImage ?? undefined },
      partner: { name: "Партнёр", emoji: "🦊" },
      coupleType,
      startDate: new Date(startDate).toISOString(),
      coupleCode,
    });
    navigate({ to: "/home" });
  }

  async function shareCode() {
    const text = `Код пары LoveSpace: ${coupleCode}`;
    try {
      // Web Share API (mobile / some desktop)
      // @ts-expect-error: share exists in supporting browsers
      if (navigator?.share) {
        // @ts-expect-error: share exists in supporting browsers
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

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Веб-фон */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-[-200px] bottom-[-260px] h-[560px] w-[560px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-12 md:px-10 md:py-14">
        {/* Левая панель (desktop) */}
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
                  { icon: <Sparkles size={16} className="text-primary" />, t: "Ритуалы и вопросы на каждый день" },
                  { icon: <CalendarIcon size={16} className="text-primary" />, t: "Счётчик дней и важные даты" },
                  { icon: <Heart size={16} className="text-primary" fill="currentColor" />, t: "Капсула времени и воспоминания" },
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
                  Шаг {stepIdx + 1} из {STEPS.length}
                </p>
              </div>
              <div className="flex w-40 gap-1.5">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
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

        {/* Правая панель (контент шагов) */}
        <section className="md:col-span-7 md:flex md:flex-col md:justify-center">
          {/* Мобильный хедер (компактный прогресс) */}
          <div className="mb-10 flex items-center justify-between md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart size={20} className="text-primary" fill="currentColor" />
            </div>
            <div className="mx-6 flex flex-1 gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={s}
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

          {step === "code" && (
            <div className="animate-in fade-in slide-in-from-right-6 text-center">
              <h2 className="font-display text-3xl font-black md:text-4xl">Код пары</h2>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Отправь партнёру — он введёт код и вы соединитесь.
              </p>
              <div className="mx-auto mt-8 flex w-full items-center justify-center rounded-[28px] border border-border bg-background/70 px-6 py-8">
                <span className="font-display text-5xl font-black tracking-widest text-primary">{coupleCode}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={shareCode}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.18em] shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)] hover:scale-[1.01] active:scale-[0.99] transition-transform"
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
                    } catch {}
                  }}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} className="text-primary" />}
                  {copied ? "Скопировано" : "Копировать"}
                </button>
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
                    onClick={() => setCoupleType(opt.v as any)}
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
              <h2 className="font-display text-3xl font-black md:text-4xl">С какого дня вы вместе?</h2>
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
                onClick={() => setStep(STEPS[stepIdx - 1])}
                className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border bg-background/70 transition-all hover:bg-accent"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <button
              onClick={step === "start" ? finish : next}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-3xl bg-primary font-bold text-primary-foreground shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {step === "start" ? "Войти" : "Далее"}
              <ChevronRight size={18} />
            </button>
          </footer>
        </section>
      </div>
    </div>
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
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
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
            <img src={avatarImage} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">{emoji}</div>
          )}
        </div>
        <div className="flex-1">
          <input
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder={title === "Ты" ? "Напр. Алина" : "Напр. Артём"}
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
                  emoji === e ? "bg-primary text-primary-foreground scale-105" : "bg-accent text-foreground"
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