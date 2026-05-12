import {
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

export function normalizeCoupleCode(code: string): string {
  return code.trim().toUpperCase();
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
      startDate: new Date().toISOString(),
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

  const inviteRef = doc(db, INVITES, code);
  const existingInvite = await getDoc(inviteRef);
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
    startDate: input.startDate,
    profiles: { [input.uid]: profile },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(inviteRef, {
    coupleId: coupleRef.id,
    createdBy: input.uid,
    code,
  });
  await batch.commit();

  return {
    id: coupleRef.id,
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

  const inviteRef = doc(db, INVITES, code);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error(
      "Пара с таким кодом не найдена. Попроси партнёра открыть экран с кодом ещё раз (или обновить код).",
    );
  }
  const coupleId = inviteSnap.data().coupleId as string;
  const coupleRef = doc(db, COLLECTION, coupleId);

  const prelude = await getDoc(coupleRef);
  if (!prelude.exists()) throw new Error("Пара не найдена.");
  const preludeMembers = (prelude.data().members as string[] | undefined) ?? [];
  if (preludeMembers.includes(input.uid)) {
    return snapshotToCouple(prelude);
  }

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
