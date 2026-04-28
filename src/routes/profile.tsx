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
} from "lucide-react";

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

          <div className="grid grid-cols-2 gap-4 md:col-span-4">
            <StatCard label="Streak" value={s.streak} color="bg-orange-500" />
            <StatCard
              label="Рекорд"
              value={s.recordStreak}
              color="bg-blue-500"
            />
            <StatCard
              label="Бейджи"
              value={s.earnedBadges.length}
              color="bg-purple-500"
            />
            <StatCard
              label="Файлы"
              value={s.capsule.length}
              color="bg-emerald-500"
            />
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
            />
            <SettingItem
              icon={<Shield size={18} />}
              label="Приватность 18+"
              value={s.verifiedAdult ? "Активно" : "Выкл."}
              onClick={() => set({ verifiedAdult: !s.verifiedAdult })}
            />
            <SettingItem
              icon={<Bell size={18} />}
              label="Уведомления"
              value="09:00"
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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center rounded-[32px] border border-border bg-card p-4 text-center shadow-sm">
      <span className={`h-2 w-2 rounded-full ${color} mb-2`} />
      <p className="text-2xl font-black text-foreground leading-none">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function SettingItem({
  icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-8 py-6 transition-colors hover:bg-accent border-b border-border last:border-0"
    >
      <div className="flex items-center gap-4 text-foreground/80">
        <span className={danger ? "text-red-500" : "text-primary"}>{icon}</span>
        <span className={`font-bold ${danger ? "text-red-500" : ""}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {value}
        </span>
        <ChevronRight size={16} className="text-muted-foreground/50" />
      </div>
    </button>
  );
}