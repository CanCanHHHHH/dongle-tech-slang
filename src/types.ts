export interface Opt {
  t: string;
  ok?: boolean;
  why?: string;
}

export interface Card {
  term: string;
  plain: string;
  art: string;
  analogy: string;
  q: string;
  praise: string;
  opts: Opt[];
}

export interface Level {
  id: string;
  icon: string;
  name: string;
  tag: string;
  sub: string;
  cards: Card[];
}

/** 一次答题会话:闯关(learn)或复习(review) */
export interface Session {
  cards: Card[];
  icon: string;
  name: string;
  review: boolean;
  /** 闯关模式:对应 LEVELS 下标(用于解锁下一关) */
  lvlIdx?: number;
  /** 闯关模式:关卡 id(用于存进度) */
  levelId?: string;
}

export interface TierStat {
  label: string;
  d: number;
  t: number;
}
