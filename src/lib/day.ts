import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type DayId = string; // YYYY-MM-DD

export interface DayDoc {
  id: DayId;
  date: DayId;
  questionOfDay?: {
    q: string;
    answers?: Record<string, string>;
    done?: Record<string, boolean>;
    finishedAt?: Record<string, unknown>;
  };
  guessGame?: {
    version: number;
    step?: Record<string, number>;
    picks?: Record<string, number[]>;
    done?: Record<string, boolean>;
    finishedAt?: Record<string, unknown>;
  };
  nudges?: {
    requestedAt?: Record<string, unknown>; // uid -> timestamp
    from?: Record<string, string>; // uid -> who nudged
  };
}

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Firestore не инициализирован. Проверь переменные окружения.");
  return db;
}

export function todayId(d = new Date()): DayId {
  return d.toISOString().slice(0, 10);
}

export function dayDocRef(coupleId: string, dayId: DayId) {
  const db = requireDb();
  return doc(db, "couples", coupleId, "days", dayId);
}

export function subscribeDay(
  coupleId: string,
  dayId: DayId,
  cb: (doc: DayDoc | null) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const ref = dayDocRef(coupleId, dayId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      const data = snap.data() as DocumentData;
      cb({ id: dayId, date: dayId, ...(data as object) } as DayDoc);
    },
    (err) => onError?.(err),
  );
}

export async function ensureDayBase(input: {
  coupleId: string;
  dayId: DayId;
  question: string;
  guessVersion: number;
}) {
  const ref = dayDocRef(input.coupleId, input.dayId);
  await setDoc(
    ref,
    {
      date: input.dayId,
      questionOfDay: { q: input.question },
      guessGame: { version: input.guessVersion },
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function submitQuestionAnswer(input: {
  coupleId: string;
  dayId: DayId;
  uid: string;
  answer: string;
}) {
  const ref = dayDocRef(input.coupleId, input.dayId);
  const patch = {
    [`questionOfDay.answers.${input.uid}`]: input.answer,
    [`questionOfDay.done.${input.uid}`]: true,
    [`questionOfDay.finishedAt.${input.uid}`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    date: input.dayId,
  } as Record<string, unknown>;
  try {
    await updateDoc(ref, patch);
  } catch {
    await setDoc(ref, patch, { merge: true });
  }
}

export async function submitGuessPick(input: {
  coupleId: string;
  dayId: DayId;
  uid: string;
  step: number;
  pick: number;
  picks: number[];
  done: boolean;
}) {
  const ref = dayDocRef(input.coupleId, input.dayId);
  const patch: Record<string, unknown> = {
    [`guessGame.step.${input.uid}`]: input.step,
    [`guessGame.picks.${input.uid}`]: input.picks,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    date: input.dayId,
  };
  if (input.done) {
    patch[`guessGame.done.${input.uid}`] = true;
    patch[`guessGame.finishedAt.${input.uid}`] = serverTimestamp();
  }
  try {
    await updateDoc(ref, patch);
  } catch {
    await setDoc(ref, patch, { merge: true });
  }
}

export async function requestNudge(input: {
  coupleId: string;
  dayId: DayId;
  toUid: string;
  fromUid: string;
}) {
  const ref = dayDocRef(input.coupleId, input.dayId);
  const patch = {
    [`nudges.requestedAt.${input.toUid}`]: serverTimestamp(),
    [`nudges.from.${input.toUid}`]: input.fromUid,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    date: input.dayId,
  } as Record<string, unknown>;
  try {
    await updateDoc(ref, patch);
  } catch {
    await setDoc(ref, patch, { merge: true });
  }
}

