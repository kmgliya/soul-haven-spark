import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { registerPushForUser } from "@/lib/fcm-token";
import { useCoupleSync } from "@/lib/use-couple-sync";
import { useQ36Sync } from "@/lib/use-q36-sync";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">Похоже, такой страницы здесь нет.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "LoveSpace — приложение для пар" },
      {
        name: "description",
        content:
          "LoveSpace — ежедневные активности, общая капсула воспоминаний и идеи для свиданий для пар.",
      },
      { name: "author", content: "LoveSpace" },
      { property: "og:title", content: "LoveSpace — приложение для пар" },
      {
        property: "og:description",
        content: "Ежедневные активности и общая капсула воспоминаний для пар.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
        <Scripts />
      </body>
    </html>
  );
}

function CoupleSyncBridge() {
  useCoupleSync();
  useQ36Sync();
  return null;
}

function FcmRegisterBridge() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    void registerPushForUser(user.uid).catch(() => {
      /* нет VAPID / SW / разрешения */
    });
  }, [user]);
  return null;
}

function RootComponent() {
  return (
    <AuthProvider>
      <CoupleSyncBridge />
      <FcmRegisterBridge />
      <Outlet />
    </AuthProvider>
  );
}
