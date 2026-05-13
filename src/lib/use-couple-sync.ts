import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  subscribeToCoupleByMember,
  syncCoupleInviteFromCoupleDoc,
  type CoupleDoc,
} from "@/lib/couple";
import { bindStateToUser, getState, resetState, setState, type PartnerProfile } from "@/lib/state";

/** Склеивает профиль из Firestore с локальным; `defaultName` — если и там, и там пусто. */
function mergePartnerProfile(
  fromFirestore: PartnerProfile | undefined,
  fallback: PartnerProfile,
  defaultName: string,
  isMe: boolean,
): PartnerProfile {
  const placeholder = isMe ? "Ты" : "Партнёр";
  const defaultEmoji = isMe ? "🍂" : "🦊";
  const fbName = fallback.name?.trim();
  const fbClean = fbName && fbName !== placeholder ? fbName : "";
  const base: PartnerProfile = {
    ...fallback,
    name: fbClean,
    emoji: fallback.emoji?.trim() || defaultEmoji,
  };
  if (!fromFirestore) {
    return {
      ...base,
      name: base.name || defaultName,
      emoji: base.emoji,
    };
  }
  const merged: PartnerProfile = { ...base, ...fromFirestore };
  const n = typeof merged.name === "string" ? merged.name.trim() : "";
  merged.name = n.length > 0 ? n : base.name || defaultName;
  if (!merged.emoji?.trim()) merged.emoji = base.emoji;
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

        const myProfile = mergePartnerProfile(
          couple.profiles[user.uid],
          getState().me,
          "Я",
          true,
        );
        const partnerUid = couple.members.find((m) => m !== user.uid);
        const partnerProfile = partnerUid
          ? mergePartnerProfile(
              couple.profiles[partnerUid],
              getState().partner,
              "Партнёр",
              false,
            )
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
