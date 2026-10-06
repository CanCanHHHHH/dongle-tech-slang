import { useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS } from '../data/levels';
import type { Card, TierStat } from '../types';
import type { DoneMap } from '../lib/storage';
import {
  isLevelDone,
  isUnlocked,
  levelDoneCount,
  TERM2CARD,
  TIER_DEFS,
} from '../lib/progress';

interface HomeProps {
  done: DoneMap;
  wrong: string[];
  streak: number;
  onStartLevel: (idx: number) => void;
  onReview: () => void;
  onOpenShare: () => void;
  onOpenLookup: (card: Card, levelIdx: number) => void;
  showToast: (msg: string) => void;
}

const INDEX = LEVELS.flatMap((lv, li) =>
  lv.cards.map((c) => ({ term: c.term, plain: c.plain, card: c, li, name: lv.name, icon: lv.icon })),
);

export function Home(props: HomeProps) {
  const { done, wrong, streak, onStartLevel, onReview, onOpenShare, onOpenLookup, showToast } = props;
  const [query, setQuery] = useState('');
  const currentRef = useRef<HTMLButtonElement | null>(null);

  const totalWords = useMemo(() => LEVELS.reduce((s, l) => s + l.cards.length, 0), []);
  const learned = LEVELS.reduce((s, l) => s + levelDoneCount(done, l.id), 0);

  const tierStats: TierStat[] = TIER_DEFS.map(([label, key]) => {
    const ls = LEVELS.filter((l) => l.tag.includes(key));
    if (!ls.length) return null;
    return {
      label,
      d: ls.reduce((s, l) => s + levelDoneCount(done, l.id), 0),
      t: ls.reduce((s, l) => s + l.cards.length, 0),
    };
  }).filter(Boolean) as TierStat[];

  const currentIdx = LEVELS.findIndex(
    (l, ix) => isUnlocked(done, ix) && !isLevelDone(done, l.id, l.cards.length),
  );

  const wrongCount = wrong.filter((t) => TERM2CARD[t]).length;

  const hits =
    query.trim() === ''
      ? []
      : INDEX.filter((e) =>
          (e.term + e.plain).toLowerCase().includes(query.trim().toLowerCase()),
        ).slice(0, 8);

  // 关卡多了:返回首页自动把当前关滚进视野
  useEffect(() => {
    if (currentIdx > 2 && currentRef.current) {
      requestAnimationFrame(() =>
        currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      );
    }
  }, [currentIdx]);

  const ringR = 36;
  const ringC = 2 * Math.PI * ringR;
  const ringOff = ringC * (1 - (totalWords ? learned / totalWords : 0));

  return (
    <div>
      <p className="lede">
        开会听不懂技术黑话?这里用生活场景把它们讲成人话,让你跟程序员、产品能对上话。一屏一个词,答错不扣分。
      </p>

      {learned === totalWords && totalWords > 0 && (
        <div className="allclear">🎉 全部通关!{totalWords} 个技术黑话你都拿下了</div>
      )}

      {learned > 0 ? (
        <div className="stats">
          <div className="ring">
            <svg width="84" height="84" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="36" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle
                cx="42"
                cy="42"
                r="36"
                fill="none"
                stroke="var(--ok)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringC.toFixed(1)}
                strokeDashoffset={ringOff.toFixed(1)}
              />
            </svg>
            <div className="num">
              <b>{learned}</b>
              <span>/ {totalWords}</span>
            </div>
          </div>
          <div className="stat-meta">
            <span className="pill">🔥 连续学习 {streak} 天</span>
            <div className="tiers">
              {tierStats.map((s) => (
                <span key={s.label}>
                  {s.label} {s.d}/{s.t}
                </span>
              ))}
            </div>
            <div className="metabtns">
              <button className="share-btn" onClick={onReview}>
                {wrongCount > 0 ? `🔁 复习错词 (${wrongCount})` : '🔁 随机复习'}
              </button>
              <button className="share-btn" onClick={onOpenShare}>
                🏆 成绩卡
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="welcome">
          👋 新手就从下面的 <b>🍜 餐厅关</b> 开始 —— 3 分钟,学会你的头 5 个词。
        </div>
      )}

      <div className="search">
        <span className="mag">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="随手查:输入一个词,如 接口 / Bug / 缓存"
          autoComplete="off"
          aria-label="查词"
        />
      </div>
      <ul className="results">
        {query.trim() !== '' && hits.length === 0 && (
          <li className="empty">没找到「{query.trim()}」,换个词试试</li>
        )}
        {hits.map((e) => (
          <li key={e.term}>
            <button onClick={() => onOpenLookup(e.card, e.li)}>
              <span className="rt">{e.term}</span>
              <span className="rp">
                {e.icon} {e.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ul className="path">
        {LEVELS.map((lv, idx) => {
          const unlocked = isUnlocked(done, idx);
          const doneLv = isLevelDone(done, lv.id, lv.cards.length);
          const dc = levelDoneCount(done, lv.id);
          const isCurrent = idx === currentIdx;
          return (
            <li key={lv.id}>
              <button
                ref={isCurrent ? currentRef : undefined}
                className={(unlocked ? 'lvl' : 'lvl locked') + (isCurrent ? ' current' : '')}
                onClick={() =>
                  unlocked
                    ? onStartLevel(idx)
                    : showToast(`先通关「${LEVELS[idx - 1].name}」就解锁这一关 🔓`)
                }
              >
                <span className="badge">{unlocked ? lv.icon : '🔒'}</span>
                <div className="meta">
                  <div className="tag">
                    {lv.tag}
                    {doneLv ? ' · 已通关' : unlocked ? '' : ' · 先过上一关'}
                  </div>
                  <div className="name">{lv.name}</div>
                  <div className="sub">{lv.sub}</div>
                  <span className="minibar">
                    {lv.cards.map((_, n) => (
                      <i key={n} className={n < dc ? 'on' : ''} />
                    ))}
                  </span>
                  {isCurrent && <span className="startchip">▶ {dc > 0 ? '继续' : '开始'}</span>}
                </div>
                <span className={'state' + (doneLv ? ' done' : unlocked ? ' open' : '')}>
                  {doneLv ? '✓' : unlocked ? '→' : '🔒'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
