import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { dateIdeas, giftIdeas, psychologists, questions36 } from "@/lib/mock-data";

export const Route = createFileRoute("/ideas")({
  head: () => ({
    meta: [
      { title: "Идеи — LoveSpace" },
      {
        name: "description",
        content: "Идеи для свиданий, подарков, протокол 36 вопросов и контакты психологов.",
      },
    ],
  }),
  component: IdeasPage,
});

type Tab = "dates" | "gifts" | "36q" | "psy";

function IdeasPage() {
  const [tab, setTab] = useState<Tab>("dates");
  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "dates", label: "Свидания", emoji: "🌹" },
    { id: "gifts", label: "Подарки", emoji: "🎁" },
    { id: "36q", label: "36 вопросов", emoji: "💬" },
    { id: "psy", label: "Психологи", emoji: "🧠" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Идеи" subtitle="Вдохновение для вашей пары" />

        <div className="sticky top-0 z-10 overflow-x-auto bg-background/85 px-5 py-2 backdrop-blur-md md:px-8">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-smooth"
                style={{
                  borderColor: tab === t.id ? "var(--color-primary)" : "var(--color-border)",
                  background: tab === t.id ? "var(--color-primary)" : "var(--color-card)",
                  color:
                    tab === t.id ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-12 md:px-8">
          {tab === "dates" && <DatesTab />}
          {tab === "gifts" && <GiftsTab />}
          {tab === "36q" && <Questions36Tab />}
          {tab === "psy" && <PsyTab />}
        </div>
      </div>
    </AppShell>
  );
}

function DatesTab() {
  const [budget, setBudget] = useState<string>("all");
  const filtered = budget === "all" ? dateIdeas : dateIdeas.filter((d) => d.budget === budget);
  return (
    <section className="animate-float-up">
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { v: "all", l: "Все" },
          { v: "free", l: "Бесплатно" },
          { v: "low", l: "До 2000 ₽" },
          { v: "mid", l: "2-10к" },
          { v: "high", l: "10к+" },
        ].map((b) => (
          <button
            key={b.v}
            onClick={() => setBudget(b.v)}
            className="rounded-full border px-3 py-1 text-xs font-semibold transition-smooth"
            style={{
              borderColor: budget === b.v ? "var(--color-primary)" : "var(--color-border)",
              background: budget === b.v ? "var(--color-secondary)" : "transparent",
            }}
          >
            {b.l}
          </button>
        ))}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {filtered.map((d) => (
          <li
            key={d.id}
            className="rounded-3xl border border-border bg-card p-5 shadow-card transition-smooth hover:shadow-soft"
          >
            <div className="text-2xl">🌹</div>
            <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{d.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GiftsTab() {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 animate-float-up">
      {giftIdeas.map((g) => (
        <li key={g.id} className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="text-2xl">🎁</div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{g.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Повод: {g.occasion} · Бюджет: {g.budget}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Questions36Tab() {
  const [open, setOpen] = useState<number | null>(null);
  const rounds = [1, 2, 3] as const;
  return (
    <section className="mt-4 animate-float-up">
      {rounds.map((r) => (
        <div key={r} className="mb-6">
          <h3 className="font-display text-xl font-semibold">Раунд {r}</h3>
          <p className="text-xs text-muted-foreground">12 вопросов</p>
          <ul className="mt-3 flex flex-col gap-2">
            {questions36
              .filter((q) => q.round === r)
              .map((q) => (
                <li key={q.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <button
                    onClick={() => setOpen(open === q.id ? null : q.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
                  >
                    <span>
                      <span className="text-muted-foreground">#{q.id}</span> {q.text}
                    </span>
                    <span>{open === q.id ? "−" : "+"}</span>
                  </button>
                  {open === q.id && (
                    <div className="border-t border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Обсудите ответы вслух. Не торопитесь — это часть протокола сближения.
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function PsyTab() {
  return (
    <ul className="mt-4 flex flex-col gap-3 animate-float-up">
      {psychologists.map((p) => (
        <li key={p.id} className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-soft text-xl">
              🧠
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.focus}</p>
              <p className="mt-1 text-xs font-semibold text-primary">{p.price}</p>
            </div>
          </div>
          <button className="mt-4 w-full rounded-full border border-primary py-2 text-sm font-semibold text-primary transition-smooth hover:bg-primary hover:text-primary-foreground">
            Записаться
          </button>
        </li>
      ))}
    </ul>
  );
}
