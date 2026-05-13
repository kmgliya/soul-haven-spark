import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const MAX_ANSWER_LEN = 6000;

export type UserQ36Doc = {
  answers: Record<string, string>;
  updatedAt?: unknown;
};

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Firestore не инициализирован.");
  return db;
}

function userQ36Ref(coupleId: string, uid: string) {
  return doc(requireDb(), "couples", coupleId, "userQ36", uid);
}

/** Сохранить ответ на один вопрос (только свой uid-документ). */
export async function saveQ36Answer(
  coupleId: string,
  uid: string,
  questionId: string,
  text: string,
): Promise<void> {
  const qid = questionId.trim();
  if (!/^(?:[1-9]|[12][0-9]|3[0-6])$/.test(qid)) return;
  const trimmed = text.slice(0, MAX_ANSWER_LEN);
  const ref = userQ36Ref(coupleId, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      [`answers.${qid}`]: trimmed,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, { answers: { [qid]: trimmed }, updatedAt: serverTimestamp() });
  }
}

/** Подписка на все ответы одного участника пары. */
export function subscribeUserQ36Answers(
  coupleId: string,
  uid: string,
  cb: (answers: Record<string, string>) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const db = getDb();
  if (!db) {
    cb({});
    return () => {};
  }
  return onSnapshot(
    doc(db, "couples", coupleId, "userQ36", uid),
    (snap) => {
      const data = snap.data() as UserQ36Doc | undefined;
      cb(data?.answers && typeof data.answers === "object" ? data.answers : {});
    },
    (err) => {
      if (onError) onError(err);
    },
  );
}
