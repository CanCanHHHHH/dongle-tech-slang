// 本地进度存取(每个访客各自的浏览器,零后端)。所有读写都容错,私密窗口/禁用存储也不崩。

export type DoneMap = Record<string, number[]>;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const loadDone = (): DoneMap => readJSON<DoneMap>('dl-done', {});
export const saveDone = (d: DoneMap): void => writeJSON('dl-done', d);
export const loadWrong = (): string[] => readJSON<string[]>('dl-wrong', []);
export const saveWrong = (a: string[]): void => writeJSON('dl-wrong', a);

function ymd(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

interface Streak {
  last?: string;
  streak?: number;
}

/** 只读连续天数(不推进) */
export function readStreak(): number {
  return readJSON<Streak>('dl-streak', {}).streak || 0;
}

/** 当天真正学习(完成 ≥1 张卡)时推进连续天数,用本地日期避免时区偏差 */
export function recordLearningDay(): number {
  const s = readJSON<Streak>('dl-streak', { streak: 0 });
  const today = ymd(new Date());
  const yesterday = ymd(new Date(Date.now() - 86400000));
  if (s.last === today) {
    /* 今天已计 */
  } else if (s.last === yesterday) {
    s.streak = (s.streak || 0) + 1;
    s.last = today;
  } else {
    s.streak = 1;
    s.last = today;
  }
  writeJSON('dl-streak', s);
  return s.streak || 1;
}

export function loadTheme(): string {
  try {
    return localStorage.getItem('dl-theme') || '';
  } catch {
    return '';
  }
}
export function saveTheme(v: string): void {
  try {
    localStorage.setItem('dl-theme', v);
  } catch {
    /* ignore */
  }
}
