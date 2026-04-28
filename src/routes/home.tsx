import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, daysTogether } from "@/lib/state";
import { dailyQuestions } from "@/lib/mock-data";
import {
  ChevronRight,
  Flame,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Crown,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Дом — LoveSpace" }] }),
  component: HomePage,
});

function HomePage() {
  const [s] = useAppState();
  const days = daysTogether(s.startDate);
  const question = dailyQuestions[0];
  const streakPct = Math.min(1, s.recordStreak ? s.streak / s.recordStreak : 0);

  return (
    <AppShell>
      <div className="container-web page-pad">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Привет</h1>
            <p className="mt-2 text-muted-foreground font-medium">Сегодня прекрасный день.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <section className="relative overflow-hidden rounded-[40px] bg-primary p-8 text-primary-foreground md:col-span-8 shadow-[0_18px_60px_rgba(var(--color-primary-rgb),0.25)]">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary bg-white/20 text-2xl backdrop-blur-md">
                    {s.me.emoji}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary bg-white/20 text-2xl backdrop-blur-md">
                    {s.partner.emoji}
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <span className="text-[120px] font-black leading-none tracking-tighter">{days}</span>
                <p className="text-xl font-semibold text-primary-foreground/70">дней вместе</p>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-white/15 blur-[80px]" />
          </section>

          <section className="relative overflow-hidden rounded-[40px] border border-border bg-card p-8 md:col-span-4 shadow-sm">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/15 blur-[30px]" />
            <div className="absolute -left-14 -bottom-14 h-48 w-48 rounded-full bg-primary/10 blur-[40px]" />

            <div className="relative z-10 flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  <Flame size={12} className="text-orange-500" />
                  Стрик
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-black tracking-tight text-foreground">
                    {s.streak}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">дней</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-700">
                    <Crown size={14} className="text-orange-600" />
                    Рекорд: {s.recordStreak}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    +{Math.max(0, s.streak - 1)} сегодня
                  </span>
                </div>
              </div>

              {/* Мини-прогресс к рекорду */}
              <div className="shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-border bg-background/70 shadow-sm">
                  <span className="text-sm font-black text-foreground">{Math.round(streakPct * 100)}%</span>
                </div>
                <div className="mt-3 h-2 w-16 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-primary" style={{ width: `${Math.round(streakPct * 100)}%` }} />
                </div>
              </div>
            </div>
          </section>

          <Link
            to="/today"
            className="group relative overflow-hidden rounded-[40px] border border-border bg-card p-8 shadow-sm transition-colors hover:bg-accent md:col-span-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Вопрос дня
              </span>
              <ArrowRight size={18} className="text-primary" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
              {question}
            </h3>
          </Link>

          <Link
            to="/capsule"
            className="flex flex-col justify-between rounded-[40px] border border-border bg-card p-8 shadow-sm transition-colors hover:bg-accent md:col-span-6"
          >
            <ImageIcon size={24} className="text-primary" />
            <div className="mt-6">
              <p className="text-2xl font-black text-foreground">{s.capsule.length}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Моментов в капсуле
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}