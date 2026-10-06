import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '../types';
import { LEVELS } from '../data/levels';
import { Icon } from './Icon';
import { feedbackURL } from '../lib/feedback';

interface DeckProps {
  session: Session;
  /** 闯关模式下该关已学会的卡片下标 */
  initialSolved: number[];
  onExit: () => void;
  /** 记一次学习(闯关传 levelId,复习传 undefined);始终推进连续天数 */
  onLearned: (levelId: string | undefined, cardIndex: number) => void;
  onFlagWrong: (term: string) => void;
  onClearWrong: (term: string) => void;
  onStartLevel: (lvlIdx: number) => void;
  onReviewAgain: () => void;
}

export function Deck(props: DeckProps) {
  const { session, initialSolved, onExit, onLearned, onFlagWrong, onClearWrong } = props;
  const cards = session.cards;

  const buildSolved = () =>
    cards.map((_, n) => (session.review ? false : initialSolved.includes(n)));

  const [solved, setSolved] = useState<boolean[]>(buildSolved);
  const firstUnsolved = solved.findIndex((s) => !s);
  const [i, setI] = useState<number>(firstUnsolved < 0 ? 0 : firstUnsolved);
  const [answered, setAnswered] = useState<boolean>(!session.review && solved[i]);
  const [wrongSet, setWrongSet] = useState<Set<number>>(new Set());
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const perfect = useRef(0);

  // 切卡时重置作答状态(已学过的关卡卡片直接揭示答案)
  useEffect(() => {
    setAnswered(!session.review && solved[i]);
    setWrongSet(new Set());
    setLastWrong(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const card = cards[i];
  const isLast = i === cards.length - 1;

  const goNext = useCallback(() => {
    if (i < cards.length - 1) setI(i + 1);
    else setFinished(true);
  }, [i, cards.length]);

  const pick = useCallback(
    (idx: number) => {
      if (answered || wrongSet.has(idx)) return;
      const opt = card.opts[idx];
      if (opt.ok) {
        const firstTry = wrongSet.size === 0;
        setAnswered(true);
        setSolved((prev) => {
          const next = prev.slice();
          next[i] = true;
          return next;
        });
        if (session.review && firstTry) perfect.current++;
        if (firstTry) onClearWrong(card.term);
        onLearned(session.review ? undefined : session.levelId, i);
      } else {
        setWrongSet((prev) => new Set(prev).add(idx));
        setLastWrong(idx);
        onFlagWrong(card.term);
      }
    },
    [answered, wrongSet, card, i, session, onClearWrong, onLearned, onFlagWrong],
  );

  // 键盘:数字键选答案,回车进入下一张 / 完成页主按钮
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextLv = session.lvlIdx != null ? LEVELS[session.lvlIdx + 1] : undefined;
          if (session.review) props.onReviewAgain();
          else if (nextLv) props.onStartLevel(session.lvlIdx! + 1);
          else onExit();
        }
        return;
      }
      if (e.key >= '1' && e.key <= '9') {
        const idx = +e.key - 1;
        if (idx < card.opts.length && !answered && !wrongSet.has(idx)) {
          e.preventDefault();
          pick(idx);
        }
      } else if (e.key === 'Enter' && answered) {
        e.preventDefault();
        goNext();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finished, answered, wrongSet, card, pick, goNext, session, props, onExit]);

  // ---------- 完成页 ----------
  if (finished) {
    const recap = (
      <ul className="recap">
        {cards.map((c) => (
          <li key={c.term}>
            <span className="tick">✓</span>
            <span>
              <b>{c.term}</b> · {c.plain}
            </span>
          </li>
        ))}
      </ul>
    );
    if (session.review) {
      return (
        <div className="card done-card">
          <p className="big">💪</p>
          <h2>复习完成!又巩固了 {cards.length} 个词</h2>
          <p>
            一次答对 {perfect.current}/{cards.length} —— 记得越来越牢了。
          </p>
          {recap}
          <button className="next" onClick={props.onReviewAgain}>
            再来一组 🔁
          </button>
          <button className="ghost" onClick={onExit}>
            回到关卡地图
          </button>
        </div>
      );
    }
    const nextLv = session.lvlIdx != null ? LEVELS[session.lvlIdx + 1] : undefined;
    return (
      <div className="card done-card">
        <p className="big">🎉</p>
        <h2>
          {session.name}通关!你学会了 {cards.length} 个词
        </h2>
        <p>下次听到它们,不慌。</p>
        {recap}
        <button
          className="next"
          onClick={() => (nextLv ? props.onStartLevel(session.lvlIdx! + 1) : onExit())}
        >
          {nextLv ? `解锁下一关:${nextLv.icon} ${nextLv.name} →` : '回到关卡地图'}
        </button>
        <button className="ghost" onClick={onExit}>
          回到关卡地图
        </button>
      </div>
    );
  }

  // ---------- 答题卡 ----------
  return (
    <>
      <button className="back" onClick={onExit}>
        ← 关卡地图
      </button>
      <div className="dots">
        {cards.map((_, n) => (
          <i key={n} className={solved[n] ? 'done' : n === i ? 'here' : ''} />
        ))}
      </div>
      <div className="card">
        <p className="eyebrow">
          {session.icon} {session.name} · 第 {i + 1}/{cards.length} 词
        </p>
        <h1 className="term">{card.term}</h1>
        <p className="plain">{card.plain}</p>
        <div className="analogy">
          <Icon name={card.art} />
          <p dangerouslySetInnerHTML={{ __html: card.analogy }} />
        </div>
        <p className="q">{card.q}</p>
        <div className="opts">
          {card.opts.map((o, n) => {
            const cls =
              answered && o.ok ? 'opt correct' : wrongSet.has(n) ? 'opt wrong' : 'opt';
            return (
              <button
                key={n}
                className={cls}
                disabled={answered || wrongSet.has(n)}
                onClick={() => pick(n)}
              >
                {o.t}
              </button>
            );
          })}
        </div>
        {answered ? (
          <div className="feedback">
            <b>懂了 ✓</b> {card.praise}
          </div>
        ) : lastWrong != null ? (
          <div className="feedback hint">
            <b>再想想</b> {card.opts[lastWrong]?.why}
          </div>
        ) : null}
        {!answered && <p className="helper">👆 选一个答案,答对就能继续</p>}
        <div className="spacer" />
        {answered && (
          <button className="next" onClick={goNext}>
            {isLast ? '完成 🎉' : '下一个 →'}
          </button>
        )}
        <a className="report" href={feedbackURL(card.term)} target="_blank" rel="noopener">
          🚩 这条讲错了?告诉作者
        </a>
      </div>
    </>
  );
}
