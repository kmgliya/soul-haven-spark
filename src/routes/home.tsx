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
} from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Дом — LoveSpace" }] }),
  component: HomePage,
});

function HomePage() {
  const [s] = useAppState();
  const days = daysTogether(s.startDate);
  const question = dailyQuestions[0];

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

          <section className="flex flex-col items-center justify-center rounded-[40px] border border-border bg-card p-8 md:col-span-4 shadow-sm">
            <Flame size={48} className="text-orange-500" fill="currentColor" />
            <p className="mt-4 text-5xl font-black text-foreground">{s.streak}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Стрик
            </p>
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