import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState } from "@/lib/state";
import { Heart, Sparkles, Shield, ArrowRight, MessageCircle, Zap, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LoveSpace — пространство для вашей пары" },
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Анимированный фон */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[800px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.16)_0,transparent_70%)]" />
      
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Heart fill="currentColor" size={20} className="text-primary-foreground" />
           </div>
           <span className="font-display text-2xl font-black tracking-tighter">LoveSpace</span>
        </div>
        <Link
          to="/onboarding"
          className="rounded-2xl border border-border bg-background/70 px-6 py-2.5 text-sm font-bold backdrop-blur-xl transition-all hover:bg-accent"
        >
          Войти
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-32 text-center md:pt-32">
        <h1 className="font-display text-6xl font-black leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl">
          Станьте <br />
          <span className="bg-gradient-to-b from-primary to-indigo-500 bg-clip-text text-transparent">Ближе</span>
        </h1>

        {/* Couple Joy style floating pills */}
        <div className="relative mx-auto mt-10 hidden max-w-3xl md:block">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[70px] animate-orb-drift" />
          </div>
          {[
            { label: "Вопрос дня", icon: MessageCircle, left: "8%", top: "18%" },
            { label: "Угадай партнёра", icon: Target, left: "62%", top: "12%" },
            { label: "Задание дня", icon: Zap, left: "12%", top: "58%" },
            { label: "Капсула", icon: Heart, left: "68%", top: "56%" },
          ].map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="pointer-events-none absolute rounded-full border border-border bg-background/80 px-5 py-2.5 text-sm font-bold text-foreground shadow-sm backdrop-blur-xl animate-orb-drift"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: `${-idx * 2.4}s`,
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  {p.label}
                </span>
              </div>
            );
          })}
          <div className="h-40" />
        </div>

        <p className="mx-auto mt-10 max-w-xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
          LoveSpace — это ваш цифровой дом. Ежедневные ритуалы, общие воспоминания и бесконечные идеи для свиданий.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/onboarding"
            className="group flex h-16 w-full items-center justify-center gap-3 rounded-[24px] bg-primary px-10 text-lg font-black text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 sm:w-auto"
          >
            Начать историю
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/home"
            className="flex h-16 w-full items-center justify-center rounded-[24px] border border-border bg-card px-10 text-lg font-bold text-foreground shadow-sm transition-all hover:bg-accent sm:w-auto"
          >
            Посмотреть демо
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {[
            {
              title: "Ритуалы",
              desc: "Вопросы дня и совместные задания для поддержания искры.",
              icon: Sparkles
            },
            {
              title: "Капсула",
              desc: "Ваша личная лента моментов, которая всегда под рукой.",
              icon: Heart
            },
            {
              title: "Приключения",
              desc: "Сотни идей для свиданий, разделенных по бюджету и настроению.",
              icon: Shield
            }
          ].map((f) => (
            <div key={f.title} className="rounded-[40px] border border-border bg-card p-10 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Футер-свечение */}
      <div className="absolute bottom-0 left-1/2 h-[300px] w-full -translate-x-1/2 bg-primary/10 blur-[120px]" />
    </div>
  );
}