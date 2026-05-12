import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { dailyQuestions, dailyTasks, dailyQuestionsGame } from "@/lib/mock-data";
import { MessageCircle, Target, Zap, Flame, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  ensureDayBase,
  requestNudge,
  submitQuestionAnswer,
  submitGuessPick,
  subscribeDay,
  todayId,
  type DayDoc,
} from "@/lib/day";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [{ title: "Сегодня — LoveSpace" }],
  }),
  component: TodayPage,
});

type Tab = "question" | "guess" | "task";

function TodayPage() {
  const [tab, setTab] = useState<Tab>("question");
  const { user } = useAuth();
  const [s] = useAppState();
  const coupleId = s.coupleId;
  const dayId = todayId();
  const [day, setDay] = useState<DayDoc | null>(null);
  const lastNudgeTsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!coupleId) return;
    const q = dailyQuestions[new Date().getDate() % dailyQuestions.length];
    void ensureDayBase({ coupleId, dayId, question: q, guessVersion: 1 });
  }, [coupleId, dayId]);

  useEffect(() => {
    if (!coupleId) return;
    const unsub = subscribeDay(
      coupleId,
      dayId,
      (d) => setDay(d),
      (err) => {
        if (import.meta.env.DEV) console.warn("[today] subscribeDay error", err);
      },
    );
    return () => unsub();
  }, [coupleId, dayId]);

  // In-app уведомление партнёру: если его "пнули"
  useEffect(() => {
    if (!user) return;
    const ts = day?.nudges?.requestedAt?.[user.uid];
    if (!ts) return;
    const key = JSON.stringify(ts);
    if (lastNudgeTsRef.current === key) return;
    lastNudgeTsRef.current = key;
    const from = day?.nudges?.from?.[user.uid];
    toast("Партнёр ждёт", {
      description: from ? "Он уже прошёл — твоя очередь." : "Твоя очередь пройти активность.",
    });
  }, [day?.nudges?.requestedAt, day?.nudges?.from, user]);

  const tabs = [
    { id: "question", label: "Вопрос", icon: MessageCircle },
    { id: "guess", label: "Угадай", icon: Target },
    { id: "task", label: "Задание", icon: Zap },
  ] as const;

  return (
    <AppShell>
      <div className="container-web page-pad max-w-5xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-primary/15 via-fuchsia-500/10 to-primary/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary chip-shimmer">
            <Flame size={12} className="text-primary" /> Активный день
          </div>
          <h1 className="font-display text-5xl font-black tracking-tight text-foreground">
            Для вас двоих
          </h1>
        </header>

        <div className="sticky top-4 z-40 mb-12 flex justify-center">
          <div className="flex gap-1 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-background p-[5px]">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-[10px] px-5 py-3 text-[12px] font-semibold tracking-[0.02em] transition-all duration-200 ${
                    tab === t.id
                      ? "bg-[color:color-mix(in_oklab,var(--primary)_18%,transparent)] text-primary border border-[color:color-mix(in_oklab,var(--primary)_30%,transparent)] scale-[1.02]"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {tab === "question" && <QuestionTab day={day} />}
          {tab === "guess" && <GuessTab day={day} />}
          {tab === "task" && <TaskTab />}
        </main>
      </div>
    </AppShell>
  );
}

