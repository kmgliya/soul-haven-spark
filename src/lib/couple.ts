import { format } from "date-fns";
import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { getDb } from "@/lib/firebase";
import type { CoupleType, PartnerProfile } from "@/lib/state";

export interface CoupleDoc {
  id: string;
  members: string[];
  creator: string;
  coupleCode: string;
  coupleType: CoupleType;
  startDate: string;
  profiles: Record<string, PartnerProfile>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const COLLECTION = "couples";
const INVITES = "coupleInvites";

function stripUndefined<T>(value: T): T {
  if (value === undefined) return value;
  if (value === null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Firestore не инициализирован. Проверь .env.local");
  return db;
}

function throwIfFirestorePermissionDenied(
  e: unknown,
  where: "invite_read" | "batch_write" | "join_read" | "join_transaction",
): void {
  if (e instanceof FirebaseError && e.code === "permission-denied") {
    if (where === "invite_read") {
      throw new Error(
        "Firestore: нет прав на чтение coupleInvites. Открой Firebase → Firestore → Rules, вставь весь текст из файла firestore.rules в проекте (там есть блок match /coupleInvites/) и нажми Publish. Либо в терминале проекта: firebase deploy --only firestore:rules.",
      );
    }
    if (where === "join_read") {
      throw new Error(
        "Firestore: нет прав на чтение приглашения или пары при входе по коду. Опубликуй актуальные firestore.rules из репозитория (couples: get для пары с одним участником; coupleInvites: read). Publish в консоли или firebase deploy --only firestore:rules.",
      );
    }
    if (where === "join_transaction") {
      throw new Error(
        "Firestore: нет прав завершить присоединение (обновление пары или удаление инвайта). Опубликуй последний firestore.rules из репозитория — там разрешено удаление coupleInvites при join вторым участником. Publish или firebase deploy --only firestore:rules.",
      );
    }
    throw new Error(
      "Firestore: нет прав на запись пары. Проверь: ты вошла в аккаунт; VITE_FIREBASE_PROJECT_ID в .env.local = id проекта в консоли; в Rules опубликован полный firestore.rules из репозитория (Publish или firebase deploy --only firestore:rules).",
    );
  }
}

export function normalizeCoupleCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Дата начала отношений в Firestore: только календарный YYYY-MM-DD (как в date picker). */
export function normalizeStartDateForStorage(raw: string): string {
  const t = raw.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    throw new Error("Некорректная дата начала.");
  }
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    throw new Error("Некорректная дата начала.");
  }
  return t;
}

function readStartDateFromFirestore(value: unknown): string {
  if (value instanceof Timestamp) {
    return format(value.toDate(), "yyyy-MM-dd");
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) return format(d, "yyyy-MM-dd");
  }
  return format(new Date(), "yyyy-MM-dd");
}

