import { LEVELS } from '../data/levels';
import type { Card } from '../types';
import type { DoneMap } from './storage';

export const levelDoneCount = (done: DoneMap, id: string): number => (done[id] || []).length;

export const isLevelDone = (done: DoneMap, id: string, total: number): boolean =>
  levelDoneCount(done, id) >= total;

export const isUnlocked = (done: DoneMap, idx: number): boolean =>
  idx === 0 || isLevelDone(done, LEVELS[idx - 1].id, LEVELS[idx - 1].cards.length);

export const collectLearned = (done: DoneMap): Card[] => {
  const arr: Card[] = [];
  LEVELS.forEach((l) =>
    (done[l.id] || []).forEach((n) => {
      if (l.cards[n]) arr.push(l.cards[n]);
    }),
  );
  return arr;
};

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let k = b.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [b[k], b[j]] = [b[j], b[k]];
  }
  return b;
}

/** term -> card 快速查找(用于错词本、随手查) */
export const TERM2CARD: Record<string, Card> = {};
LEVELS.forEach((l) => l.cards.forEach((c) => (TERM2CARD[c.term] = c)));

export const TIER_DEFS: [string, string][] = [
  ['🟢 Lv.1 认字', 'Lv.1'],
  ['🟡 Lv.2 听得懂', 'Lv.2'],
  ['🟠 Lv.3 说得清', 'Lv.3'],
  ['🔴 Lv.4 聊得来', 'Lv.4'],
];
