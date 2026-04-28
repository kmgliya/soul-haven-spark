import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getState } from "@/lib/state";
import { Heart, Sparkles, Shield, ArrowRight } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import {
  BentoCell,
  BentoGrid,
  ContainerScale,
  ContainerScroll,
} from "@/components/blocks/hero-gallery-scroll-animation";

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

  const heroImages = [
    "https://images.unsplash.com/photo-1520975975674-868d78a83d99?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291cGxlJTIwY2l0eXxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1520975720426-2fd85dca4b17?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y291cGxlJTIwaGFuZHMlMjBob2xkaW5nfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1520975693412-35a9d2b7c6f9?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Y291cGxlJTIwc3Vuc2V0fGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0fGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1520975745789-6d8d114e6f21?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvdXBsZSUyMGh1Z3xlbnwwfHwwfHx8MA%3D%3D",
  ];

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

        {/* Scroll hero animation (visual only) */}
        <div className="mt-28">
          <ClientOnly
            fallback={
              <div className="rounded-[40px] border border-border bg-card p-10 text-center shadow-sm">
                <p className="text-sm font-semibold text-muted-foreground">
                  Загружаем анимацию…
                </p>
              </div>
            }
          >
            <ContainerScroll className="h-[240vh]">
              <BentoGrid className="sticky left-0 top-0 z-0 h-[calc(100vh-1px)] w-full p-4 md:p-10">
                {heroImages.map((imageUrl, index) => (
                  <BentoCell
                    key={index}
                    className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_60px_rgba(17,24,39,0.12)]"
                  >
                    <img className="size-full object-cover object-center" src={imageUrl} alt="" />
                  </BentoCell>
                ))}
              </BentoGrid>

              <ContainerScale className="relative z-10 text-center px-6">
                <div className="mx-auto max-w-xl rounded-[40px] border border-border bg-background/70 p-8 backdrop-blur-2xl shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Couple Joy vibe
                  </p>
                  <h2 className="mt-4 font-display text-4xl font-black tracking-tight">
                    Ближе — это про маленькие действия
                  </h2>
                  <p className="mt-3 text-sm font-medium text-muted-foreground md:text-base">
                    Вопрос дня, мини‑игра, задание, капсула — всё в одном ритме. Никакой лишней сложности, только вау‑ощущение.
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      to="/onboarding"
                      className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.18)] transition-transform hover:scale-[1.02] active:scale-[0.99]"
                    >
                      Начать
                    </Link>
                    <Link
                      to="/home"
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-bold text-foreground transition-colors hover:bg-accent"
                    >
                      Демо
                    </Link>
                  </div>
                </div>
              </ContainerScale>
            </ContainerScroll>
          </ClientOnly>
        </div>
      </main>

      {/* Футер-свечение */}
      <div className="absolute bottom-0 left-1/2 h-[300px] w-full -translate-x-1/2 bg-primary/10 blur-[120px]" />
    </div>
  );
}