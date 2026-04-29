import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState } from "@/lib/state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LoveSpace— приложение для пар" },
      {
        name: "description",
        content: "Ежедневные активности, общая капсула воспоминаний и идеи для свиданий.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (getState().onboarded) {
      navigate({ to: "/home" });
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-warm">
      {/* Декор */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--gradient-romantic)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-soft)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="animate-heart-beat">💞</span>
          <span>Версия 0.1 для пар</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          <span className="text-gradient">LoveSpace</span>
          <br />
          <span className="text-foreground">ваше пространство</span>
          <br />
          <span className="text-foreground">для двоих</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          Ежедневные вопросы, мини-игры и испытания. Общая капсула воспоминаний. Идеи для свиданий и
          подарков. Всё чтобы быть ближе — каждый день.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-smooth hover:scale-[1.02] hover:bg-primary/95"
          >
            Начать вместе
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-8 py-3.5 text-base font-semibold text-foreground backdrop-blur transition-smooth hover:bg-background"
          >
            Посмотреть демо
          </Link>
        </div>

        <ul className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { emoji: "💌", title: "Активность дня", text: "Вопрос, игра или задание для двоих" },
            { emoji: "📸", title: "Капсула", text: "Общая лента фото и записок" },
            { emoji: "🌹", title: "Идеи", text: "60+ свиданий и подарков под настроение" },
          ].map((f) => (
            <li
              key={f.title}
              className="rounded-3xl border border-border bg-card/80 p-5 text-left shadow-card backdrop-blur transition-smooth hover:shadow-soft"
            >
              <div className="mb-2 text-3xl">{f.emoji}</div>
              <p className="font-display text-lg font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
