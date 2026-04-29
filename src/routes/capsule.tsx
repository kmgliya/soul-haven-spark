import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/state";
import { Send, Clock, ImagePlus, Lock, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [image, setImage] = useState<string | null>(null);
  const [openDate, setOpenDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [openTime, setOpenTime] = useState("21:00");

  const openAt = computeOpenAt(openDate, openTime);
  const canSend = Boolean(text.trim() || image);

  const lockedIds = useMemo(() => {
    return new Set(s.capsule.filter((it) => isLocked(it.openAt)).map((it) => it.id));
  }, [s.capsule]);

  const notifiedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const t = window.setInterval(() => {
      // Когда капсула "созрела" — показываем маленький момент.
      for (const it of s.capsule) {
        if (!it.openAt) continue;
        const nowUnlocked = !isLocked(it.openAt);
        const wasLocked = lockedIds.has(it.id);
        if (wasLocked && nowUnlocked && !notifiedRef.current.has(it.id)) {
          notifiedRef.current.add(it.id);
          toast("Капсула открылась", {
            description: "Можно открыть и перечитать ваш момент.",
          });
        }
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [lockedIds, s.capsule]);

  function add() {
    if (!canSend) return;
    set((cur) => ({
      capsule: [
        {
          id: Math.random().toString(36).slice(2),
          from: "me",
          text: text.trim() ? text : undefined,
          emoji,
          image: image ?? undefined,
          date: new Date().toISOString(),
          openAt,
        },
        ...cur.capsule,
      ],
    }));
    setText("");
    setImage(null);
  }

  return (
    <AppShell>
      <div className="container-web page-pad max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
            Капсула
          </h1>
          <p className="mt-2 text-muted-foreground italic">Мгновения, которые останутся с вами</p>
        </header>

        {/* Композитор капсулы времени */}
        <div className="relative mb-12 overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm">
          <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-[45px]" />
          <div className="absolute -left-16 -bottom-16 h-60 w-60 rounded-full bg-fuchsia-500/10 blur-[55px]" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              капсула времени
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Напиши сообщение в будущее…"
              className="w-full resize-none rounded-[22px] border border-border bg-background/60 px-5 py-4 text-base font-medium text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />

            {image && (
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-background/60">
                <img src={image} alt="Вложение капсулы" className="h-48 w-full object-cover" />
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Вложение
                  </p>
                  <button
                    onClick={() => setImage(null)}
                    className="rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    убрать
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
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

              <div className="flex items-center gap-2">
                <label className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors cursor-pointer">
                  <ImagePlus size={16} className="text-primary" />
                  фото
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const r = new FileReader();
                      r.onload = () => setImage(String(r.result));
                      r.readAsDataURL(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl bg-background/70 px-4 text-xs font-black uppercase tracking-[0.18em]"
                    >
                      <CalendarIcon className="text-primary" />
                      открыть
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] rounded-[22px] border-border bg-card p-3 shadow-lg">
                    <div className="space-y-3">
                      <div className="rounded-[18px] border border-border bg-background/70 p-2">
                        <Calendar
                          mode="single"
                          selected={openDate}
                          onSelect={(d) => setOpenDate(d ?? openDate)}
                          initialFocus
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-[18px] border border-border bg-background/70 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            время
                          </p>
                          <input
                            type="time"
                            value={openTime}
                            onChange={(e) => setOpenTime(e.target.value)}
                            className="mt-2 w-full rounded-[14px] border border-border bg-background/70 px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>

                        <div className="rounded-[18px] border border-border bg-background/70 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            быстро
                          </p>
                          <div className="mt-2 grid grid-cols-1 gap-2">
                            <button
                              onClick={() => setOpenPreset(1, setOpenDate, setOpenTime)}
                              className="h-9 rounded-[14px] border border-border bg-card text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors"
                            >
                              +1 день
                            </button>
                            <button
                              onClick={() => setOpenPreset(7, setOpenDate, setOpenTime)}
                              className="h-9 rounded-[14px] border border-border bg-card text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-accent transition-colors"
                            >
                              +7 дней
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[18px] border border-border bg-background/70 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                          откроется
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatOpenAt(openAt)}
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <button
                  onClick={add}
                  disabled={!canSend}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.22)] transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
                  title="Запечатать капсулу"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Лента воспоминаний */}
        <div className="relative space-y-6">
          {/* Вертикальная линия времени */}
          <div className="absolute left-[18px] top-0 h-full w-[2px] bg-gradient-to-b from-primary/40 via-border to-transparent" />

          {s.capsule.length === 0 && (
            <div className="rounded-[32px] border border-dashed border-border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">
                Здесь пока пусто. Оставьте первый след в истории вашей пары.
              </p>
            </div>
          )}

          {s.capsule.map((item) => {
            const mine = item.from === "me";
            const author = mine ? s.me : s.partner;
            const locked = isLocked(item.openAt);
            const timelinePct = locked ? lockProgress(item.date, item.openAt) : 1;
            return (
              <div key={item.id} className="relative flex items-start gap-4 group">
                {/* Аватар-точка на линии времени */}
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-sm text-primary-foreground shadow-sm">
                  {author.emoji}
                </div>

                <div className="flex-1 rounded-[28px] border border-border bg-card p-5 shadow-sm transition-colors group-hover:bg-accent">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                      {author.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                      <Clock size={10} />
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                          {locked ? "запечатано" : "открыто"}
                        </p>
                        {item.openAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            <Lock size={12} className={locked ? "" : "opacity-30"} />
                            {locked
                              ? `откроется ${formatDateAbsolute(item.openAt)}`
                              : "время пришло"}
                          </span>
                        )}
                      </div>

                      {locked ? (
                        <div className="mt-2 overflow-hidden rounded-[20px] border border-border bg-background/70">
                          <div className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                              <p className="text-sm font-black text-foreground">
                                Запечатано до {formatDateAbsolute(item.openAt!)}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                Осталось:{" "}
                                <span className="text-foreground">{timeLeft(item.openAt!)}</span>
                              </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground/5 text-muted-foreground">
                              <Lock size={18} />
                            </div>
                          </div>

                          {/* тонкий таймлайн прогресса */}
                          <div className="px-4 pb-4">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/70">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary/35 via-fuchsia-500/20 to-rose-400/25"
                                style={{ width: `${Math.round(timelinePct * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* preview blur: показываем реальный контент, но закрываем */}
                          <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                            <div className="relative overflow-hidden rounded-[16px] border border-border bg-card/70 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                превью текста
                              </p>
                              <div className="mt-2 select-none">
                                <p
                                  className={`text-sm font-medium leading-relaxed ${item.text ? "text-foreground" : "text-muted-foreground/70"} blur-[6px]`}
                                >
                                  {item.text ? item.text : "—"}
                                </p>
                              </div>
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
                            </div>

                            <div className="relative overflow-hidden rounded-[16px] border border-border bg-card/70 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                превью фото
                              </p>
                              <div className="mt-2 overflow-hidden rounded-[14px] border border-border bg-background/50">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="h-20 w-full object-cover blur-[6px] scale-[1.08] select-none"
                                    draggable={false}
                                  />
                                ) : (
                                  <div className="grid h-20 place-items-center text-xs font-semibold text-muted-foreground/70">
                                    —
                                  </div>
                                )}
                              </div>
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.text && (
                            <p className="mt-2 text-base leading-relaxed text-foreground whitespace-pre-wrap">
                              {item.text}
                            </p>
                          )}
                          {item.image && (
                            <div className="mt-3 overflow-hidden rounded-[18px] border border-border bg-background/70">
                              <img
                                src={item.image}
                                alt="Фото капсулы"
                                className="h-44 w-full object-cover"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
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

function formatDateAbsolute(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeOpenAt(openDate: Date | undefined, time: string) {
  const base = openDate ? new Date(openDate) : new Date();
  const [hh, mm] = (time || "21:00").split(":").map((x) => Number(x));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return base.toISOString();
  base.setHours(hh, mm, 0, 0);
  return base.toISOString();
}

function formatOpenAt(iso: string) {
  return formatDateAbsolute(iso);
}

function isLocked(openAt?: string) {
  if (!openAt) return false;
  return new Date(openAt).getTime() > Date.now();
}

function timeLeft(openAt: string) {
  const ms = new Date(openAt).getTime() - Date.now();
  if (ms <= 0) return "0 мин";
  const totalMin = Math.ceil(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 24 * 60) / 60);
  const mins = totalMin - days * 24 * 60 - hours * 60;
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

function setOpenPreset(plusDays: number, setDate: (d: Date) => void, setTime: (t: string) => void) {
  const d = new Date();
  d.setDate(d.getDate() + plusDays);
  setDate(d);
  setTime("21:00");
}

function lockProgress(createdAtISO: string, openAtISO?: string) {
  if (!openAtISO) return 1;
  const start = new Date(createdAtISO).getTime();
  const end = new Date(openAtISO).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  const pct = (now - start) / (end - start);
  return Math.max(0, Math.min(1, pct));
}
