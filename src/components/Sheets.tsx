import { useState } from 'react';
import type { Card, TierStat } from '../types';
import { Icon } from './Icon';

/** 查词弹层:随手查任意词时弹出的解释卡 */
export function LookupSheet(props: {
  card: Card;
  levelIcon: string;
  levelName: string;
  levelTag: string;
  unlocked: boolean;
  onGoto: () => void;
  onClose: () => void;
}) {
  const { card, levelIcon, levelName, levelTag, unlocked, onGoto, onClose } = props;
  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <div className="analogy" style={{ marginTop: 0 }}>
          <Icon name={card.art} />
          <p>
            <b style={{ color: 'var(--ink)', fontSize: 17 }}>{card.term}</b>
            <br />
            {card.plain}
          </p>
        </div>
        <p
          style={{ fontSize: 15, margin: '16px 0 0' }}
          dangerouslySetInnerHTML={{ __html: card.analogy }}
        />
        <p className="who">
          {levelIcon} {levelName} · {levelTag}
        </p>
        <button className="next" disabled={!unlocked} onClick={unlocked ? onGoto : undefined}>
          {unlocked ? '去这一关学 →' : '🔒 先解锁前面的关'}
        </button>
        <button className="ghost" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
}

/** 成绩卡弹层:战绩展示 + 复制 + 重置 */
export function ShareSheet(props: {
  learned: number;
  total: number;
  streak: number;
  tiers: TierStat[];
  onReset: () => void;
  onClose: () => void;
}) {
  const { learned, total, streak, tiers, onReset, onClose } = props;
  const [copyLabel, setCopyLabel] = useState('复制战绩文字');
  const [armed, setArmed] = useState(false);

  function copy() {
    const txt =
      `我在「懂了」学会了 ${learned}/${total} 个技术黑话 🎓\n` +
      `🔥 连续 ${streak} 天 · ${tiers.map((s) => `${s.label} ${s.d}/${s.t}`).join(' · ')}\n` +
      `用生活场景听懂技术,答错不扣分~`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => setCopyLabel('已复制 ✓'),
        () => setCopyLabel('复制没成功,长按卡片截图吧'),
      );
    } else {
      setCopyLabel('长按上方卡片截图分享吧');
    }
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <div className="sharecard">
          <span className="logo">懂</span>
          <h3>我的技术黑话进度</h3>
          <div className="score">
            {learned}
            <span style={{ fontSize: 20, color: 'var(--muted)' }}> / {total}</span>
          </div>
          <div className="row">
            <span>🔥 连续 {streak} 天</span>
            {tiers.map((s) => (
              <span key={s.label}>
                {s.label} {s.d}/{s.t}
              </span>
            ))}
          </div>
        </div>
        <button className="next" onClick={copy}>
          {copyLabel}
        </button>
        <button className="ghost" onClick={onClose}>
          截图上方卡片分享给朋友 · 关闭
        </button>
        <button
          className="reset-link"
          onClick={() => {
            if (!armed) {
              setArmed(true);
              return;
            }
            onReset();
          }}
        >
          {armed ? '确定清空全部进度?再点一次' : '重置我的进度'}
        </button>
      </div>
    </div>
  );
}
