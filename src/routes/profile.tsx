import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState, daysTogether, resetState } from "@/lib/state";
import { badges } from "@/lib/mock-data";
import {
  Settings,
  LogOut,
  Shield,
  Bell,
  ChevronRight,
  Award,
  Flame,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Профиль — LoveSpace" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [s, set] = useAppState();
  const navigate = useNavigate();
  const days = daysTogether(s.startDate);
  const streakPct = Math.min(1, s.recordStreak ? s.streak / s.recordStreak : 0);

  function logout() {
    resetState();
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <div className="container-web page-pad max-w-5xl">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">Профиль</h1>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <section className="relative overflow-hidden rounded-[40px] bg-primary p-8 text-primary-foreground md:col-span-8 shadow-[0_18px_60px_rgba(var(--color-primary-rgb),0.25)]">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-6">
                  <div className="h-20 w-20 rounded-full border-4 border-primary bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-2xl">
                    {s.me.emoji}
                  </div>
                  <div className="h-20 w-20 rounded-full border-4 border-primary bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-2xl">
                    {s.partner.emoji}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {s.me.name} + {s.partner.name}
                  </h2>
                  <p className="text-sm opacity-60 font-medium">Пара</p>
                </div>
              </div>
              <div className="mt-12 flex items-baseline gap-2">
                <span className="text-7xl font-black tracking-tighter">
                  {days}
                </span>
                <span className="text-xl font-bold opacity-70 uppercase tracking-widest">
                  дней
                </span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </section>

          <div className="grid gap-4 md:col-span-4">
            {/* Streak widget */}
            <section className="relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-400/15 blur-[30px]" />
              <div className="absolute -left-14 -bottom-14 h-44 w-44 rounded-full bg-primary/10 blur-[40px]" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <Flame size={12} className="text-orange-500" />
                    Streak
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black tracking-tight text-foreground">{s.streak}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">дней</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    Рекорд: <span className="text-foreground">{s.recordStreak}</span>
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-border bg-background/70 shadow-sm">
                    <span className="text-sm font-black text-foreground">{Math.round(streakPct * 100)}%</span>
                  </div>
                  <div className="mt-3 h-2 w-14 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-primary"
                      style={{ width: `${Math.round(streakPct * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Collection widget */}
            <section className="relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-sm">
              <div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-primary/12 blur-[35px]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles size={12} className="text-primary" />
                  Коллекция
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-border bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <ImageIcon size={16} className="text-primary" />
                      <span className="text-xs font-bold text-muted-foreground">Капсула</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-foreground leading-none">{s.capsule.length}</p>
                  </div>
                  <div className="rounded-[22px] border border-border bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <Award size={16} className="text-primary" />
                      <span className="text-xs font-bold text-muted-foreground">Бейджи</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-foreground leading-none">{s.earnedBadges.length}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {badges.slice(0, 5).map((b) => {
                    const owned = s.earnedBadges.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        className={`flex h-9 w-9 items-center justify-center rounded-[14px] border border-border bg-background/70 text-lg shadow-sm ${
                          owned ? "opacity-100" : "opacity-25 grayscale"
                        }`}
                        title={b.title}
                      >
                        {b.icon}
                      </div>
                    );
                  })}
                  <span className="ml-auto text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    Все →
                  </span>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[40px] border border-border bg-card p-8 shadow-sm md:col-span-12">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-6">
              <Award className="text-primary" /> Достижения
            </h3>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
              {badges.map((b) => {
                const owned = s.earnedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      owned ? "scale-100" : "grayscale opacity-20"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl shadow-inner">
                      {b.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[40px] border border-border bg-card md:col-span-7 shadow-sm">
            <SettingItem
              icon={<Settings size={18} />}
              label="Код связи"
              value={s.coupleCode}
              onClick={() => {}}
            />
            <SettingItem
              icon={<Shield size={18} />}
              label="Приватность 18+"
              value=""
              right={
                <Switch
                  checked={s.verifiedAdult}
                  onCheckedChange={(checked) => set({ verifiedAdult: checked })}
                  aria-label="Приватность 18+"
                />
              }
            />
            <SettingItem
              icon={<Bell size={18} />}
              label="Уведомления"
              value="09:00"
              onClick={() => {}}
            />
            <SettingItem
              icon={<LogOut size={18} className="text-red-500" />}
              label="Выйти"
              value=""
              danger
              onClick={logout}
            />
          </section>

          <section className="rounded-[40px] bg-linear-to-br from-indigo-600 to-purple-700 p-8 text-white md:col-span-5 shadow-2xl relative overflow-hidden group">
            <h3 className="text-2xl font-black tracking-tight">Premium</h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Эксклюзивные задания для пар и бесконечная Капсула.
            </p>
            <button className="mt-8 w-full rounded-2xl bg-white py-4 text-sm font-black uppercase tracking-widest text-indigo-700 transition-transform active:scale-95 group-hover:scale-[1.02]">
              Активировать
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function SettingItem({
  icon,
  label,
  value,
  onClick,
  danger,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-8 py-6 transition-colors hover:bg-accent border-b border-border last:border-0 disabled:cursor-default"
      disabled={!onClick}
    >
      <div className="flex items-center gap-4 text-foreground/80">
        <span className={danger ? "text-red-500" : "text-primary"}>{icon}</span>
        <span className={`font-bold ${danger ? "text-red-500" : ""}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {right ? (
          right
        ) : (
          <>
            <span className="text-sm font-medium text-muted-foreground">{value}</span>
            <ChevronRight size={16} className="text-muted-foreground/50" />
          </>
        )}
      </div>
    </button>
  );
}