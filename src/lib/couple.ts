import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
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

export function normalizeCoupleCode(code: string): string {
  return code.trim().toUpperCase();
}

function snapshotToCouple(snap: QueryDocumentSnapshot<DocumentData>): CoupleDoc {
  const data = snap.data();
  return {
    id: snap.id,
    members: (data.members as string[] | undefined) ?? [],
    creator: (data.creator as string | undefined) ?? "",
    coupleCode: (data.coupleCode as string | undefined) ?? "",
    coupleType: (data.coupleType as CoupleType | undefined) ?? "together",
    startDate: (data.startDate as string | undefined) ?? new Date().toISOString(),
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
  const profile = stripUndefined(input.profile);

  const existing = await getDocs(
    query(collection(db, COLLECTION), where("coupleCode", "==", code), limit(1)),
  );
  if (!existing.empty) {
    throw new Error("Такой код пары уже занят. Попробуй сгенерировать новый.");
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    members: [input.uid],
    creator: input.uid,
    coupleCode: code,
    coupleType: input.coupleType,
    startDate: input.startDate,
    profiles: { [input.uid]: profile },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    members: [input.uid],
    creator: input.uid,
    coupleCode: code,
    coupleType: input.coupleType,
    startDate: input.startDate,
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

  const found = await getDocs(
    query(collection(db, COLLECTION), where("coupleCode", "==", code), limit(1)),
  );
  if (found.empty) {
    throw new Error("Пара с таким кодом не найдена.");
  }

  const docSnap = found.docs[0];
  const ref = doc(db, COLLECTION, docSnap.id);

  await runTransaction(db, async (tx) => {
    const fresh = await tx.get(ref);
    if (!fresh.exists()) throw new Error("Пара не найдена.");
    const data = fresh.data() as DocumentData;
    const members = (data.members as string[] | undefined) ?? [];
    if (members.includes(input.uid)) return;
    if (members.length >= 2) {
      throw new Error("В этой паре уже два участника.");
    }
    tx.update(ref, {
      members: arrayUnion(input.uid),
      [`profiles.${input.uid}`]: profile,
      updatedAt: serverTimestamp(),
    });
  });

  return snapshotToCouple(docSnap);
}

export async function findCoupleByMember(uid: string): Promise<CoupleDoc | null> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("members", "array-contains", uid), limit(1)),
  );
  if (snap.empty) return null;
  return snapshotToCouple(snap.docs[0]);
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
