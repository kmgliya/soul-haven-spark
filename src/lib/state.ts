// Глобальное mock-состояние пары. Хранится в localStorage.
import { useEffect, useState } from "react";
import { storage } from "./storage";

export type CoupleType = "together" | "city" | "ldr";

export interface PartnerProfile {
  name: string;
  birthday?: string;
  emoji: string;
}

export interface AppState {
  onboarded: boolean;
  me: PartnerProfile;
  partner: PartnerProfile;
  coupleCode: string;
  coupleType: CoupleType;
  startDate: string; // ISO
  streak: number;
  recordStreak: number;
  verifiedAdult: boolean;
  adultFilterOff: boolean;
  premium: boolean;
  // активность дня
  todayAnswered: { me: boolean; partner: boolean };
  todayMyAnswer: string;
  todayPartnerAnswer: string;
  // капсула
  capsule: { id: string; from: "me" | "partner"; text?: string; emoji?: string; date: string }[];
  // память
  memory: { id: string; date: string; type: string; title: string }[];
  earnedBadges: string[];
}

const DEFAULT: AppState = {
  onboarded: false,
  me: { name: "Ты", emoji: "🌸" },
  partner: { name: "Партнёр", emoji: "🌿" },
  coupleCode: "L0VE",
  coupleType: "together",
  startDate: new Date().toISOString(),
  streak: 0,
  recordStreak: 0,
  verifiedAdult: false,
  adultFilterOff: false,
  premium: false,
  todayAnswered: { me: false, partner: false },
  todayMyAnswer: "",
  todayPartnerAnswer: "Я очень ценю как ты заботишься обо мне. Спасибо что ты есть. ❤️",
  capsule: [
    { id: "seed1", from: "partner", text: "Скучаю по тебе уже 🥺", emoji: "💌", date: new Date(Date.now() - 86400000).toISOString() },
    { id: "seed2", from: "partner", text: "Наш закат вчера", emoji: "🌅", date: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
  memory: [
    { id: "m1", date: new Date(Date.now() - 7 * 86400000).toISOString(), type: "challenge", title: "Завершено: 7 дней благодарности" },
    { id: "m2", date: new Date(Date.now() - 3 * 86400000).toISOString(), type: "question", title: "Ответили на вопрос дня" },
  ],
  earnedBadges: ["b1"],
};

const KEY = "lovespace.state.v1";

let memState: AppState = storage.get<AppState>(KEY, DEFAULT);
const listeners = new Set<() => void>();

function notify() {
  storage.set(KEY, memState);
  listeners.forEach((l) => l());
}

export function getState() {
  return memState;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const next = typeof patch === "function" ? patch(memState) : patch;
  memState = { ...memState, ...next };
  notify();
}

export function resetState() {
  memState = DEFAULT;
  notify();
}

export function useAppState(): [AppState, typeof setState] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    // hydrate from storage on mount (SSR safety)
    memState = storage.get<AppState>(KEY, memState);
    force((n) => n + 1);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return [memState, setState];
}

export function daysTogether(startISO: string) {
  const start = new Date(startISO).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / 86400000));
}
