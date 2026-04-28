import { cn } from "@/lib/utils";

export function GridBackground({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Magenta Orb Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 animate-grid-float"
        style={{
          background: "transparent",
          backgroundImage: `
            linear-gradient(to right, rgba(71,85,105,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71,85,105,0.12) 1px, transparent 1px),
            radial-gradient(circle at 50% 60%, rgba(var(--color-primary-rgb),0.18) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)
          `,
          backgroundSize: "44px 44px, 44px 44px, 100% 100%",
          maskImage: "radial-gradient(circle at 50% 40%, black 40%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 40%, transparent 72%)",
        }}
      />

      {/* Soft blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/12 blur-[60px] animate-orb-drift" />
      <div className="pointer-events-none absolute -right-32 top-24 -z-10 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-[70px] animate-orb-drift [animation-delay:-6s]" />

      {children}
    </div>
  );
}