function snapshotToCouple(
  snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): CoupleDoc {
  const raw = snap.data();
  if (!raw) {
    return {
      id: snap.id,
      members: [],
      creator: "",
      coupleCode: "",
      coupleType: "together",
      startDate: format(new Date(), "yyyy-MM-dd"),
      profiles: {},
    };
  }
  const data = raw;
  return {
    id: snap.id,
    members: (data.members as string[] | undefined) ?? [],
    creator: (data.creator as string | undefined) ?? "",
    coupleCode: (data.coupleCode as string | undefined) ?? "",
    coupleType: (data.coupleType as CoupleType | undefined) ?? "together",
    startDate: readStartDateFromFirestore(data.startDate),
    profiles: (data.profiles as Record<string, PartnerProfile> | undefined) ?? {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function createCouple(input: {
  uid: string;
  profile: PartnerProfile;
  coupleCode: string;
  coupleType: CoupleType;
  startDate: string;
}): Promise<CoupleDoc> {
  const db = requireDb();
  const code = normalizeCoupleCode(input.coupleCode);
  const startYmd = normalizeStartDateForStorage(input.startDate);
  const profile = stripUndefined(input.profile);

  const inviteRef = doc(db, INVITES, code);
  let existingInvite;
  try {
    existingInvite = await getDoc(inviteRef);
  } catch (e) {
    throwIfFirestorePermissionDenied(e, "invite_read");
    throw e;
  }
  if (existingInvite.exists()) {
    throw new Error("Такой код пары уже занят. Попробуй сгенерировать новый.");
  }

  const batch = writeBatch(db);
  const coupleRef = doc(collection(db, COLLECTION));
  batch.set(coupleRef, {
    members: [input.uid],
    creator: input.uid,
    coupleCode: code,
    coupleType: input.coupleType,
    startDate: startYmd,
    profiles: { [input.uid]: profile },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(inviteRef, {
    coupleId: coupleRef.id,
    createdBy: input.uid,
    code,
  });
  try {
    await batch.commit();
  } catch (e) {
    throwIfFirestorePermissionDenied(e, "batch_write");
    throw e;
  }

  return {
    id: coupleRef.id,
    members: [input.uid],
    creator: input.uid,
    coupleCode: code,
    coupleType: input.coupleType,
    startDate: startYmd,
    profiles: { [input.uid]: profile },
  };
}

export async function joinCoupleByCode(input: {
  uid: string;
  profile: PartnerProfile;
  coupleCode: string;
}): Promise<CoupleDoc> {
  const db = requireDb();
  const code = normalizeCoupleCode(input.coupleCode);
  const profile = stripUndefined(input.profile);

  const inviteRef = doc(db, INVITES, code);
  let inviteSnap;
  try {
    inviteSnap = await getDoc(inviteRef);
  } catch (e) {
    throwIfFirestorePermissionDenied(e, "invite_read");
    throw e;
  }
  if (!inviteSnap.exists()) {
    throw new Error(
      "Пара с таким кодом не найдена. Попроси партнёра открыть экран с кодом ещё раз (или обновить код).",
    );
  }
  const coupleId = inviteSnap.data().coupleId as string;
  const coupleRef = doc(db, COLLECTION, coupleId);

  let prelude;
  try {
    prelude = await getDoc(coupleRef);
  } catch (e) {
    throwIfFirestorePermissionDenied(e, "join_read");
    throw e;
  }
  if (!prelude.exists()) throw new Error("Пара не найдена.");
  const preludeMembers = (prelude.data().members as string[] | undefined) ?? [];
  if (preludeMembers.includes(input.uid)) {
    return snapshotToCouple(prelude);
  }

  try {
    await runTransaction(db, async (tx) => {
      const inviteFresh = await tx.get(inviteRef);
      if (!inviteFresh.exists()) throw new Error("Пара с таким кодом не найдена.");
      const fresh = await tx.get(coupleRef);
      if (!fresh.exists()) throw new Error("Пара не найдена.");
      const data = fresh.data() as DocumentData;
      const members = (data.members as string[] | undefined) ?? [];
      if (members.length >= 2) {
        throw new Error("В этой паре уже два участника.");
      }
      tx.update(coupleRef, {
        members: arrayUnion(input.uid),
        [`profiles.${input.uid}`]: profile,
        updatedAt: serverTimestamp(),
      });
      tx.delete(inviteRef);
    });
  } catch (e) {
    throwIfFirestorePermissionDenied(e, "join_transaction");
    throw e;
  }

  const finalSnap = await getDoc(coupleRef);
  if (!finalSnap.exists()) throw new Error("Пара не найдена.");
  return snapshotToCouple(finalSnap);
}

/**
 * Если пара создана до появления `coupleInvites`, создатель может восстановить приглашение по текущему коду.
 */
export async function syncCoupleInviteFromCoupleDoc(couple: CoupleDoc): Promise<void> {
  if (couple.members.length !== 1) return;
  const db = requireDb();
  const code = normalizeCoupleCode(couple.coupleCode);
  if (code.length < 4) return;
  const inviteRef = doc(db, INVITES, code);
  const snap = await getDoc(inviteRef);
  if (snap.exists()) return;
  await setDoc(inviteRef, {
    coupleId: couple.id,
    createdBy: couple.creator,
    code,
  });
}

export async function findCoupleByMember(uid: string): Promise<CoupleDoc | null> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("members", "array-contains", uid), limit(1)),
  );
  if (snap.empty) return null;
  return snapshotToCouple(snap.docs[0]);
}

/**
 * После записи в Firestore запрос `array-contains` иногда сразу возвращает пусто;
 * гард на /home не должен из‑за этого слать обратно на /onboarding.
 */
export async function findCoupleByMemberReliable(
  uid: string,
  opts: { attempts?: number; delayMs?: number } = {},
): Promise<CoupleDoc | null> {
  const attempts = opts.attempts ?? 12;
  const delayMs = opts.delayMs ?? 350;
  for (let i = 0; i < attempts; i++) {
    try {
      const c = await findCoupleByMember(uid);
      if (c) return c;
    } catch {
      /* сеть / временные права — повторим */
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

export function subscribeToCoupleByMember(
  uid: string,
  cb: (couple: CoupleDoc | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const db = requireDb();
  const q = query(collection(db, COLLECTION), where("members", "array-contains", uid), limit(1));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        cb(null);
        return;
      }
      cb(snapshotToCouple(snap.docs[0]));
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}

export async function updateCoupleProfile(input: {
  coupleId: string;
  uid: string;
  profile: Partial<PartnerProfile>;
}): Promise<void> {
  const db = requireDb();
  const ref = doc(db, COLLECTION, input.coupleId);
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(stripUndefined(input.profile))) {
    patch[`profiles.${input.uid}.${k}`] = v;
  }
  await updateDoc(ref, patch);
}

export async function updateCoupleMeta(input: {
  coupleId: string;
  patch: Partial<Pick<CoupleDoc, "coupleType" | "startDate">>;
}): Promise<void> {
  const db = requireDb();
  const ref = doc(db, COLLECTION, input.coupleId);
  await updateDoc(ref, { ...input.patch, updatedAt: serverTimestamp() });
}
