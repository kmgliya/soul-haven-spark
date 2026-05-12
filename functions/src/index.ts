import * as admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

function timestampMs(value: unknown): number {
  if (value && typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

/**
 * Когда партнёр обновляет `nudges.requestedAt.{toUid}`, шлём push всем FCM-токенам пользователя `toUid`
 * (токены лежат в `users/{uid}.fcmTokens`, клиент их сохраняет после разрешения уведомлений).
 */
export const notifyPartnerOnDayNudge = onDocumentWritten(
  "couples/{coupleId}/days/{dayId}",
  async (event) => {
    const beforeMap = (event.data?.before?.data()?.nudges?.requestedAt ?? {}) as Record<
      string,
      unknown
    >;
    const afterMap = (event.data?.after?.data()?.nudges?.requestedAt ?? {}) as Record<
      string,
      unknown
    >;
    const coupleId = event.params.coupleId as string;
    const dayId = event.params.dayId as string;

    for (const [toUid, afterVal] of Object.entries(afterMap)) {
      if (timestampMs(afterVal) <= timestampMs(beforeMap[toUid])) continue;

      const userSnap = await admin.firestore().doc(`users/${toUid}`).get();
      const tokens = ((userSnap.data()?.fcmTokens as string[] | undefined) ?? []).filter(Boolean);
      if (!tokens.length) continue;

      const messages: admin.messaging.Message[] = tokens.map((token) => ({
        token,
        notification: {
          title: "LoveSpace",
          body: "Партнёр ждёт — загляни в «Сегодня».",
        },
        data: {
          type: "nudge",
          coupleId,
          dayId,
        },
      }));

      try {
        const result = await admin.messaging().sendEach(messages);
        if (result.failureCount > 0) {
          logger.warn("FCM partial failure", { failureCount: result.failureCount, toUid });
        }
      } catch (e) {
        logger.error("FCM sendEach failed", e);
      }
    }
  },
);
