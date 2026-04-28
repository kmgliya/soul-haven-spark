import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
          <div className="flex gap-1 rounded-[24px] border border-border bg-background/70 p-1.5 backdrop-blur-2xl shadow-sm">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
  const [revealed, setRevealed] = useState(
    s.todayAnswered.me && s.todayAnswered.partner
  );

  function submit() {
    if (!draft.trim()) return;
    set({
      todayMyAnswer: draft,
      todayAnswered: { ...s.todayAnswered, me: true, partner: true },
      streak: s.streak + 1,
    });
    setTimeout(() => setRevealed(true), 500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-[40px] bg-primary p-10 text-primary-foreground shadow-[0_18px_60px_rgba(var(--color-primary-rgb),0.25)] relative overflow-hidden">
        <h2 className="text-3xl font-black leading-[1.1] tracking-tight md:text-4xl">
          {question}
        </h2>
        <p className="mt-6 text-sm font-bold uppercase tracking-widest opacity-60">
          Вопрос дня
        </p>
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
          <MessageCircle size={200} />
        </div>
      </div>

      {!revealed ? (
        <div className="rounded-[40px] border border-border bg-card p-8 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ваш ответ..."
            className="w-full min-h-37.5 resize-none bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="mt-8 w-full rounded-3xl bg-primary h-16 font-black uppercase tracking-widest text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
          >
            Отправить
          </button>
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

function GuessTab() {
  const game = dailyQuestionsGame[0];
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rounded-[40px] border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target size={32} />
        </div>
        <h2 className="text-2xl font-black text-foreground">{game.q}</h2>
      </div>

      <div className="grid gap-3">
        {game.options.map((opt, i) => (
          <button
            key={opt}
            disabled={picked !== null}
            onClick={() => setPicked(i)}
            className={`flex h-16 items-center justify-between rounded-3xl border px-8 text-left font-bold transition-all ${
              picked === i
                ? "border-primary bg-primary text-primary-foreground scale-[1.02]"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {opt}
            {picked === i && <Zap size={18} fill="currentColor" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskTab() {
  const task = dailyTasks[0];
  const [done, setDone] = useState(false);

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

      <button
        onClick={() => setDone(true)}
        className={`h-20 w-full rounded-[32px] font-black uppercase tracking-[0.2em] text-sm transition-all ${
          done
            ? "bg-emerald-500 text-white"
            : "bg-primary text-primary-foreground hover:scale-[1.02]"
        }`}
      >
        {done ? "Выполнено ✅" : "Я сделал(а) это"}
      </button>
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