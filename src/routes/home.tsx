import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, daysTogether } from "@/lib/state";
import { articles, dailyThemes, dailyQuestions } from "@/lib/mock-data";
import { Flame, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Дом — LoveSpace" },
      { name: "description", content: "Главный экран вашей пары: активность дня, статья и тема дня." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [s] = useAppState();
  const days = daysTogether(s.startDate);
  const article = articles[0];
  const theme = dailyThemes[new Date().getDate() % dailyThemes.length];
  const question = dailyQuestions[new Date().getDate() % dailyQuestions.length];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 pt-6 md:px-8 md:pt-10">
        {/* Шапка пары */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-romantic p-6 text-primary-foreground shadow-glow md:p-8">
          <div className="flex items-center gap-4">
            <Avatar emoji={s.me.emoji} name={s.me.name} />
            <div className="text-3xl">💞</div>
            <Avatar emoji={s.partner.emoji} name={s.partner.name} />
          </div>
          <p className="mt-5 text-sm opacity-90">{s.me.name} и {s.partner.name}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {days} <span className="text-2xl font-normal opacity-90 md:text-3xl">дней вместе</span>
          </h2>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Flame className="h-3.5 w-3.5" />
            Streak: {s.streak} дн.
          </div>
        </section>

        {/* Тема дня */}
        <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Тема дня</p>
        <div className="mt-2 rounded-2xl bg-gradient-soft p-5">
          <p className="font-display text-xl font-semibold leading-snug">{theme}</p>
        </div>

        {/* Активность дня */}
        <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Активность дня</p>
        <Link
          to="/today"
          className="mt-2 block overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-card transition-smooth hover:shadow-soft md:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground">
                💬 Вопрос дня
              </div>
              <p className="mt-3 font-display text-xl font-semibold leading-snug">{question}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>⏱ Осталось 14 ч</span>
                <span>•</span>
                <span>{s.todayAnswered.me ? "Вы ответили" : "Ваша очередь"}</span>
              </div>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground" />
          </div>
        </Link>

        {/* Статья дня */}
        <p className="mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Статья дня</p>
        <article className="mt-2 rounded-3xl border border-border bg-card p-5 shadow-card md:p-6">
          <h3 className="font-display text-lg font-semibold leading-snug">{article.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{article.preview}</p>
          <button className="mt-3 text-sm font-semibold text-primary">Читать →</button>
        </article>

        {/* Быстрые действия */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/capsule" className="rounded-2xl border border-border bg-card p-4 text-left transition-smooth hover:shadow-soft">
            <div className="text-2xl">📸</div>
            <p className="mt-2 text-sm font-semibold">Капсула</p>
            <p className="text-xs text-muted-foreground">{s.capsule.length} записей</p>
          </Link>
          <Link to="/ideas" className="rounded-2xl border border-border bg-card p-4 text-left transition-smooth hover:shadow-soft">
            <div className="text-2xl">🌹</div>
            <p className="mt-2 text-sm font-semibold">Идеи свиданий</p>
            <p className="text-xs text-muted-foreground">Открыть подборку</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Avatar({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/95 text-3xl shadow-soft md:h-20 md:w-20 md:text-4xl">
        {emoji}
      </div>
      <span className="text-xs font-medium opacity-90">{name}</span>
    </div>
  );
}
