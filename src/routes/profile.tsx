import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { useAppState, daysTogether, resetState } from "@/lib/state";
import { badges } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — LoveSpace" },
      { name: "description", content: "Профиль вашей пары, настройки, подписка." },
    ],
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
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Профиль" />

        <div className="px-5 pb-12 md:px-8">
          {/* карточка пары */}
          <section className="rounded-3xl bg-gradient-romantic p-6 text-primary-foreground shadow-glow">
            <div className="flex items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/95 text-3xl">
                {s.me.emoji}
              </div>
              <span className="text-2xl">💞</span>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/95 text-3xl">
                {s.partner.emoji}
              </div>
            </div>
            <p className="mt-4 text-center text-sm opacity-90">
              {s.me.name} & {s.partner.name}
            </p>
            <p className="text-center font-display text-3xl font-bold">{days} дней вместе</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Streak" value={`${s.streak}`} />
              <Stat label="Рекорд" value={`${s.recordStreak}`} />
              <Stat label="Бейджи" value={`${s.earnedBadges.length}`} />
            </div>
          </section>

          {/* premium */}
          {!s.premium && (
            <section className="mt-5 rounded-3xl bg-gradient-soft p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-display text-lg font-semibold">LoveSpace Premium</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Полная история «Памяти», эксклюзивные испытания и идеи для свиданий.
              </p>
              <button
                onClick={() => set({ premium: true })}
                className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Попробовать 7 дней бесплатно
              </button>
            </section>
          )}

          {/* бейджи */}
          <section className="mt-6">
            <h3 className="px-1 font-display text-lg font-semibold">Бейджи</h3>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {badges.map((b) => {
                const owned = s.earnedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border bg-card p-3 text-center transition-smooth"
                    style={{ opacity: owned ? 1 : 0.4 }}
                  >
                    <div className="text-3xl">{b.icon}</div>
                    <p className="mt-1 text-[11px] font-medium leading-tight">{b.title}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* настройки */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <SettingRow label="Код пары" value={s.coupleCode} />
            <SettingRow
              label="18+ верификация"
              value={s.verifiedAdult ? "Включена" : "Выключена"}
              onClick={() => set({ verifiedAdult: !s.verifiedAdult })}
            />
            <SettingRow
              label="Выходной фильтр 18+"
              value={s.adultFilterOff ? "Скрыто" : "Видно"}
              onClick={() => set({ adultFilterOff: !s.adultFilterOff })}
            />
            <SettingRow label="Утреннее уведомление" value="09:00" />
          </section>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href="/memory"
              className="rounded-full border border-border bg-card py-3 text-center text-sm font-semibold transition-smooth hover:bg-muted"
            >
              Открыть «Память»
            </a>
            <button
              onClick={logout}
              className="rounded-full py-3 text-center text-sm font-semibold text-destructive transition-smooth hover:bg-destructive/10"
            >
              Выйти и сбросить демо
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/15 px-2 py-2 backdrop-blur">
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
    </div>
  );
}

function SettingRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-border px-4 py-3.5 text-left text-sm last:border-b-0 transition-smooth hover:bg-muted/40"
    >
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </Tag>
  );
}
