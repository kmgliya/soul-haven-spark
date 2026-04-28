import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dateIdeas, giftIdeas, psychologists, dailyQuestions36 } from "@/lib/mock-data";
import { Search, Heart, Gift, MessageCircle, ShieldCheck, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/ideas")({
  head: () => ({
    meta: [{ title: "Идеи — LoveSpace" }],
  }),
  component: IdeasPage,
});

type Tab = "dates" | "gifts" | "36q" | "psy";

function IdeasPage() {
  const [tab, setTab] = useState<Tab>("dates");

  const tabs = [
    { id: "dates", label: "Свидания", icon: Heart },
    { id: "gifts", label: "Подарки", icon: Gift },
    { id: "36q", label: "36 Вопросов", icon: MessageCircle },
    { id: "psy", label: "Профи", icon: ShieldCheck },
  ] as const;

  return (
    <AppShell>
      <div className="container-web page-pad">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Вдохновение</h1>
          <p className="mt-2 text-muted-foreground font-medium">Новые способы стать ближе сегодня.</p>
        </header>

        {/* Премиальный Таб-бар */}
        <div className="sticky top-4 z-30 mb-10 flex justify-center">
          <div className="flex gap-1 rounded-3xl border border-border bg-background/70 p-1.5 backdrop-blur-2xl shadow-sm">
            {tabs.map((t) => {
              const ActiveIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <ActiveIcon size={16} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {tab === "dates" && <DatesTab />}
          {tab === "gifts" && <GiftsTab />}
          {tab === "36q" && <Questions36Tab />}
          {tab === "psy" && <PsyTab />}
        </main>
      </div>
    </AppShell>
  );
}

function DatesTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dateIdeas.map((d) => (
        <div key={d.id} className="group relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent">
          <div className="mb-4 flex gap-2">
            {d.tags.map(t => (
              <span key={t} className="rounded-full bg-accent px-3 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t}</span>
            ))}
          </div>
          <h3 className="text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">{d.title}</h3>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{d.budget === 'low' ? 'Доступно' : d.budget === 'mid' ? 'Средне' : 'Премиум'}</span>
            <div className="h-10 w-10 rounded-full border border-border bg-background/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
               <ArrowUpRight size={18} className="text-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GiftsTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {giftIdeas.map((g) => (
        <div key={g.id} className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
             <Gift size={24} />
          </div>
          <h3 className="text-2xl font-bold text-foreground leading-tight">{g.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-[0.1em] font-semibold">Повод: {g.occasion}</p>
        </div>
      ))}
    </div>
  );
}

function Questions36Tab() {
  return (
    <div className="space-y-4">
      {dailyQuestions36.map((q) => (
        <div key={q.id} className="flex gap-6 rounded-[32px] border border-border bg-card p-6 items-center group shadow-sm transition-colors hover:bg-accent">
          <span className="font-display text-4xl font-black text-muted-foreground/20 group-hover:text-primary/30 transition-colors">{q.id}</span>
          <p className="text-lg font-medium text-foreground leading-snug">{q.text}</p>
        </div>
      ))}
    </div>
  );
}

function PsyTab() {
  return (
    <div className="grid gap-4">
      {psychologists.map((p) => (
        <div key={p.id} className="flex flex-col md:flex-row items-center gap-6 rounded-[40px] border border-border bg-card p-8 shadow-sm">
          <div className="h-24 w-24 shrink-0 rounded-[32px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl shadow-xl">
            {p.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-foreground">{p.name}</h3>
            <p className="text-primary font-medium">{p.focus}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
               <div className="text-center">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">Опыт</p>
                 <p className="text-foreground font-bold">{p.experience}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">Цена</p>
                 <p className="text-foreground font-bold">{p.price}</p>
               </div>
            </div>
          </div>
          <button className="w-full md:w-auto px-10 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.99] transition-all shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.18)]">
            Записаться
          </button>
        </div>
      ))}
    </div>
  );
}