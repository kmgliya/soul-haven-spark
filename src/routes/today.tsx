import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import {
  dailyQuestions,
  dailyTasks,
  challenges,
  dailyQuestionsGame,
} from "@/lib/mock-data";
import {
  MessageCircle,
  Target,
  Zap,
  Trophy,
  ChevronRight,
  Flame,
  Heart,
} from "lucide-react";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [{ title: "Сегодня — LoveSpace" }],
  }),
  component: TodayPage,
});

type Tab = "question" | "guess" | "task" | "challenge";

function TodayPage() {
  const [tab, setTab] = useState<Tab>("question");

  const tabs = [
    { id: "question", label: "Вопрос", icon: MessageCircle },
    { id: "guess", label: "Угадай", icon: Target },
    { id: "task", label: "Задание", icon: Zap },
    { id: "challenge", label: "Испытание", icon: Trophy },
  ] as const;

  return (
    <AppShell>
      <div className="container-web page-pad max-w-5xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-primary/15 via-fuchsia-500/10 to-primary/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary chip-shimmer">
            <Flame size={12} className="text-primary" /> Активный день
          </div>
          <h1 className="font-display text-5xl font-black tracking-tight text-foreground">Для вас двоих</h1>
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
          {tab === "question" && <QuestionTab />}
          {tab === "guess" && <GuessTab />}
          {tab === "task" && <TaskTab />}
          {tab === "challenge" && <ChallengeTab />}
        </main>
      </div>
    </AppShell>
  );
}

