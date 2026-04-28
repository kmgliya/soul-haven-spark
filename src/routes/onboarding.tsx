import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, type CoupleType } from "@/lib/state";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

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
  const [partnerName, setPartnerName] = useState("Партнёр");
  const [partnerEmoji, setPartnerEmoji] = useState("🦊");
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
      me: { name: name || "Я", emoji },
      partner: { name: partnerName || "Партнёр", emoji: partnerEmoji },
      coupleType,
      startDate: new Date(startDate).toISOString(),
      coupleCode: Math.random().toString(36).slice(2, 6).toUpperCase(),
    });
    navigate({ to: "/home" });
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

            <div className="mt-10 space-y-6">
              <p className="font-display text-4xl font-black leading-[0.95] tracking-tighter">
                Настройте <br /> пространство <span className="text-primary">вдвоём</span>
              </p>
              <p className="max-w-sm text-sm font-medium leading-relaxed text-muted-foreground">
                Все данные остаются на этом устройстве. Мы ничего не “ломаем” — только помогаем быстро
                настроить ритуалы, капсулу и профиль.
              </p>
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

          <main className="rounded-[40px] border border-border bg-card/80 p-8 backdrop-blur-2xl shadow-xl md:p-10">
          {step === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-6">
              <h2 className="font-display text-4xl font-bold leading-tight">
                Давайте <br /> познакомимся
              </h2>
              <div className="mt-10 space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Твое имя
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Напр. Алина"
                    className="mt-2 w-full border-b-2 border-border bg-transparent py-4 text-2xl outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Твой аватар
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`aspect-square text-2xl flex items-center justify-center rounded-2xl transition-all ${
                          emoji === e ? "bg-primary text-primary-foreground scale-110" : "bg-accent text-foreground"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "code" && (
            <div className="animate-in fade-in slide-in-from-right-6 text-center">
              <h2 className="font-display text-4xl font-bold">Код пары</h2>
              <div className="mx-auto mt-12 flex h-32 w-full items-center justify-center rounded-[40px] border border-border bg-background/70">
                <span className="font-display text-5xl font-black tracking-widest text-primary">
                  {Math.random().toString(36).slice(2, 6).toUpperCase()}
                </span>
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
              <h2 className="font-display text-4xl font-bold">Начало пути</h2>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-10 w-full rounded-[32px] border border-border bg-background/70 p-6 text-center text-2xl font-bold outline-none"
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