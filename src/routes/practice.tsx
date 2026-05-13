import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { useAuth } from "@/lib/auth";
import { saveQ36Answer } from "@/lib/q36-remote";
import { challenges, dailyQuestions36 } from "@/lib/mock-data";
import { q36Completion, Q36_TOTAL } from "@/lib/q36-progress";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Trophy, MessageCircle, Check, Lock, Users } from "lucide-react";

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
  const { user } = useAuth();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const coupleId = s.coupleId;
  const partnerUid = s.partnerUid;

  const comp = useMemo(() => q36Completion(s.q36), [s.q36]);
  const reveal = comp.revealPartnerAnswers;

  const persist = useCallback(
    (qid: string, text: string) => {
      if (!coupleId || !user) {
        toast.error("Создай пару в онбординге — тогда ответы сохранятся и увидит партнёр.");
        return;
      }
      void saveQ36Answer(coupleId, user.uid, qid, text).catch((err) => {
        toast.error(err instanceof Error ? err.message : "Не удалось сохранить ответ.");
      });
    },
    [coupleId, user],
  );

  function onAnswerChange(qid: string, text: string) {
    set((prev) => ({
      q36: {
        ...prev.q36,
        [qid]: { ...(prev.q36[qid] ?? {}), me: text },
      },
    }));
    window.clearTimeout(timers.current[qid]);
    timers.current[qid] = window.setTimeout(() => persist(qid, text), 650);
  }

  function onAnswerBlur(qid: string, text: string) {
    window.clearTimeout(timers.current[qid]);
    persist(qid, text);
  }

  const roundTitle: Record<number, string> = {
    1: "Блок 1 — тепло и ритуалы",
    2: "Блок 2 — быт, границы, команда",
    3: "Блок 3 — мечты и честность",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card/80 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Users size={20} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {!coupleId ? (
              <p className="text-sm font-semibold text-foreground">
                Ответы пока только на этом устройстве. Пройди онбординг и создай пару — тогда
                синхронизация включится.
              </p>
            ) : !partnerUid ? (
              <p className="text-sm font-semibold text-foreground">
                Партнёр ещё не в паре по коду. Когда присоединится, вы сможете пройти все 36
                вопросов; ответы партнёра станут видны только после того, как вы оба ответите на все
                вопросы.
              </p>
            ) : reveal ? (
              <p className="text-sm font-semibold text-foreground">
                Вы оба ответили на все {Q36_TOTAL} вопросов — справа по каждому пункту виден текст
                партнёра.
              </p>
            ) : comp.meAll && !comp.partnerAll ? (
              <p className="text-sm font-semibold text-foreground">
                Ты ответил(а) на все {Q36_TOTAL}. Ответы партнёра откроются только когда партнёр
                тоже заполнит все вопросы ({comp.partner}/{Q36_TOTAL}).
              </p>
            ) : comp.partnerAll && !comp.meAll ? (
              <p className="text-sm font-semibold text-foreground">
                Партнёр уже ответил на все {Q36_TOTAL}. Допиши свои ответы на оставшиеся пункты —
                затем откроются все ответы партнёра ({comp.my}/{Q36_TOTAL}).
              </p>
            ) : (
              <p className="text-sm font-semibold text-foreground">
                Ответы партнёра скрыты, пока вы оба не ответите на все {Q36_TOTAL} вопросов. Так
                никто не подглядывает заранее.
              </p>
            )}
            <p className="text-xs font-medium text-muted-foreground">
              Прогресс: ты <span className="font-bold text-foreground">{comp.my}</span> /{" "}
              {Q36_TOTAL} · партнёр{" "}
              <span className="font-bold text-foreground">{comp.partner}</span> / {Q36_TOTAL}
            </p>
          </div>
        </div>
      </div>

      {[1, 2, 3].map((round) => (
        <div key={round} className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              {roundTitle[round]}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {dailyQuestions36
            .filter((q) => q.round === round)
            .map((q) => {
              const id = String(q.id);
              const entry = s.q36[id] ?? {};
              const my = entry.me ?? "";
              const partner = entry.partner ?? "";
              const meDone = Boolean(my.trim());
              const partnerDone = Boolean(partner.trim());
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
                            title={s.me.name}
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
                            title={s.partner.name}
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
                        {reveal && bothDone ? (
                          <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            Оба ответили на этот пункт — текст партнёра открыт.
                          </p>
                        ) : reveal && !bothDone ? (
                          <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            Финал пройден; по этому номеру у кого-то пусто — можно дописать.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            Ответ партнёра по этому вопросу откроется только когда вы оба ответите
                            на все {Q36_TOTAL} вопросов.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[24px] border border-border bg-background/70 p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            {s.me.name} — твой ответ
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                            {my.trim() ? "сохранится" : "черновик"}
                          </span>
                        </div>
                        <textarea
                          value={my}
                          onChange={(e) => onAnswerChange(id, e.target.value)}
                          onBlur={(e) => onAnswerBlur(id, e.target.value)}
                          rows={4}
                          className="mt-3 w-full resize-none rounded-[18px] border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                          placeholder="Напиши честно и мягко…"
                        />
                      </div>

                      <div className="rounded-[24px] border border-border bg-background/70 p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            {s.partner.name}
                          </p>
                          {!partnerDone ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                              <Lock size={12} />
                              пусто
                            </span>
                          ) : !reveal ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                              <Lock size={12} />
                              скрыто
                            </span>
                          ) : null}
                        </div>

                        {reveal && partner.trim() ? (
                          <p className="mt-3 whitespace-pre-wrap rounded-[18px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
                            {partner}
                          </p>
                        ) : reveal && !partner.trim() ? (
                          <div className="mt-3 rounded-[18px] border border-border bg-card p-4">
                            <p className="text-center text-sm font-medium text-muted-foreground">
                              Партнёр не оставил текст на этот пункт.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-[18px] border border-border bg-card p-4">
                            <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
                              {!partnerUid ? (
                                <p className="max-w-[280px] text-sm font-medium text-muted-foreground">
                                  После присоединения партнёра по коду вы сможете пройти все
                                  вопросы; ответы откроются после двух полных серий из {Q36_TOTAL}.
                                </p>
                              ) : partnerDone ? (
                                <div className="max-w-[280px] space-y-1">
                                  <p className="text-sm font-bold text-foreground">
                                    Ответ партнёра уже есть
                                  </p>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Текст скрыт до тех пор, пока вы оба не ответите на все{" "}
                                    {Q36_TOTAL} вопросов.
                                  </p>
                                </div>
                              ) : meDone ? (
                                <div className="max-w-[280px] space-y-1">
                                  <p className="text-sm font-bold text-foreground">
                                    Партнёр ещё не ответил
                                  </p>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Когда партнёр закроет все {Q36_TOTAL} и ты тоже — откроются все
                                    ответы.
                                  </p>
                                </div>
                              ) : (
                                <div className="max-w-[280px] space-y-1">
                                  <p className="text-sm font-bold text-foreground">
                                    Сначала твой ответ слева
                                  </p>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Ответы партнёра появятся одним блоком после двух полных серий.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
