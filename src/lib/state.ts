import { differenceInCalendarDays, format } from "date-fns";
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
  partnerUid?: string;
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
  startDate: format(new Date(), "yyyy-MM-dd"),
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

/** Локальный календарный день начала (YYYY-MM-DD как в date picker или префикс ISO). */
function relationshipStartAsLocalDay(isoOrYmd: string): Date {
  const raw = isoOrYmd.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return new Date(raw);
}

/** Склонение: 1 день, 2 дня, 5 дней. */
export function ruDaysNoun(n: number): string {
  const k = Math.abs(Math.trunc(n));
  const mod10 = k % 10;
  const mod100 = k % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

/** Календарные дни «вместе» с даты начала включительно (первый день = 1). */
export function daysTogether(startISO: string) {
  const start = relationshipStartAsLocalDay(startISO);
  if (Number.isNaN(start.getTime())) return 0;
  const gap = differenceInCalendarDays(new Date(), start);
  if (gap < 0) return 0;
  return gap + 1;
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
