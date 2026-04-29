import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dateIdeas, giftIdeas, psychologists, dailyQuestions36 } from "@/lib/mock-data";
import { Heart, Gift, MessageCircle, ShieldCheck, ArrowUpRight, Lock, Check } from "lucide-react";
import { useAppState } from "@/lib/state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
        <div
          key={d.id}
          className="group relative overflow-hidden rounded-[16px] border border-border bg-card p-6 shadow-sm transition-all duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.02] hover:border-[rgba(212,100,150,0.3)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(212,100,150,0.06), transparent 60%)" }} />
          <div className="mb-4 flex gap-2">
            {d.tags.map(t => (
              <span key={t} className="rounded-[6px] bg-[rgba(212,100,150,0.12)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-[rgba(212,100,150,0.9)]">
                {t}
              </span>
            ))}
          </div>
          <h3 className="relative text-[14px] font-semibold leading-snug text-foreground">{d.title}</h3>
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
  const [s, set] = useAppState();
  const [role, setRole] = useState<"me" | "partner">("me");

  function saveAnswer(id: string, value: string) {
    set((prev) => ({
      q36: {
        ...prev.q36,
        [id]: {
          ...(prev.q36[id] ?? {}),
          [role]: value,
        },
      },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          value={role}
          onValueChange={(v) => (v === "me" || v === "partner") && setRole(v)}
          className="rounded-[22px] border border-border bg-background/70 p-1.5 backdrop-blur-xl shadow-sm"
        >
          <ToggleGroupItem
            value="me"
            className="h-10 rounded-[18px] px-4 text-xs font-black uppercase tracking-[0.16em]"
          >
            {s.me.emoji} {s.me.name}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="partner"
            className="h-10 rounded-[18px] px-4 text-xs font-black uppercase tracking-[0.16em]"
          >
            {s.partner.emoji} {s.partner.name}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {dailyQuestions36.map((q) => {
        const entry = s.q36[q.id] ?? {};
        const my = entry[role] ?? "";
        const otherRole = role === "me" ? "partner" : "me";
        const other = entry[otherRole] ?? "";
        const canShowPartnerBlock = Boolean(my.trim());
        const meDone = Boolean(entry.me?.trim());
        const partnerDone = Boolean(entry.partner?.trim());
        const bothDone = meDone && partnerDone;

        return (
          <div
            key={q.id}
            className="group relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-primary/12 blur-[40px]" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[50px]" />

            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-start gap-5">
                <div className="shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-border bg-background/70 text-sm font-black text-muted-foreground">
                    {q.id}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-border ${
                        meDone ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground"
                      }`}
                      title="Ты"
                    >
                      {meDone ? <Check size={12} /> : <span className="text-[10px] font-black">{s.me.emoji}</span>}
                    </span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-border ${
                        partnerDone ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground"
                      }`}
                      title="Партнёр"
                    >
                      {partnerDone ? (
                        <Check size={12} />
                      ) : (
                        <span className="text-[10px] font-black">{s.partner.emoji}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-lg font-bold leading-snug text-foreground">{q.text}</p>
                  {bothDone ? (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">Оба ответили — можно сравнивать.</p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      Ответ партнёра появится справа сразу после твоего ответа.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-background/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {role === "me" ? "Твой ответ" : "Ответ партнёра (ввод)"}{" "}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {my.trim() ? "сохранено" : "черновик"}
                    </span>
                  </div>
                  <textarea
                    value={my}
                    onChange={(e) => saveAnswer(q.id, e.target.value)}
                    rows={4}
                    className="mt-3 w-full resize-none rounded-[18px] border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    placeholder="Напиши честно и мягко…"
                  />
                </div>

                <div className="rounded-[24px] border border-border bg-background/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {role === "me" ? "Ответ партнёра" : "Твой ответ (просмотр)"}
                    </p>
                    {!other.trim() ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                        <Lock size={12} />
                        {canShowPartnerBlock ? "ожидаем" : "закрыто"}
                      </span>
                    ) : null}
                  </div>

                  {other.trim() ? (
                    <p className="mt-3 whitespace-pre-wrap rounded-[18px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
                      {other}
                    </p>
                  ) : (
                    <div className="mt-3 rounded-[18px] border border-border bg-card p-4">
                      {!canShowPartnerBlock ? (
                        <div className="flex items-center justify-center py-6 text-center">
                          <div className="max-w-[260px]">
                            <p className="text-sm font-bold text-foreground">Сначала ответь ты</p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                              Тогда рядом откроется блок с ответом партнёра.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-foreground">Партнёр отвечает…</p>
                          <p className="text-xs font-medium text-muted-foreground">
                            Пока можно увидеть пример формата ответа:
                          </p>
                          <div className="rounded-[16px] border border-border bg-background/70 px-4 py-3">
                            <p className="text-sm font-medium text-muted-foreground/90">
                              “Я бы пригласил(а) тебя. Потому что с тобой любой ужин — праздник.”
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
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