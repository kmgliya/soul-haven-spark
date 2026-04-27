import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState, type CoupleType } from "@/lib/state";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Начать — LoveSpace" }] }),
  component: Onboarding,
});

const STEPS = ["profile", "code", "type", "start"] as const;
type Step = (typeof STEPS)[number];

const EMOJIS = ["🌸", "🌿", "🌙", "⭐", "🦋", "🍓", "🐻", "🌻"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("profile");

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌸");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmoji, setPartnerEmoji] = useState("🌿");
  const [coupleType, setCoupleType] = useState<CoupleType>("together");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const stepIdx = STEPS.indexOf(step);

  function next() {
    const nextIdx = stepIdx + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
  }

  function finish() {
    setState({
      onboarded: true,
      me: { name: name || "Ты", emoji },
      partner: { name: partnerName || "Партнёр", emoji: partnerEmoji },
      coupleType,
      startDate: new Date(startDate).toISOString(),
      coupleCode: Math.random().toString(36).slice(2, 6).toUpperCase(),
    });
    navigate({ to: "/home" });
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-warm px-5 pb-12 pt-10 md:px-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-romantic)" }}
      />

      {/* progress */}
      <div className="mx-auto flex w-full max-w-md gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-smooth"
            style={{ background: i <= stepIdx ? "var(--color-primary)" : "var(--color-border)" }}
          />
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-md flex-1">
        {step === "profile" && (
          <section className="animate-float-up">
            <h2 className="font-display text-3xl font-bold">Расскажите о себе</h2>
            <p className="mt-2 text-sm text-muted-foreground">Это увидит ваш партнёр.</p>

            <label className="mt-6 block text-sm font-medium">Ваше имя</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Аля"
              className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none ring-ring transition-smooth focus:ring-2"
            />

            <p className="mt-6 text-sm font-medium">Ваш аватар</p>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="aspect-square rounded-xl border text-2xl transition-smooth"
                  style={{
                    borderColor: emoji === e ? "var(--color-primary)" : "var(--color-border)",
                    background: emoji === e ? "var(--color-secondary)" : "var(--color-card)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            <h3 className="mt-8 font-display text-xl font-semibold">И о партнёре</h3>
            <input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Имя партнёра"
              className="mt-3 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none ring-ring transition-smooth focus:ring-2"
            />
            <div className="mt-2 grid grid-cols-8 gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setPartnerEmoji(e)}
                  className="aspect-square rounded-xl border text-2xl transition-smooth"
                  style={{
                    borderColor: partnerEmoji === e ? "var(--color-primary)" : "var(--color-border)",
                    background: partnerEmoji === e ? "var(--color-secondary)" : "var(--color-card)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "code" && (
          <section className="animate-float-up text-center">
            <h2 className="font-display text-3xl font-bold">Код для пары</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Отправьте этот код партнёру или подключитесь по его коду.
            </p>

            <div className="mx-auto mt-8 inline-flex items-center justify-center rounded-3xl bg-gradient-romantic px-8 py-6 shadow-glow">
              <span className="font-display text-5xl font-bold tracking-[0.4em] text-primary-foreground">
                {Math.random().toString(36).slice(2, 6).toUpperCase()}
              </span>
            </div>

            <button
              type="button"
              className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Скопировать ссылку-приглашение
            </button>

            <div className="mt-10 rounded-2xl border border-border bg-card p-5 text-left">
              <p className="text-sm font-medium">Уже есть код от партнёра?</p>
              <input
                placeholder="Введите 4 символа"
                maxLength={4}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-center text-lg uppercase tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </section>
        )}

        {step === "type" && (
          <section className="animate-float-up">
            <h2 className="font-display text-3xl font-bold">Какие вы пара?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Это поможет подбирать подходящие активности.</p>

            <div className="mt-6 flex flex-col gap-3">
              {(
                [
                  { v: "together", emoji: "🏠", title: "Живём вместе" },
                  { v: "city", emoji: "🚇", title: "В одном городе" },
                  { v: "ldr", emoji: "✈️", title: "На расстоянии" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setCoupleType(opt.v)}
                  className="flex items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-smooth"
                  style={{
                    borderColor: coupleType === opt.v ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-base font-medium">{opt.title}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "start" && (
          <section className="animate-float-up">
            <h2 className="font-display text-3xl font-bold">Когда вы вместе?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Будем считать ваши дни.</p>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-6 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-8 rounded-3xl bg-gradient-soft p-6 text-center">
              <div className="text-4xl">💞</div>
              <p className="mt-2 font-display text-lg font-semibold">Почти готово!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ваше совместное пространство ждёт.
              </p>
            </div>
          </section>
        )}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-md gap-3">
        {stepIdx > 0 && (
          <button
            onClick={() => setStep(STEPS[stepIdx - 1])}
            className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold transition-smooth hover:bg-muted"
          >
            Назад
          </button>
        )}
        <button
          onClick={step === "start" ? finish : next}
          className="flex-[2] rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-smooth hover:bg-primary/95"
        >
          {step === "start" ? "Войти в LoveSpace" : "Далее"}
        </button>
      </div>
    </div>
  );
}
