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
  coupleId?: string;
  me: PartnerProfile;
  partner: PartnerProfile;
  coupleCode: string;
  coupleType: CoupleType;
  startDate: string;
  streak: number;
  recordStreak: number;
  premium: boolean;
  verifiedAdult: boolean;
  adultFilterOff: boolean;
  todayAnswered: { me: boolean; partner: boolean };
  todayMyAnswer: string;
  todayPartnerAnswer: string;
  q36: Record<string, { me?: string; partner?: string }>;
  capsule: CapsuleItem[];
  memory: { id: string; date: string; type: string; title: string }[];
  earnedBadges: string[];
}

const STORAGE_PREFIX = "lovespace_state_v3:";
const ANON_KEY = `${STORAGE_PREFIX}__anon__`;
const OWNER_KEY = "lovespace_state_owner_v3";

const DEFAULT_STATE: AppState = {
  onboarded: false,
  me: { name: "Ты", emoji: "🍂" },
  partner: { name: "Партнёр", emoji: "🦊" },
  coupleCode: "",
  coupleType: "together",
  startDate: new Date().toISOString(),
  streak: 0,
  recordStreak: 0,
  premium: false,
  verifiedAdult: false,
  adultFilterOff: false,
  todayAnswered: { me: false, partner: false },
  todayMyAnswer: "",
  todayPartnerAnswer: "",
  q36: {},
  capsule: [],
  memory: [],
  earnedBadges: [],
};

const isBrowser = typeof window !== "undefined";

const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};

function ownerKey(uid: string | null): string {
  return uid ? `${STORAGE_PREFIX}${uid}` : ANON_KEY;
}

let currentOwner: string | null = isBrowser ? storage.get<string | null>(OWNER_KEY, null) : null;
let memState: AppState = storage.get<AppState>(ownerKey(currentOwner), DEFAULT_STATE);
const listeners = new Set<() => void>();

function persist() {
  storage.set(ownerKey(currentOwner), memState);
}

function notify() {
  persist();
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return memState;
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const next = typeof patch === "function" ? patch(memState) : patch;
  memState = { ...memState, ...next };
  notify();
}

export function useAppState(): [AppState, typeof setState] {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
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

/**
 * Переключает локальный стор на конкретного пользователя (uid).
 * Загружает его персональный snapshot из localStorage. На null — переключается
 * на анонимный стор и не теряет дефолты.
 */
export function bindStateToUser(uid: string | null) {
  if (currentOwner === uid) return;
  currentOwner = uid;
  storage.set(OWNER_KEY, uid);
  memState = storage.get<AppState>(ownerKey(uid), DEFAULT_STATE);
  listeners.forEach((l) => l());
}

export function getCurrentOwner(): string | null {
  return currentOwner;
}
