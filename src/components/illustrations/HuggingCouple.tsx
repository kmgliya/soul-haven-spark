import * as React from "react";

import { cn } from "@/lib/utils";

export function HuggingCouple({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 360"
      className={cn("h-auto w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* soft blob background */}
      <defs>
        <linearGradient
          id="hc_grad"
          x1="60"
          y1="50"
          x2="460"
          y2="330"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgba(255,255,255,0.92)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.45)" />
        </linearGradient>
        <filter id="hc_blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <path
        d="M116 236c18-84 124-150 226-122 85 23 130 107 94 170-41 73-163 88-246 55-52-21-87-55-74-103z"
        fill="rgba(255,255,255,0.22)"
        filter="url(#hc_blur)"
      />

      {/* couple group */}
      <g>
        {/* left person */}
        <g>
          <circle cx="205" cy="150" r="34" fill="url(#hc_grad)" />
          <path
            d="M170 255c4-48 32-76 68-76 40 0 65 30 68 78 2 30-30 50-102 50-66 0-36-22-34-52z"
            fill="rgba(255,255,255,0.22)"
          />
          <path
            d="M182 195c14-18 30-26 48-26 20 0 39 10 55 28"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M190 126c8-12 20-18 36-18 14 0 26 6 34 16"
            stroke="rgba(17,24,39,0.35)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>

        {/* right person */}
        <g>
          <circle cx="310" cy="155" r="34" fill="rgba(255,255,255,0.75)" />
          <path
            d="M274 260c4-48 32-76 68-76 40 0 65 30 68 78 2 30-30 50-102 50-66 0-36-22-34-52z"
            fill="rgba(255,255,255,0.18)"
          />
          <path
            d="M336 200c-14-18-30-26-48-26-20 0-39 10-55 28"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M298 132c8-12 20-18 36-18 14 0 26 6 34 16"
            stroke="rgba(17,24,39,0.25)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>

        {/* shared heart */}
        <path
          d="M260 168c-10-14-30-12-36 4-6 16 10 32 36 50 26-18 42-34 36-50-6-16-26-18-36-4z"
          fill="rgba(255,255,255,0.78)"
        />
      </g>
    </svg>
  );
}