function QuestionTab({ day }: { day: DayDoc | null }) {
  const { user } = useAuth();
  const [s] = useAppState();
  const coupleId = s.coupleId;
  const partnerUid = s.partnerUid;
  const dayId = todayId();

  const question =
    day?.questionOfDay?.q ?? dailyQuestions[new Date().getDate() % dailyQuestions.length];
  const myDone = Boolean(user && day?.questionOfDay?.done?.[user.uid]);
  const partnerDone = Boolean(partnerUid && day?.questionOfDay?.done?.[partnerUid]);
  const bothDone = myDone && partnerDone;
  const myAnswer = user ? (day?.questionOfDay?.answers?.[user.uid] ?? "") : "";
  const partnerAnswer = partnerUid ? (day?.questionOfDay?.answers?.[partnerUid] ?? "") : "";

  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (!myDone && draft === "" && myAnswer) setDraft(myAnswer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAnswer, myDone]);

  const [nudging, setNudging] = useState(false);

  async function submit() {
    if (!user || !coupleId) return;
    if (!draft.trim()) return;
    await submitQuestionAnswer({
      coupleId,
      dayId,
      uid: user.uid,
      answer: draft.trim(),
    });
    toast.success("Ответ сохранён");
  }

  async function nudgePartner() {
    if (!user || !coupleId || !partnerUid) return;
    setNudging(true);
    try {
      await requestNudge({ coupleId, dayId, toUid: partnerUid, fromUid: user.uid });
      toast("Напомнили партнёру", { description: "У него появится уведомление в приложении." });
    } finally {
      setNudging(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-card p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] relative overflow-hidden">
        <p className="eyebrow">вопрос дня</p>
        <h2 className="mt-3 text-[20px] font-bold leading-[1.35] tracking-[-0.02em] text-foreground">
          {question}
        </h2>
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
          <MessageCircle size={200} />
        </div>
      </div>

      {!myDone ? (
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-card p-6 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ваш ответ..."
            className="w-full min-h-37.5 resize-none rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-background px-4 py-3 text-[15px] font-medium text-foreground placeholder:text-white/20 outline-none focus:border-[rgba(212,175,55,0.5)] focus:ring-4 focus:ring-[rgba(212,175,55,0.08)]"
          />
          <button
            onClick={() => void submit()}
            disabled={!draft.trim()}
            className="btn-gold mt-5 h-14 w-full text-[15px] disabled:opacity-30"
          >
            <span className="relative z-10">Отправить</span>
          </button>
        </div>
      ) : !bothDone ? (
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-card p-6 shadow-sm space-y-4">
          <SealedWaitCard partnerName={s.partner.name} />
          {!partnerDone && (
            <button
              onClick={() => void nudgePartner()}
              disabled={nudging}
              className="btn-accent h-12 w-full"
            >
              <span className="relative z-10 font-black uppercase tracking-widest text-xs">
                {nudging ? "Отправляем…" : "Напомнить партнёру"}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              {s.me.name} (Вы)
            </p>
            <p className="text-lg font-medium text-foreground leading-relaxed">{myAnswer}</p>
          </div>
          <div className="rounded-[32px] border border-primary/25 bg-primary/10 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              {s.partner.name}
            </p>
            <p className="text-lg font-medium text-foreground leading-relaxed">{partnerAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SealedWaitCard({ partnerName }: { partnerName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-background via-card to-background p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Ожидание партнёра
          </p>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Как только <span className="text-foreground">{partnerName}</span> ответит — письмо
            раскроется.
          </p>
        </div>
        <div className="shrink-0 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
          <Heart size={14} className="text-rose-500" fill="currentColor" />
          sealed
        </div>
      </div>

      <div className="mt-6 grid place-items-center">
        <div className="envelope">
          <div className="envelope__base" />
          <div className="envelope__paper">
            <div className="h-2 w-12 rounded-full bg-border/70" />
            <div className="mt-3 h-2 w-20 rounded-full bg-border/50" />
            <div className="mt-3 h-2 w-16 rounded-full bg-border/50" />
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-bold text-rose-600">
              <Heart size={14} className="text-rose-500" fill="currentColor" />
              ждём…
            </div>
          </div>
          <div className="envelope__flap" />
          <div className="envelope__seal">
            <span className="envelope__seal-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GuessTab({ day }: { day: DayDoc | null }) {
  const { user } = useAuth();
  const [s] = useAppState();
  const coupleId = s.coupleId;
  const partnerUid = s.partnerUid;
  const dayId = todayId();

  const games = useMemo(
    () =>
      dailyQuestionsGame.length
        ? dailyQuestionsGame
        : ([
            {
              q: "Где бы я хотел(а) встретить старость?",
              options: [
                "Домик в горах",
                "Квартира в мегаполисе",
                "Вилла у океана",
                "В постоянных путешествиях",
              ],
            },
          ] as const),
    [],
  );

  const myPicks = (user && day?.guessGame?.picks?.[user.uid]) ?? [];
  const myStep = (user && day?.guessGame?.step?.[user.uid]) ?? myPicks.length ?? 0;
  const myDone = Boolean(user && day?.guessGame?.done?.[user.uid]);
  const partnerDone = Boolean(partnerUid && day?.guessGame?.done?.[partnerUid]);
  const bothDone = myDone && partnerDone;

  const [picked, setPicked] = useState<number | null>(null);
  const step = Math.min(myStep, games.length - 1);
  const game = games[step];

  const [nudging, setNudging] = useState(false);

  async function pickOption(i: number) {
    if (!user || !coupleId) return;
    if (picked !== null) return;
    setPicked(i);
    const nextPicks = [...myPicks.slice(0, step), i];
    const done = step + 1 >= games.length;
    const nextStep = Math.min(step + 1, games.length);
    try {
      await submitGuessPick({
        coupleId,
        dayId,
        uid: user.uid,
        step: nextStep,
        pick: i,
        picks: nextPicks,
        done,
      });
    } finally {
      window.setTimeout(() => setPicked(null), 350);
    }
  }

  async function nudgePartner() {
    if (!user || !coupleId || !partnerUid) return;
    setNudging(true);
    try {
      await requestNudge({ coupleId, dayId, toUid: partnerUid, fromUid: user.uid });
      toast("Напомнили партнёру", { description: "У него появится уведомление в приложении." });
    } finally {
      setNudging(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rounded-[40px] border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target size={32} />
        </div>
        {!myDone ? (
          <>
            <p className="eyebrow">угадай партнёра</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">{game.q}</h2>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              Вопрос {step + 1} из {games.length}
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">итог</p>
            <h2 className="mt-3 text-2xl font-black text-foreground">Милый итог дня</h2>
            <p className="mt-3 text-sm font-semibold text-muted-foreground leading-relaxed">
              Не важно какие варианты выбрали — главное, что вы выбираете друг друга. 💗
            </p>
          </>
        )}
      </div>

      {!myDone ? (
        <div className="grid gap-3">
          {game.options.map((opt, i) => (
            <button
              key={opt}
              disabled={picked !== null}
              onClick={() => void pickOption(i)}
              className={`flex h-16 items-center justify-between rounded-3xl border px-8 text-left font-bold transition-all ${
                picked === i
                  ? "border-primary bg-primary/20 text-foreground scale-[1.01]"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {opt}
              {picked === i && <Zap size={18} className="text-primary" fill="currentColor" />}
            </button>
          ))}
        </div>
      ) : !bothDone ? (
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-card p-6 shadow-sm space-y-4">
          <SealedWaitCard partnerName={s.partner.name} />
          {!partnerDone && (
            <button
              onClick={() => void nudgePartner()}
              disabled={nudging}
              className="btn-accent h-12 w-full"
            >
              <span className="relative z-10 font-black uppercase tracking-widest text-xs">
                {nudging ? "Отправляем…" : "Напомнить партнёру"}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-[20px] border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[32px] border border-border bg-card p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                {s.me.name} (Вы)
              </p>
              <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
                {games.map((g, idx) => (
                  <li key={g.q}>
                    <span className="text-foreground">{idx + 1}.</span>{" "}
                    {g.options[myPicks[idx] ?? 0] ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[32px] border border-primary/25 bg-primary/10 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                {s.partner.name}
              </p>
              <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
                {games.map((g, idx) => {
                  const p = partnerUid ? day?.guessGame?.picks?.[partnerUid]?.[idx] : undefined;
                  return (
                    <li key={g.q}>
                      <span className="text-foreground">{idx + 1}.</span>{" "}
                      {typeof p === "number" ? g.options[p] : "—"}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskTab() {
  const task = dailyTasks[0];
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(false);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="rounded-[50px] border border-border bg-card p-12 shadow-sm">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
          <Zap size={40} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-black text-foreground leading-tight">{task.title}</h2>
        <p className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Задание дня
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            if (done) return;
            setDone(true);
            setBurst(true);
            window.setTimeout(() => setBurst(false), 900);
          }}
          className={`h-20 w-full rounded-[32px] font-black uppercase tracking-[0.2em] text-sm transition-all ${
            done
              ? "bg-emerald-500 text-white"
              : "bg-primary text-primary-foreground hover:scale-[1.02]"
          } ${burst ? "done-burst" : ""}`}
        >
          {done ? "Выполнено ✅" : "Я сделал(а) это"}
        </button>

        {burst && (
          <div className="pointer-events-none absolute inset-0">
            <span
              className="done-heart left-1/2 top-1/2"
              style={{ "--dx": "-64px", "--dy": "-44px" } as CSSProperties}
            />
            <span
              className="done-heart left-1/2 top-1/2"
              style={{ "--dx": "62px", "--dy": "-52px", animationDelay: "70ms" } as CSSProperties}
            />
            <span
              className="done-heart left-1/2 top-1/2"
              style={
                {
                  "--dx": "-18px",
                  "--dy": "-78px",
                  animationDelay: "120ms",
                } as CSSProperties
              }
            />
            <span
              className="done-heart left-1/2 top-1/2"
              style={{ "--dx": "14px", "--dy": "-74px", animationDelay: "160ms" } as CSSProperties}
            />
            <span
              className="done-confetti left-1/2 top-1/2"
              style={{ "--dx": "-78px", "--dy": "10px" } as CSSProperties}
            />
            <span
              className="done-confetti left-1/2 top-1/2"
              style={{ "--dx": "82px", "--dy": "6px", animationDelay: "80ms" } as CSSProperties}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// испытания перенесены в раздел /practice
