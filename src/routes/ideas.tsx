import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dateIdeas, giftIdeas } from "@/lib/mock-data";
import { Heart, Gift, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/ideas")({
  head: () => ({
    meta: [{ title: "Идеи — LoveSpace" }],
  }),
  component: IdeasPage,
});

type Tab = "dates" | "gifts";

function IdeasPage() {
  const [tab, setTab] = useState<Tab>("dates");

  const tabs = [
    { id: "dates", label: "Свидания", icon: Heart },
    { id: "gifts", label: "Подарки", icon: Gift },
  ] as const;

  return (
    <AppShell>
      <div className="container-web page-pad">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
            Вдохновение
          </h1>
          <p className="mt-2 text-muted-foreground font-medium">
            Новые способы стать ближе сегодня.
          </p>
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
        </main>
      </div>
    </AppShell>
  );
}

function DatesTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dateIdeas.map((d) => (
        <div
          key={d.id}
          className="group relative overflow-hidden rounded-[16px] border border-border bg-card p-6 shadow-sm transition-all duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] hover:border-[rgba(212,100,150,0.3)]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(ellipse at 80% 20%, rgba(212,100,150,0.06), transparent 60%)",
            }}
          />
          <div className="mb-4 flex gap-2">
            {d.tags.map((t) => (
              <span
                key={t}
                className="rounded-[6px] bg-[rgba(212,100,150,0.12)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[rgba(212,100,150,0.9)]"
              >
                {t}
              </span>
            ))}
          </div>
          <h3 className="relative text-[14px] font-semibold leading-snug text-foreground">
            {d.title}
          </h3>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {d.budget === "low" ? "Доступно" : d.budget === "mid" ? "Средне" : "Премиум"}
            </span>
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
          <p className="mt-2 text-sm text-muted-foreground uppercase tracking-[0.1em] font-semibold">
            Повод: {g.occasion}
          </p>
        </div>
      ))}
    </div>
  );
}

// 36 вопросов и специалисты перенесены в /practice и /psychology
