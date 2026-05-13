import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { subscribeUserQ36Answers } from "@/lib/q36-remote";
import { q36Completion } from "@/lib/q36-progress";
import { getState, setState, useAppState } from "@/lib/state";
import { toast } from "sonner";

const QIDS = Array.from({ length: 36 }, (_, i) => String(i + 1));

function buildQ36Map(
  myUid: string,
  partnerUid: string | undefined,
  myAnswers: Record<string, string>,
  partnerAnswers: Record<string, string>,
): Record<string, { me?: string; partner?: string }> {
  const out: Record<string, { me?: string; partner?: string }> = {};
  for (const id of QIDS) {
    const me = (myAnswers[id] ?? "").trim();
    const partner = partnerUid ? (partnerAnswers[id] ?? "").trim() : "";
    out[id] = { me, partner };
  }
  return out;
}

/**
 * Синхронизирует ответы «36 вопросов» из Firestore (по одному документу на участника).
 */
export function useQ36Sync() {
  const { user } = useAuth();
  const [s] = useAppState();
  const coupleId = s.coupleId;
  const partnerUid = s.partnerUid;
  const lastToastAt = useRef(0);
  const prevReveal = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    prevReveal.current = false;

    let cancelled = false;
    let unsubMy: (() => void) | null = null;
    let unsubPartner: (() => void) | null = null;
    let myMap: Record<string, string> = {};
    let partnerMap: Record<string, string> = {};

    function flush() {
      if (cancelled) return;
      const st = getState();
      const cid = st.coupleId;
      const puid = st.partnerUid;
      if (!cid) {
        setState({ q36: {} });
        return;
      }
      setState({
        q36: buildQ36Map(user.uid, puid, myMap, partnerMap),
      });
    }

    function maybeToast(puid: string) {
      const merged = buildQ36Map(user.uid, puid, myMap, partnerMap);
      const { revealPartnerAnswers } = q36Completion(merged);
      const now = Date.now();
      if (revealPartnerAnswers) {
        if (!prevReveal.current && now - lastToastAt.current > 3_000) {
          lastToastAt.current = now;
          toast.success("Все 36 вопросов закрыты с обеих сторон", {
            description:
              "В «Практика → 36 вопросов» теперь видны ответы партнёра по каждому пункту.",
          });
        }
        prevReveal.current = true;
      } else {
        prevReveal.current = false;
      }
    }

    unsubMy?.();
    unsubPartner?.();
    unsubMy = null;
    unsubPartner = null;
    myMap = {};
    partnerMap = {};

    if (!coupleId) {
      setState({ q36: {} });
      return () => {
        cancelled = true;
      };
    }

    unsubMy = subscribeUserQ36Answers(
      coupleId,
      user.uid,
      (answers) => {
        myMap = answers;
        flush();
        if (partnerUid) maybeToast(partnerUid);
      },
      () => {},
    );

    if (partnerUid) {
      unsubPartner = subscribeUserQ36Answers(
        coupleId,
        partnerUid,
        (answers) => {
          partnerMap = answers;
          flush();
          maybeToast(partnerUid);
        },
        () => {},
      );
    } else {
      flush();
    }

    return () => {
      cancelled = true;
      unsubMy?.();
      unsubPartner?.();
    };
  }, [user?.uid, coupleId, partnerUid]);
}
