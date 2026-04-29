import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useAppState } from "@/lib/state";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Память — LoveSpace" },
      { name: "description", content: "Лента всех ваших активностей по месяцам." },
    ],
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
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Память" subtitle="Ваша история по месяцам" />
        <div className="px-5 pb-12 md:px-8">
          {!s.premium && (
            <div className="mb-5 rounded-2xl border border-border bg-gradient-soft p-4 text-sm">
              ✨ В бесплатной версии видны только последние 3 месяца.{" "}
              <span className="font-semibold">Premium</span> открывает всё.
            </div>
          )}
          {grouped.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Пока ничего нет — выполните первую активность 💞
            </div>
          )}
          {grouped.map(([month, items]) => (
            <section key={month} className="mb-6">
              <h3 className="font-display text-lg font-semibold capitalize">{month}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="text-2xl">{iconFor(it.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-snug">{it.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
  if (type === "challenge") return "🌟";
  if (type === "capsule") return "💌";
  if (type === "question") return "💬";
  return "✨";
}

function groupByMonth(items: { id: string; date: string; type: string; title: string }[]) {
  const map = new Map<string, typeof items>();
  items
    .slice()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .forEach((it) => {
      const key = new Date(it.date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    });
  return Array.from(map.entries());
}
