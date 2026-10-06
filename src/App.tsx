import { useEffect, useRef, useState } from 'react';
import { LEVELS } from './data/levels';
import type { Card, Session } from './types';
import {
  loadDone,
  loadWrong,
  loadTheme,
  saveDone,
  saveWrong,
  saveTheme,
  readStreak,
  recordLearningDay,
  type DoneMap,
} from './lib/storage';
import { collectLearned, isUnlocked, shuffle, TERM2CARD } from './lib/progress';
import { feedbackURL } from './lib/feedback';
import { Home } from './components/Home';
import { Deck } from './components/Deck';
import { LookupSheet, ShareSheet } from './components/Sheets';

type Screen = { t: 'home' } | { t: 'deck'; session: Session; key: number };
type Sheet = null | { t: 'lookup'; card: Card; levelIdx: number } | { t: 'share' };

export default function App() {
  const [done, setDone] = useState<DoneMap>(loadDone);
  const [wrong, setWrong] = useState<string[]>(loadWrong);
  const [streak, setStreak] = useState<number>(readStreak);
  const [theme, setTheme] = useState<string>(loadTheme);
  const [screen, setScreen] = useState<Screen>({ t: 'home' });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const sessionKey = useRef(0);

  // 主题:显式选择写到 data-theme,空表示跟随系统
  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute('data-theme', theme);
    else root.removeAttribute('data-theme');
  }, [theme]);

  function toggleTheme() {
    const isDark =
      theme === 'dark' ||
      (!theme && window.matchMedia('(prefers-color-scheme:dark)').matches);
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  }

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1900);
  }

  function markLearned(levelId: string | undefined, idx: number) {
    if (levelId) {
      setDone((prev) => {
        const arr = new Set(prev[levelId] || []);
        arr.add(idx);
        const next = { ...prev, [levelId]: [...arr] };
        saveDone(next);
        return next;
      });
    }
    setStreak(recordLearningDay());
  }

  function flagWrong(term: string) {
    setWrong((prev) => {
      if (prev.includes(term)) return prev;
      const next = [...prev, term];
      saveWrong(next);
      return next;
    });
  }
  function clearWrong(term: string) {
    setWrong((prev) => {
      if (!prev.includes(term)) return prev;
      const next = prev.filter((t) => t !== term);
      saveWrong(next);
      return next;
    });
  }

  function startLevel(idx: number) {
    const lv = LEVELS[idx];
    sessionKey.current++;
    setScreen({
      t: 'deck',
      key: sessionKey.current,
      session: {
        cards: lv.cards,
        icon: lv.icon,
        name: lv.name,
        review: false,
        lvlIdx: idx,
        levelId: lv.id,
      },
    });
  }

  function startReview() {
    const wrongCards = shuffle(
      wrong.map((t) => TERM2CARD[t]).filter(Boolean) as Card[],
    );
    const learnedPool = shuffle(collectLearned(done));
    const pool: Card[] = [];
    const seen = new Set<string>();
    for (const c of wrongCards) if (!seen.has(c.term)) (pool.push(c), seen.add(c.term));
    for (const c of learnedPool) {
      if (pool.length >= 10) break;
      if (!seen.has(c.term)) (pool.push(c), seen.add(c.term));
    }
    if (pool.length === 0) {
      showToast('先学几个词,再来复习吧 🙂');
      return;
    }
    sessionKey.current++;
    setScreen({
      t: 'deck',
      key: sessionKey.current,
      session: {
        cards: pool.slice(0, 10),
        icon: '🔁',
        name: wrongCards.length ? '复习错词' : '随机复习',
        review: true,
      },
    });
  }

  function resetProgress() {
    setDone({});
    saveDone({});
    setSheet(null);
  }

  const goHome = () => setScreen({ t: 'home' });

  return (
    <div className="wrap">
      <div className="top">
        <span className="brand">
          <span className="logo">懂</span>懂了
        </span>
        <button className="icon-btn theme-btn" aria-label="切换深浅色" onClick={toggleTheme}>
          ◐
        </button>
      </div>

      {screen.t === 'home' ? (
        <Home
          done={done}
          wrong={wrong}
          streak={streak}
          onStartLevel={startLevel}
          onReview={startReview}
          onOpenShare={() => setSheet({ t: 'share' })}
          onOpenLookup={(card, levelIdx) => setSheet({ t: 'lookup', card, levelIdx })}
          showToast={showToast}
        />
      ) : (
        <Deck
          key={screen.key}
          session={screen.session}
          initialSolved={
            screen.session.levelId ? done[screen.session.levelId] || [] : []
          }
          onExit={goHome}
          onLearned={markLearned}
          onFlagWrong={flagWrong}
          onClearWrong={clearWrong}
          onStartLevel={startLevel}
          onReviewAgain={startReview}
        />
      )}

      <p className="foot">
        技术黑话翻译器 · 样片 · 答错不扣分,想学就学 ·{' '}
        <a href={feedbackURL()} target="_blank" rel="noopener">
          💬 反馈
        </a>
      </p>

      {toast && <div className="toast">{toast}</div>}

      {sheet?.t === 'lookup' &&
        (() => {
          const lv = LEVELS[sheet.levelIdx];
          return (
            <LookupSheet
              card={sheet.card}
              levelIcon={lv.icon}
              levelName={lv.name}
              levelTag={lv.tag}
              unlocked={isUnlocked(done, sheet.levelIdx)}
              onGoto={() => {
                setSheet(null);
                startLevel(sheet.levelIdx);
              }}
              onClose={() => setSheet(null)}
            />
          );
        })()}

      {sheet?.t === 'share' && (
        <ShareSheet
          learned={LEVELS.reduce((s, l) => s + (done[l.id] || []).length, 0)}
          total={LEVELS.reduce((s, l) => s + l.cards.length, 0)}
          streak={streak}
          tiers={(
            [
              ['🟢 Lv.1 认字', 'Lv.1'],
              ['🟡 Lv.2 听得懂', 'Lv.2'],
              ['🟠 Lv.3 说得清', 'Lv.3'],
              ['🔴 Lv.4 聊得来', 'Lv.4'],
            ] as [string, string][]
          )
            .map(([label, key]) => {
              const ls = LEVELS.filter((l) => l.tag.includes(key));
              if (!ls.length) return null;
              return {
                label,
                d: ls.reduce((s, l) => s + (done[l.id] || []).length, 0),
                t: ls.reduce((s, l) => s + l.cards.length, 0),
              };
            })
            .filter(Boolean) as { label: string; d: number; t: number }[]}
          onReset={resetProgress}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
