import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useAppState } from "@/lib/state";

export const Route = createFileRoute("/capsule")({
  head: () => ({
    meta: [
      { title: "Капсула — LoveSpace" },
      { name: "description", content: "Общая лента фото и записок вашей пары." },
    ],
  }),
  component: CapsulePage,
});

const QUICK_EMOJIS = ["💌", "📸", "🌹", "🌅", "☕", "🍕", "🎵", "✨"];

function CapsulePage() {
  const [s, set] = useAppState();
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("💌");

  function add() {
    if (!text.trim()) return;
    set((cur) => ({
      capsule: [
        {
          id: Math.random().toString(36).slice(2),
          from: "me",
          text,
          emoji,
          date: new Date().toISOString(),
        },
        ...cur.capsule,
      ],
    }));
    setText("");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Капсула" subtitle="Ваша общая лента моментов" />

        <div className="px-5 md:px-8">
          {/* композер */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Поделитесь моментом с партнёром..."
              className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-smooth focus:ring-2 focus:ring-ring"
            />
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="h-9 w-9 rounded-xl border text-lg transition-smooth"
                  style={{
                    borderColor: emoji === e ? "var(--color-primary)" : "var(--color-border)",
                    background: emoji === e ? "var(--color-secondary)" : "transparent",
                  }}
                >
                  {e}
                </button>
              ))}
              <button
                onClick={add}
                disabled={!text.trim()}
                className="ml-auto rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/95 disabled:opacity-40"
              >
                Отправить
              </button>
            </div>
          </div>

          {/* лента */}
          <ul className="mt-6 flex flex-col gap-3 pb-12">
            {s.capsule.length === 0 && (
              <li className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Капсула пока пуста. Отправьте первое сообщение партнёру 💞
              </li>
            )}
            {s.capsule.map((item) => {
              const mine = item.from === "me";
              const author = mine ? s.me : s.partner;
              return (
                <li
                  key={item.id}
                  className="flex gap-3 animate-float-up"
                  style={{ flexDirection: mine ? "row-reverse" : "row" }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xl">
                    {author.emoji}
                  </div>
                  <div
                    className="max-w-[80%] rounded-3xl px-4 py-3 shadow-card"
                    style={{
                      background: mine ? "var(--color-primary)" : "var(--color-card)",
                      color: mine ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                      borderTopRightRadius: mine ? "0.5rem" : undefined,
                      borderTopLeftRadius: mine ? undefined : "0.5rem",
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs opacity-80">
                      <span>{author.name}</span>
                      <span>·</span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">
                      <span className="mr-1.5 text-base">{item.emoji}</span>
                      {item.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffH = Math.floor((Date.now() - d.getTime()) / 3_600_000);
  if (diffH < 1) return "только что";
  if (diffH < 24) return `${diffH} ч назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
