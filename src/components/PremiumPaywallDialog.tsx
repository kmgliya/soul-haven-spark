import * as React from "react";
import { Check, Heart, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Plan = "month" | "year";

export function PremiumPaywallDialog({
  trigger,
  defaultPlan = "month",
  className,
}: {
  trigger: React.ReactNode;
  defaultPlan?: Plan;
  className?: string;
}) {
  const [plan, setPlan] = React.useState<Plan>(defaultPlan);

  const price = plan === "month" ? 299 : 2490;
  const per = plan === "month" ? "мес" : "год";
  const badge = plan === "year" ? "выгоднее" : "попробовать";
  const yearlySave = Math.max(0, 299 * 12 - 2490);
  const socialProof = 12418; // заглушка (позже подтянем из бэка)

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.2)] bg-card p-0 shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:max-w-[520px]",
          className,
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,175,55,0.10)] via-[rgba(232,121,160,0.06)] to-transparent" />
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[rgba(212,175,55,0.08)] blur-[55px]" />
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[rgba(232,121,160,0.07)] blur-[70px]" />

          {/* light heart particles */}
          <div className="pointer-events-none absolute inset-0">
            <Heart
              className="heart-particle absolute left-10 top-10 text-primary/40"
              fill="currentColor"
              size={16}
              style={{ animationDelay: "120ms" }}
            />
            <Heart
              className="heart-particle absolute left-16 top-20 text-fuchsia-500/35"
              fill="currentColor"
              size={12}
              style={{ animationDelay: "620ms" }}
            />
            <Heart
              className="heart-particle absolute right-14 top-14 text-primary/35"
              fill="currentColor"
              size={14}
              style={{ animationDelay: "340ms" }}
            />
            <Sparkles
              className="sparkle-pop absolute right-12 top-24 text-primary/25"
              size={18}
              style={{ animationDelay: "200ms" }}
            />
          </div>

          <div className="relative z-10 p-7">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Premium для вашей пары
              </DialogTitle>
              <DialogDescription className="text-sm font-medium">
                Больше поводов быть ближе: капсула без лимитов, эксклюзивные идеи и задания.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-background/60 p-1.5 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setPlan("month")}
                className={cn(
                  "relative h-11 rounded-[18px] text-xs font-black uppercase tracking-[0.16em] transition-all",
                  plan === "month"
                    ? "bg-[rgba(212,175,55,0.15)] text-primary border border-[rgba(212,175,55,0.3)] shadow-[0_14px_36px_rgba(0,0,0,0.45)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Месяц
              </button>
              <button
                type="button"
                onClick={() => setPlan("year")}
                className={cn(
                  "relative h-11 rounded-[18px] text-xs font-black uppercase tracking-[0.16em] transition-all",
                  plan === "year"
                    ? "bg-[rgba(212,175,55,0.15)] text-primary border border-[rgba(212,175,55,0.3)] shadow-[0_14px_36px_rgba(0,0,0,0.45)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Год
              </button>
            </div>

            <div className="mt-4 rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-background/50 p-6 backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(212,175,55,0.18)] text-primary">
                      <Heart className="animate-heartbeat" size={12} fill="currentColor" />
                    </span>
                    {badge}
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black tracking-[-0.06em] gold-text-shimmer">
                      {price}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      тг / {per}
                    </span>
                  </div>
                  {plan === "year" && (
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      В пересчёте: <span className="text-foreground">≈ 208 тг / мес</span>{" "}
                      <span className="ml-2 inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
                        экономия {yearlySave} тг/год
                      </span>
                    </p>
                  )}
                </div>

                <div className="shrink-0 rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-card px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    для двоих
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">1 подписка</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Капсула без лимита и расширенная память",
                  "Премиум идеи для свиданий и подарков",
                  "Новые задания и челленджи (скоро)",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Check size={14} />
                    </span>
                    <span className="font-medium text-foreground">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between rounded-[18px] border border-border bg-card/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">Почему выгодно</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      На годе дешевле, чем 12 месяцев по отдельности.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  -{Math.round((yearlySave / (299 * 12)) * 100)}%
                </span>
              </div>

              <div className="mt-3 text-center text-[11px] font-semibold text-muted-foreground">
                Уже <span className="text-foreground">{socialProof.toLocaleString("ru-RU")}</span>{" "}
                пар активировали Premium
              </div>

              <Button className="mt-7 h-12 w-full rounded-[18px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_18px_50px_rgba(var(--color-primary-rgb),0.22)] hover:scale-[1.01] active:scale-[0.99] transition-transform">
                Активировать Premium
              </Button>

              <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground">
                Можно отменить в любой момент.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
