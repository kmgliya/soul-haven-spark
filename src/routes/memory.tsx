import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { Calendar, Heart, MessageSquare, Star, Crown } from "lucide-react";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [{ title: "Память — LoveSpace" }],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const [s] = useAppState();
  const grouped = groupByMonth([
    ...s.memory,
    ...s.capsule.map((c) => ({
      id: c.id,
      date: c.date,
      type: "capsule",
      title: c.text || "Запись в капсуле",
    })),
  ]);

  return (
    <AppShell>
      <div className="container-web page-pad max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Память</h1>
          <p className="mt-2 text-muted-foreground">История вашей любви в деталях</p>
        </header>

        {!s.premium && (
          <div className="mb-12 relative overflow-hidden rounded-[32px] border border-primary/25 bg-primary/5 p-8 text-center shadow-sm">
            <div className="absolute -right-4 -top-4 text-primary/10">
              <Crown size={120} />
            </div>
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
               <Crown size={20} className="text-primary" />
               LoveSpace Premium
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              Откройте доступ к архивам старше 3 месяцев и сохраните каждый момент навсегда.
            </p>
            <button className="mt-6 rounded-full bg-primary px-8 py-2.5 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.18)]">
              Активировать
            </button>
          </div>
        )}

        <div className="relative space-y-12">
          {grouped.length === 0 && (
            <div className="rounded-[40px] border border-dashed border-border bg-card py-20 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar size={32} />
              </div>
              <p className="text-muted-foreground">Здесь будут храниться ваши общие моменты</p>
            </div>
          )}

          {grouped.map(([month, items], idx) => (
            <section key={month} className="relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="sticky top-24 z-10 mb-6 inline-block rounded-2xl bg-background/70 px-4 py-2 backdrop-blur-md border border-border shadow-sm">
                 <h3 className="font-display text-sm font-black uppercase tracking-[0.2em] text-primary leading-none">
                  {month}
                </h3>
              </div>
              
              <ul className="space-y-4">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="group relative flex items-center gap-6 rounded-[32px] border border-border bg-card p-5 transition-colors hover:bg-accent shadow-sm"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl shadow-inner transition-transform group-hover:scale-110">
                      {iconFor(it.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-lg font-bold text-foreground">
                        {it.title}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {new Date(it.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function iconFor(type: string) {
  if (type === "challenge") return "✨";
  if (type === "capsule")   return "📸";
  if (type === "question")  return "💬";
  return "💎";
}

function groupByMonth(items: { id: string; date: string; type: string; title: string }[]) {
  const map = new Map<string, typeof items>();
  items
    .slice()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .forEach((it) => {
      const key = new Date(it.date).toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric",
      });
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    });
  return Array.from(map.entries());
}