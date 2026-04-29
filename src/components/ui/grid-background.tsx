import { cn } from "@/lib/utils";
import { useState, type CSSProperties } from "react";
import { Heart, Sparkles } from "lucide-react";

export const Component = () => {
  // Kept to match provided component signature
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen w-full bg-background relative">
      {/* Sky grid + soft gradient */}
      <div
        className="absolute inset-0 z-0 animate-grid-float"
        style={{
          background:
            "linear-gradient(180deg, rgba(92,200,255,0.10) 0%, rgba(255,121,198,0.06) 40%, rgba(245,251,255,1) 100%)",
          backgroundImage: `
            linear-gradient(to right, rgba(11,18,32,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(11,18,32,0.05) 1px, transparent 1px),
            radial-gradient(circle at 55% 30%, rgba(92,200,255,0.16) 0%, rgba(255,121,198,0.10) 35%, transparent 70%)
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
  const hearts = [
    { left: "6%", top: "12%", size: 12, o: 0.14, d: "120ms" },
    { left: "12%", top: "26%", size: 14, o: 0.12, d: "520ms" },
    { left: "18%", top: "44%", size: 12, o: 0.1, d: "900ms" },
    { left: "9%", top: "62%", size: 16, o: 0.1, d: "260ms" },
    { left: "24%", top: "18%", size: 10, o: 0.1, d: "760ms" },
    { left: "34%", top: "34%", size: 12, o: 0.08, d: "340ms" },
    { left: "42%", top: "16%", size: 14, o: 0.1, d: "620ms" },
    { left: "58%", top: "22%", size: 12, o: 0.08, d: "180ms" },
    { left: "70%", top: "12%", size: 14, o: 0.1, d: "460ms" },
    { left: "82%", top: "20%", size: 12, o: 0.08, d: "820ms" },
    { left: "88%", top: "38%", size: 16, o: 0.1, d: "240ms" },
    { left: "76%", top: "54%", size: 12, o: 0.08, d: "1000ms" },
    { left: "62%", top: "66%", size: 14, o: 0.1, d: "560ms" },
    { left: "46%", top: "74%", size: 12, o: 0.08, d: "720ms" },
    { left: "22%", top: "80%", size: 14, o: 0.09, d: "410ms" },
  ] as const;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="absolute inset-0 z-0">
        <Component />
      </div>

      {/* Flying cloud blobs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="cloud left-[10%] top-[12%] h-[220px] w-[360px] opacity-70"
          style={
            {
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(92,200,255,0.22), transparent 62%), radial-gradient(ellipse at 65% 55%, rgba(255,121,198,0.16), transparent 64%)",
              "--dur": "22s",
            } as CSSProperties
          }
        />
        <div
          className="cloud right-[8%] top-[22%] h-[180px] w-[320px] opacity-60"
          style={
            {
              background:
                "radial-gradient(ellipse at 40% 55%, rgba(255,121,198,0.18), transparent 62%), radial-gradient(ellipse at 70% 40%, rgba(167,139,250,0.14), transparent 66%)",
              "--dur": "26s",
            } as CSSProperties
          }
        />
        <div
          className="cloud left-[18%] bottom-[10%] h-[200px] w-[380px] opacity-55"
          style={
            {
              background:
                "radial-gradient(ellipse at 45% 45%, rgba(92,200,255,0.18), transparent 64%), radial-gradient(ellipse at 75% 55%, rgba(255,121,198,0.12), transparent 66%)",
              "--dur": "19s",
            } as CSSProperties
          }
        />
        <div
          className="cloud right-[16%] bottom-[18%] h-[160px] w-[320px] opacity-55"
          style={
            {
              background:
                "radial-gradient(ellipse at 30% 60%, rgba(92,200,255,0.16), transparent 65%), radial-gradient(ellipse at 70% 40%, rgba(255,121,198,0.12), transparent 70%)",
              "--dur": "24s",
            } as CSSProperties
          }
        />
      </div>

      {/* Romantic particles (subtle, not distracting) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {hearts.map((h, idx) => (
          <Heart
            key={idx}
            className="heart-particle absolute"
            fill="currentColor"
            size={h.size}
            style={{
              left: h.left,
              top: h.top,
              color: idx % 3 === 0 ? "rgba(255,121,198,1)" : "rgba(92,200,255,1)",
              opacity: h.o,
              animationDelay: h.d,
            }}
          />
        ))}

        <Sparkles
          className="sparkle-pop absolute right-[10%] top-[28%]"
          size={18}
          style={{ opacity: 0.14, animationDelay: "180ms" }}
        />
        <Sparkles
          className="sparkle-pop absolute right-[18%] top-[62%]"
          size={16}
          style={{ opacity: 0.12, animationDelay: "520ms" }}
        />
        <Sparkles
          className="sparkle-pop absolute left-[22%] top-[58%]"
          size={18}
          style={{ opacity: 0.1, animationDelay: "860ms" }}
        />
      </div>

      {/* soft vignette */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/0 via-white/0 to-sky-950/5" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
