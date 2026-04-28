import { cn } from "@/lib/utils";
import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

export const Component = () => {
  // Kept to match provided component signature
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen w-full bg-background relative">
      {/* Magenta Orb Grid Background */}
      <div
        className="absolute inset-0 z-0 animate-grid-float"
        style={{
          background: "transparent",
          backgroundImage: `
            linear-gradient(to right, rgba(71,85,105,0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71,85,105,0.14) 1px, transparent 1px),
            radial-gradient(circle at 50% 60%, rgba(236,72,153,0.14) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)
          `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      />
      {/* Your Content/Components */}
    </div>
  );
};

export function GridBackground({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="absolute inset-0 z-0">
        <Component />
      </div>

      {/* Soft blobs (extra depth) */}
      <div className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-primary/10 blur-[60px] animate-orb-drift" />
      <div className="pointer-events-none absolute -right-32 top-24 z-0 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-[70px] animate-orb-drift [animation-delay:-6s]" />

      {/* Romantic particles (subtle, not distracting) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Heart
          className="heart-particle absolute left-8 top-24 text-fuchsia-500/25"
          fill="currentColor"
          size={14}
          style={{ animationDelay: "240ms" }}
        />
        <Heart
          className="heart-particle absolute left-20 top-44 text-primary/18"
          fill="currentColor"
          size={12}
          style={{ animationDelay: "900ms" }}
        />
        <Heart
          className="heart-particle absolute right-16 top-28 text-primary/20"
          fill="currentColor"
          size={12}
          style={{ animationDelay: "520ms" }}
        />
        <Sparkles
          className="sparkle-pop absolute right-10 top-48 text-primary/15"
          size={18}
          style={{ animationDelay: "180ms" }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

