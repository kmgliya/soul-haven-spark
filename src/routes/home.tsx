import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, daysTogether, ruDaysNoun, formatAnniversaryCalendar } from "@/lib/state";
import { dailyQuestions } from "@/lib/mock-data";
import { useMemo, useState, type CSSProperties } from "react";
import {
  ChevronRight,
  Flame,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Crown,
  Heart,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Дом — LoveSpace" }] }),
  component: HomePage,
});

function HomePage() {
  const [s] = useAppState();
  const days = daysTogether(s.startDate);
  const anniversaryLabel = formatAnniversaryCalendar(s.startDate);
  const question = dailyQuestions[0];
  const streakPct = Math.min(1, s.recordStreak ? s.streak / s.recordStreak : 0);
  const streakDash = Math.max(0.001, Math.min(0.999, streakPct));
  const [loveBurst, setLoveBurst] = useState(false);

  const loveParticles = useMemo(() => {
    return [
      { c: "#d4af37", dx: "-40px" },
      { c: "#e879a0", dx: "42px" },
      { c: "#c084fc", dx: "-14px" },
      { c: "#fb923c", dx: "18px" },
      { c: "rgba(212,175,55,0.7)", dx: "64px" },
      { c: "rgba(232,121,160,0.7)", dx: "-66px" },
      { c: "rgba(192,132,252,0.65)", dx: "6px" },
      { c: "rgba(251,146,60,0.7)", dx: "-6px" },
    ] as const;
  }, []);

  return (
    <AppShell>
      <div className="container-web page-pad">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
              Привет
            </h1>
            <p className="mt-2 text-muted-foreground font-medium">Сегодня прекрасный день.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <section className="relative overflow-hidden rounded-[28px] border border-border bg-card/75 p-7 text-foreground md:col-span-8 shadow-[0_18px_60px_rgba(11,18,32,0.14)] backdrop-blur-2xl">
            {/* верхняя золотая линия */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(92,200,255,0.55),rgba(255,121,198,0.45),transparent)]" />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-16 h-64 w-64 rounded-full bg-primary/18 blur-[55px]" />
              <div className="absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-[color:var(--pink-soft)] blur-[65px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/65 via-white/25 to-transparent" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <div className="flex -space-x-3">
                  <AvatarCircle img={s.me.avatarImage} fallback={s.me.emoji} />
                  <AvatarCircle img={s.partner.avatarImage} fallback={s.partner.emoji} />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setLoveBurst(true);
                      window.setTimeout(() => setLoveBurst(false), 1050);
                    }}
                    className="relative grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(212,80,120,0.4)] bg-[rgba(212,80,120,0.12)] transition-transform active:scale-95"
                    aria-label="Love"
                    title="Love"
                  >
                    <Heart size={18} className="text-[color:var(--pink)]" fill="currentColor" />
                  </button>

                  {loveBurst && (
                    <div className="pointer-events-none absolute left-1/2 top-1/2">
                      {loveParticles.map((p, i) => (
                        <span
                          key={i}
                          className="particle"
                          style={
                            {
                              background: p.c,
                              "--dx": p.dx,
                              left: 0,
                              top: 0,
                              animationDelay: `${i * 35}ms`,
                            } as CSSProperties
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-12">
                <span className="accent-text-shimmer block text-[88px] font-black leading-none tracking-[-0.08em]">
                  {days}
                </span>
                <p className="mt-2 text-[13px] font-semibold tracking-wide text-muted-foreground">
                  {ruDaysNoun(days)} вместе
                </p>
                {anniversaryLabel ? (
                  <p className="mt-1 text-[12px] font-medium text-muted-foreground/90">
                    С даты {anniversaryLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[18px] border border-border bg-card p-6 md:col-span-4 shadow-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.3)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[rgba(212,175,55,0.06)] blur-[30px]" />
            <div className="absolute -left-14 -bottom-14 h-48 w-48 rounded-full bg-[rgba(212,80,120,0.10)] blur-[40px]" />

            <div className="relative z-10 flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-background/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(212,175,55,0.6)]">
                  <Flame
                    size={14}
                    className="text-orange-400/90 [animation:float_2s_ease-in-out_infinite]"
                  />
                  Стрик
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-black tracking-[-0.08em] text-foreground">
                    {s.streak}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">дней</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/70">
                    <Crown size={14} className="text-primary" />
                    Рекорд: {s.recordStreak}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[rgba(212,80,120,0.15)] px-3 py-1 text-xs font-bold text-[color:var(--pink)]">
                    +{Math.max(0, s.streak - 1)} сегодня
                  </span>
                </div>
              </div>

              {/* Мини-прогресс к рекорду */}
              <div className="shrink-0">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg viewBox="0 0 44 44" className="h-16 w-16 -rotate-90" aria-hidden="true">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="transparent"
                      className="stroke-border"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="transparent"
                      className="stroke-[color:color-mix(in_oklab,var(--primary)_70%,#fb7185_30%)]"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.round(2 * Math.PI * 18 * streakDash)} ${Math.round(
                        2 * Math.PI * 18 * (1 - streakDash),
                      )}`}
                    />
                  </svg>

                  {/* очень тонкая розовая "искра" внутри круга */}
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="relative h-10 w-10">
                      <div className="streak-spark absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400/90 blur-[0.2px] shadow-[0_0_14px_rgba(251,113,133,0.35)]" />
                        <span className="absolute left-1/2 top-1/2 h-4 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-rose-300/0 via-rose-300/80 to-rose-400/0" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-background/65 backdrop-blur-xl shadow-sm">
                      <span className="text-[12px] font-black text-foreground">
                        {Math.round(streakPct * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 w-16 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-primary"
                    style={{ width: `${Math.round(streakPct * 100)}%` }}
                  />
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

function AvatarCircle({ img, fallback }: { img?: string; fallback: string }) {
  return (
    <div className="flex h-14 w-14 overflow-hidden rounded-full border-4 border-primary bg-white/20 text-2xl backdrop-blur-md">
      {img ? (
        <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">{fallback}</div>
      )}
    </div>
  );
}
