import { Link, useLocation } from "@tanstack/react-router";
import { Home, Sparkles, Image as ImageIcon, Lightbulb, User, Heart } from "lucide-react";
import React from "react";
import { GridBackground } from "@/components/ui/grid-background";
import { PremiumPaywallDialog } from "@/components/PremiumPaywallDialog";

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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 md:hidden">
      <nav className="flex items-center gap-1 rounded-[28px] border border-border bg-background/70 p-2 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                active
                  ? "bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {active && <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function SideNav() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-background md:px-6 md:py-10">
      <Link to="/home" className="mb-12 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]">
          <Heart className="text-primary-foreground" fill="currentColor" size={20} />
        </div>
        <span className="font-display text-2xl font-bold tracking-tight text-foreground">
          LoveSpace
        </span>
      </Link>

      <ul className="flex flex-col gap-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                {label}
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto overflow-hidden rounded-[24px] border border-border bg-card p-6 shadow-sm">
        <p className="font-display text-lg font-bold text-foreground">Premium</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Откройте все возможности для вашей пары.
        </p>
        <PremiumPaywallDialog
          trigger={
            <button className="btn-accent mt-4 flex h-12 w-full items-center justify-center text-xs">
              <span className="relative z-10">Узнать больше</span>
            </button>
          }
        />
        <Link
          to="/profile"
          className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-border bg-background/70 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          Профиль
        </Link>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <SideNav />
      <main className="relative flex-1 overflow-y-auto pb-32 md:pb-0">
        <GridBackground className="min-h-screen">
          <div className="relative z-10">{children}</div>
        </GridBackground>
      </main>
      <BottomNav />
    </div>
  );
}
