import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { challenges, dailyQuestions36 } from "@/lib/mock-data";
import { useState } from "react";
import { Trophy, MessageCircle, Check, Lock } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [{ title: "Практика — LoveSpace" }],
  }),
  component: PracticePage,
});

type Tab = "challenge" | "36q";

function PracticePage() {
  const [tab, setTab] = useState<Tab>("challenge");

  const tabs = [
    { id: "challenge", label: "Испытания", icon: Trophy },
    { id: "36q", label: "36 вопросов", icon: MessageCircle },
  ] as const;

  return (
    <AppShell>
      <div className="container-web page-pad max-w-5xl">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
            Практика
          </h1>
          <p className="mt-2 text-muted-foreground font-medium">
            Небольшие шаги, которые делают вас ближе.
          </p>
        </header>

        <div className="sticky top-4 z-30 mb-10 flex justify-center">
          <div className="flex gap-1 rounded-3xl border border-border bg-background/70 p-1.5 backdrop-blur-2xl shadow-sm">
            {tabs.map((t) => {
              const Icon = t.icon;
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
                  <Icon size={16} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {tab === "challenge" && <Challenges />}
          {tab === "36q" && <Questions36 />}
        </main>
      </div>
    </AppShell>
  );
}

function Challenges() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {challenges.map((c) => (
        <div
          key={c.id}
          className="group flex flex-col justify-between rounded-[40px] border border-border bg-card p-8 shadow-sm transition-all hover:border-primary/25 hover:bg-accent/60"
        >
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              {c.title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.description}</p>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {c.days} ДНЕЙ
            </span>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
              <Check size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Questions36() {
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
                        meDone
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/70 text-muted-foreground"
                      }`}
                      title="Ты"
                    >
                      {meDone ? (
                        <Check size={12} />
                      ) : (
                        <span className="text-[10px] font-black">я</span>
                      )}
                    </span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-border ${
                        partnerDone
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/70 text-muted-foreground"
                      }`}
                      title="Партнёр"
                    >
                      {partnerDone ? (
                        <Check size={12} />
                      ) : (
                        <span className="text-[10px] font-black">2</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-lg font-bold leading-snug text-foreground">{q.text}</p>
                  {bothDone ? (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      Оба ответили — можно сравнивать.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      Ответ партнёра появится справа после твоего ответа.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-background/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      {role === "me" ? "Твой ответ" : "Ответ партнёра (ввод)"}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {my.trim() ? "сохранено" : "черновик"}
                    </span>
                  </div>
                  <textarea
                    value={my}
                    onChange={(e) => saveAnswer(String(q.id), e.target.value)}
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
                              “Я бы пригласил(а) тебя. Потому что с тобой любой разговор — теплый.”
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
