import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sparkles, Image as ImageIcon, Lightbulb, User } from "lucide-react";

const items = [
  { to: "/home", label: "Дом", icon: Home },
  { to: "/today", label: "Сегодня", icon: Sparkles },
  { to: "/capsule", label: "Капсула", icon: ImageIcon },
  { to: "/ideas", label: "Идеи", icon: Lightbulb },
  { to: "/profile", label: "Профиль", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-smooth"
                style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-sidebar md:px-4 md:py-6">
      <Link to="/home" className="mb-8 flex items-center gap-2 px-2">
        <span className="text-2xl">💞</span>
        <span className="font-display text-2xl font-bold tracking-tight">LoveSpace</span>
      </Link>
      <ul className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth"
                style={{
                  background: active ? "var(--color-secondary)" : "transparent",
                  color: active ? "var(--color-primary)" : "var(--color-foreground)",
                }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto rounded-2xl bg-gradient-soft p-4 text-sm">
        <p className="font-display text-base font-semibold">LoveSpace Premium</p>
        <p className="mt-1 text-xs text-muted-foreground">Полная история, эксклюзивные идеи и испытания.</p>
        <Link
          to="/profile"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
        >
          Узнать больше
        </Link>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