function QuestionTab() {
  const [s, set] = useAppState();
  const question =
    dailyQuestions[new Date().getDate() % dailyQuestions.length];
  const [draft, setDraft] = useState(s.todayMyAnswer);
  const [revealed, setRevealed] = useState(s.todayAnswered.me && s.todayAnswered.partner);
  const [opening, setOpening] = useState(false);

  const waitingPartner = useMemo(() => s.todayAnswered.me && !s.todayAnswered.partner, [s.todayAnswered.me, s.todayAnswered.partner]);

  useEffect(() => {
    const done = s.todayAnswered.me && s.todayAnswered.partner;
    if (done) setRevealed(true);
  }, [s.todayAnswered.me, s.todayAnswered.partner]);

  function submit() {
    if (!draft.trim()) return;
    set({
      todayMyAnswer: draft,
      todayAnswered: { ...s.todayAnswered, me: true, partner: false },
      todayPartnerAnswer:
        s.todayPartnerAnswer?.trim()
          ? s.todayPartnerAnswer
          : "Я бы сказала, что люблю твой взгляд на мелочи. И это очень мило. 💗",
      streak: s.streak + 1,
    });
    setOpening(false);
    // Демо: имитируем ответ партнёра, чтобы было “ожидание → раскрытие”
    window.setTimeout(() => {
      setOpening(true);
      set({ todayAnswered: { ...s.todayAnswered, me: true, partner: true } });
      window.setTimeout(() => setRevealed(true), 520);
    }, 1200);
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

      {!revealed ? (
        <div className="rounded-[20px] border border-[rgba(255,255,255,0.07)] bg-card p-6 shadow-sm">
          {!s.todayAnswered.me ? (
            <>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ваш ответ..."
                className="w-full min-h-37.5 resize-none rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-background px-4 py-3 text-[15px] font-medium text-foreground placeholder:text-white/20 outline-none focus:border-[rgba(212,175,55,0.5)] focus:ring-4 focus:ring-[rgba(212,175,55,0.08)]"
              />
              <button
                onClick={submit}
                disabled={!draft.trim()}
                className="btn-gold mt-5 h-14 w-full text-[15px] disabled:opacity-30"
              >
                <span className="relative z-10">Отправить</span>
              </button>
            </>
          ) : (
            <SealedWaitCard opening={opening} partnerName={s.partner.name} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              {s.me.name} (Вы)
            </p>
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {s.todayMyAnswer}
            </p>
          </div>
          <div className="rounded-[32px] border border-primary/25 bg-primary/10 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              {s.partner.name}
            </p>
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {s.todayPartnerAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SealedWaitCard({ opening, partnerName }: { opening: boolean; partnerName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-background via-card to-background p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Ожидание партнёра
          </p>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Как только <span className="text-foreground">{partnerName}</span> ответит — письмо раскроется.
          </p>
        </div>
        <div className="shrink-0 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600">
          <Heart size={14} className="text-rose-500" fill="currentColor" />
          sealed
        </div>
      </div>

      <div className="mt-6 grid place-items-center">
        <div className={`envelope ${opening ? "envelope--opening" : ""}`}>
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

function GuessTab() {
  const games = [
    {
      q: "Где бы я хотел(а) встретить старость?",
      options: ["Домик в горах", "Квартира в мегаполисе", "Вилла у океана", "В постоянных путешествиях"],
    },
    {
      q: "Что я выберу в идеальное утро?",
      options: ["Кофе и тишина", "Прогулка и свежий воздух", "Музыка и танец", "Завтрак в постель"],
    },
    {
      q: "Что для меня самый тёплый жест?",
      options: ["Обнять молча", "Оставить записку", "Сделать сюрприз", "Сказать “я рядом”"],
    },
    {
      q: "Какая атмосфера мне ближе сегодня?",
      options: ["Уютно и спокойно", "Лёгкая романтика", "Смех и игры", "Вдохновение и планы"],
    },
    {
      q: "Что я выберу для свидания мечты?",
      options: ["Пикник на закате", "Кино + плед", "Новая локация", "Вкусный ужин"],
    },
  ] as const;

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const game = games[step];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rounded-[40px] border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target size={32} />
        </div>
        {!done ? (
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
            <h2 className="mt-3 text-2xl font-black text-foreground">
              Милый итог дня
            </h2>
            <p className="mt-3 text-sm font-semibold text-muted-foreground leading-relaxed">
              Не важно какие варианты выбрали — главное, что вы выбираете друг друга. 💗
            </p>
          </>
        )}
      </div>

      {!done ? (
        <div className="grid gap-3">
          {game.options.map((opt, i) => (
            <button
              key={opt}
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                window.setTimeout(() => {
                  const next = step + 1;
                  if (next >= games.length) {
                    setDone(true);
                    return;
                  }
                  setStep(next);
                  setPicked(null);
                }, 450);
              }}
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
      ) : (
        <button
          onClick={() => {
            setStep(0);
            setPicked(null);
            setDone(false);
          }}
          className="btn-accent h-14 w-full"
        >
          <span className="relative z-10 font-black uppercase tracking-widest text-sm">
            Начать заново
          </span>
        </button>
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
        <h2 className="text-3xl font-black text-foreground leading-tight">
          {task.title}
        </h2>
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
            <span className="done-heart left-1/2 top-1/2" style={{ ["--dx" as any]: "-64px", ["--dy" as any]: "-44px" }} />
            <span className="done-heart left-1/2 top-1/2" style={{ ["--dx" as any]: "62px", ["--dy" as any]: "-52px", animationDelay: "70ms" }} />
            <span className="done-heart left-1/2 top-1/2" style={{ ["--dx" as any]: "-18px", ["--dy" as any]: "-78px", animationDelay: "120ms" }} />
            <span className="done-heart left-1/2 top-1/2" style={{ ["--dx" as any]: "14px", ["--dy" as any]: "-74px", animationDelay: "160ms" }} />
            <span className="done-confetti left-1/2 top-1/2" style={{ ["--dx" as any]: "-78px", ["--dy" as any]: "10px" }} />
            <span className="done-confetti left-1/2 top-1/2" style={{ ["--dx" as any]: "82px", ["--dy" as any]: "6px", animationDelay: "80ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeTab() {
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
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {c.description}
            </p>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {c.days} ДНЕЙ
            </span>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}