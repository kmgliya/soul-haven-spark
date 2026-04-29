import { useEffect, useState } from "react";

export type CoupleType = "together" | "city" | "ldr";

export interface PartnerProfile {
  name: string;
  emoji: string;
  avatarImage?: string; // dataURL (локально), если пользователь загрузил фото
  birthday?: string;
}

export interface CapsuleItem {
  id: string;
  from: "me" | "partner";
  text?: string;
  emoji?: string;
  image?: string;
  date: string;
  openAt?: string; // если в будущем — капсула закрыта до этого времени
}

export interface AppState {
  onboarded: boolean;
  me: PartnerProfile;
  partner: PartnerProfile;
  coupleCode: string;
  coupleType: CoupleType;
  startDate: string;
  streak: number;
  recordStreak: number;
  premium: boolean;
  verifiedAdult: boolean; // Добавлено
  adultFilterOff: boolean; // Добавлено
  todayAnswered: { me: boolean; partner: boolean };
  todayMyAnswer: string;
  todayPartnerAnswer: string;
  q36: Record<string, { me?: string; partner?: string }>;
  capsule: CapsuleItem[];
  memory: { id: string; date: string; type: string; title: string }[];
  earnedBadges: string[];
}

const STORAGE_KEY = "lovespace_premium_v2";

const DEFAULT_STATE: AppState = {
  onboarded: false,
  me: { name: "Ты", emoji: "🍂" },
  partner: { name: "Партнёр", emoji: "🦊" },
  coupleCode: "LOVE-2024",
  coupleType: "together",
  startDate: new Date().toISOString(),
  streak: 3,
  recordStreak: 5,
  premium: false,
  verifiedAdult: false,
  adultFilterOff: false,
  todayAnswered: { me: false, partner: true },
  todayMyAnswer: "",
  todayPartnerAnswer: "Я очень ценю нашу атмосферу. ❤️",
  q36: {},
  capsule: [],
  memory: [
    {
      id: "m1",
      date: new Date().toISOString(),
      type: "milestone",
      title: "Начало истории",
    },
  ],
  earnedBadges: ["b1"],
};

const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  },
  set: <T>(key: string, value: T) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  },
};

let memState: AppState = storage.get<AppState>(STORAGE_KEY, DEFAULT_STATE);
const listeners = new Set<() => void>();

function notify() {
  storage.set(STORAGE_KEY, memState);
  listeners.forEach((l) => l());
}

export function getState() {
  return memState;
}

export function setState(
  patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)
) {
  const next = typeof patch === "function" ? patch(memState) : patch;
  memState = { ...memState, ...next };
  notify();
}

export function useAppState(): [AppState, typeof setState] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return [memState, setState];
}

export function daysTogether(startISO: string) {
  const start = new Date(startISO).getTime();
  const diff = Date.now() - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function resetState() {
  memState = { ...DEFAULT_STATE };
  notify();
}