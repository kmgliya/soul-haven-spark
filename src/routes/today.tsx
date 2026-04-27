import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useAppState } from "@/lib/state";
import { dailyQuestions, guessGameQuestions, dailyTasks, challenges } from "@/lib/mock-data";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Сегодня — LoveSpace" },
      { name: "description", content: "Активности дня: вопрос, мини-игра, задание и испытания." },
    ],
  }),
  component: TodayPage,
});

type Tab = "question" | "guess" | "task" | "challenge";

function TodayPage() {
  const [tab, setTab] = useState<Tab>("question");
  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "question", label: "Вопрос", emoji: "💬" },
    { id: "guess", label: "Угадай", emoji: "🎲" },
    { id: "task", label: "Задание", emoji: "✨" },
    { id: "challenge", label: "Испытание", emoji: "🌟" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Сегодня" subtitle="Одна активность в день — вместе крепче" />

        <div className="sticky top-0 z-10 -mx-1 overflow-x-auto bg-background/85 px-5 py-2 backdrop-blur-md md:px-8">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-smooth"
                style={{
                  borderColor: tab === t.id ? "var(--color-primary)" : "var(--color-border)",
                  background: tab === t.id ? "var(--color-primary)" : "var(--color-card)",
                  color: tab === t.id ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-12 md:px-8">
          {tab === "question" && <QuestionTab />}
          {tab === "guess" && <GuessTab />}
          {tab === "task" && <TaskTab />}
          {tab === "challenge" && <ChallengeTab />}
        </div>
      </div>
    </AppShell>
  );
}

function QuestionTab() {
  const [s, set] = useAppState();
  const question = dailyQuestions[new Date().getDate() % dailyQuestions.length];
  const [draft, setDraft] = useState(s.todayMyAnswer);
  const [revealed, setRevealed] = useState(s.todayAnswered.me && s.todayAnswered.partner);

  function submit() {
    if (!draft.trim()) return;
    set({
      todayMyAnswer: draft,
      todayAnswered: { ...s.todayAnswered, me: true, partner: true }, // mock: партнёр тоже ответил
      streak: s.streak + 1,
      recordStreak: Math.max(s.recordStreak, s.streak + 1),
    });
    setTimeout(() => setRevealed(true), 600);
  }

  return (
    <section className="animate-float-up">
      <div className="rounded-3xl bg-gradient-soft p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Вопрос дня</p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-snug md:text-3xl">{question}</h2>
        <p className="mt-3 text-xs text-muted-foreground">⏱ Осталось 14 ч до завершения</p>
      </div>

      {!revealed ? (
        <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-card">
          <label className="text-sm font-medium">Ваш ответ</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder="Партнёр увидит его только когда оба ответите..."
            className="mt-2 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-base outline-none transition-smooth focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={submit}
            className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-smooth hover:bg-primary/95 disabled:opacity-50"
            disabled={!draft.trim()}
          >
            Отправить ответ
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            🔒 Ответы откроются когда оба ответите
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 animate-float-up md:grid-cols-2">
          <AnswerCard who={s.me.name} emoji={s.me.emoji} text={s.todayMyAnswer} mine />
          <AnswerCard who={s.partner.name} emoji={s.partner.emoji} text={s.todayPartnerAnswer} />
          <div className="rounded-2xl bg-gradient-romantic p-4 text-center text-primary-foreground md:col-span-2">
            🔥 Streak {s.streak} дн.! Возвращайтесь завтра
          </div>
        </div>
      )}
    </section>
  );
}

function AnswerCard({ who, emoji, text, mine }: { who: string; emoji: string; text: string; mine?: boolean }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-semibold">{who} {mine && <span className="text-muted-foreground">(вы)</span>}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function GuessTab() {
  const game = guessGameQuestions[new Date().getDate() % guessGameQuestions.length];
  const [picked, setPicked] = useState<number | null>(null);
  const correct = 0; // mock — первый вариант всегда верный

  return (
    <section className="animate-float-up">
      <div className="rounded-3xl bg-gradient-soft p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Угадай партнёра</p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-snug">{game.q}</h2>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {game.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = picked !== null && i === correct;
          const isWrong = isPicked && i !== correct;
          return (
            <button
              key={opt}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className="rounded-2xl border-2 bg-card px-5 py-4 text-left text-base font-medium transition-smooth disabled:cursor-default"
              style={{
                borderColor: isCorrect
                  ? "var(--color-success)"
                  : isWrong
                  ? "var(--color-destructive)"
                  : "var(--color-border)",
                background:
                  isCorrect ? "color-mix(in oklch, var(--color-success) 15%, var(--color-card))"
                  : isWrong ? "color-mix(in oklch, var(--color-destructive) 12%, var(--color-card))"
                  : "var(--color-card)",
              }}
            >
              {opt} {isCorrect && "✓"} {isWrong && "✗"}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5 rounded-2xl bg-gradient-romantic p-5 text-center text-primary-foreground animate-float-up">
          {picked === correct ? "🎉 Угадали! Вы знаете партнёра" : "🙈 Мимо! Хороший повод узнать друг друга получше"}
        </div>
      )}
    </section>
  );
}

function TaskTab() {
  const task = dailyTasks[new Date().getDate() % dailyTasks.length];
  const [done, setDone] = useState(false);
  return (
    <section className="animate-float-up">
      <div className="rounded-3xl bg-gradient-soft p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Задание дня · {task.type === "photo" ? "Фото" : "Текст"}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-snug">{task.title}</h2>
      </div>

      {!done ? (
        <button
          onClick={() => setDone(true)}
          className="mt-5 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-smooth hover:bg-primary/95"
        >
          {task.type === "photo" ? "Загрузить фото" : "Выполнено ✓"}
        </button>
      ) : (
        <div className="mt-5 rounded-3xl bg-gradient-romantic p-6 text-center text-primary-foreground animate-float-up">
          <div className="text-4xl">💞</div>
          <p className="mt-2 font-display text-lg font-semibold">Готово!</p>
          <p className="mt-1 text-sm opacity-90">Партнёр получит уведомление.</p>
        </div>
      )}
    </section>
  );
}

function ChallengeTab() {
  const [accepted, setAccepted] = useState<string | null>(null);
  return (
    <section className="animate-float-up flex flex-col gap-3">
      {challenges.map((c) => {
        const isAccepted = accepted === c.id;
        return (
          <article key={c.id} className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Испытание · {c.days} дней
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              </div>
              <span className="text-3xl">🌟</span>
            </div>
            <button
              onClick={() => setAccepted(isAccepted ? null : c.id)}
              className="mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition-smooth"
              style={{
                background: isAccepted ? "var(--color-success)" : "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {isAccepted ? "✓ Принято — ждём партнёра" : "Принять"}
            </button>
          </article>
        );
      })}
    </section>
  );
}
