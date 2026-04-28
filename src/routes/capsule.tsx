import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { Send, Clock, Plus } from "lucide-react";

export const Route = createFileRoute("/capsule")({
  head: () => ({
    meta: [{ title: "Капсула — LoveSpace" }],
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
      <div className="container-web page-pad max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Капсула</h1>
          <p className="mt-2 text-muted-foreground italic">Мгновения, которые останутся с вами</p>
        </header>

        {/* Современный композитор сообщения */}
        <div className="relative mb-12 overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Что вы чувствуете сейчас?"
            className="w-full resize-none border-none bg-transparent p-0 text-lg text-foreground placeholder:text-muted-foreground/70 outline-none"
          />
          
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                    emoji === e
                      ? "bg-primary text-primary-foreground scale-110 shadow-sm"
                      : "bg-accent text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            
            <button
              onClick={add}
              disabled={!text.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)] transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Лента воспоминаний */}
        <div className="relative space-y-6">
          {/* Вертикальная линия времени */}
          <div className="absolute left-[18px] top-0 h-full w-[2px] bg-gradient-to-b from-primary/40 via-border to-transparent" />

          {s.capsule.length === 0 && (
            <div className="rounded-[32px] border border-dashed border-border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">Здесь пока пусто. Оставьте первый след в истории вашей пары.</p>
            </div>
          )}

          {s.capsule.map((item) => {
            const mine = item.from === "me";
            const author = mine ? s.me : s.partner;
            return (
              <div key={item.id} className="relative flex items-start gap-4 group">
                {/* Аватар-точка на линии времени */}
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-sm text-primary-foreground shadow-sm">
                  {author.emoji}
                </div>

                <div className="flex-1 rounded-[28px] border border-border bg-card p-5 shadow-sm transition-colors group-hover:bg-accent">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">{author.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                      <Clock size={10} />
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-base leading-relaxed text-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const diffH = Math.floor((Date.now() - d.getTime()) / 3_600_000);
  if (diffH < 1) return "Только что";
  if (diffH < 24) return `${diffH} ч. назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}