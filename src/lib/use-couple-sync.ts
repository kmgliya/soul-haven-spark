import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  subscribeToCoupleByMember,
  syncCoupleInviteFromCoupleDoc,
  type CoupleDoc,
} from "@/lib/couple";
import { bindStateToUser, getState, resetState, setState, type PartnerProfile } from "@/lib/state";

function mergePartnerProfile(
  fromFirestore: PartnerProfile | undefined,
  fallback: PartnerProfile,
): PartnerProfile {
  if (!fromFirestore) return { ...fallback };
  const merged: PartnerProfile = { ...fallback, ...fromFirestore };
  const n = merged.name?.trim();
  merged.name = n && n.length > 0 ? n : fallback.name?.trim() || fallback.name;
  if (!merged.emoji?.trim()) merged.emoji = fallback.emoji;
  return merged;
}

/**
 * Синхронизирует Firestore-документ пары с локальным `AppState`.
 *
 * Должен использоваться внутри `<AuthProvider>`. На каждое изменение пользователя:
 *   - привязываем localStorage к uid (или анониму при logout)
 *   - подписываемся на onSnapshot couples where members contains uid
 *   - применяем минимальные поля (профили, coupleType, startDate, coupleCode, coupleId, onboarded)
 */
export function useCoupleSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      bindStateToUser(null);
      resetState();
      return;
    }

    bindStateToUser(user.uid);

    let cancelled = false;
    const unsub = subscribeToCoupleByMember(
      user.uid,
      (couple: CoupleDoc | null) => {
        if (cancelled) return;
        if (!couple) {
          setState({
            coupleId: undefined,
            onboarded: false,
          });
          return;
        }

        const myProfile = mergePartnerProfile(couple.profiles[user.uid], getState().me);
        const partnerUid = couple.members.find((m) => m !== user.uid);
        const partnerProfile = partnerUid
          ? mergePartnerProfile(couple.profiles[partnerUid], getState().partner)
          : getState().partner;

        setState({
          coupleId: couple.id,
          partnerUid,
          onboarded: true,
          coupleCode: couple.coupleCode,
          coupleType: couple.coupleType,
          startDate: couple.startDate,
          me: myProfile,
          partner: partnerProfile,
        });

        if (couple.members.length === 1 && couple.creator === user.uid && couple.coupleCode) {
          void syncCoupleInviteFromCoupleDoc(couple).catch(() => {
            /* ignore: правила / офлайн */
          });
        }
      },
      (err) => {
        if (import.meta.env.DEV) {
          console.warn("[couple-sync] error", err);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [user]);
}
