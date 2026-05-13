import { dailyQuestions36 } from "@/lib/mock-data";

export const Q36_TOTAL = dailyQuestions36.length;

export type Q36Entry = { me?: string; partner?: string };

/** Сколько непустых ответов и закрыли ли оба все 36 (нужно, чтобы показать ответы партнёра). */
export function q36Completion(q36: Record<string, Q36Entry | undefined>) {
  let my = 0;
  let partner = 0;
  for (const q of dailyQuestions36) {
    const id = String(q.id);
    const e = q36[id];
    if (e?.me?.trim()) my += 1;
    if (e?.partner?.trim()) partner += 1;
  }
  const meAll = my === Q36_TOTAL;
  const partnerAll = partner === Q36_TOTAL;
  return {
    my,
    partner,
    meAll,
    partnerAll,
    /** Тексты партнёра можно показывать только когда оба ответили на все вопросы. */
    revealPartnerAnswers: meAll && partnerAll,
  };
}
