interface HudProps {
  difficultyLabel: string;
  onBorrow: () => void;
  onRestart: () => void;
  qualityLabel: string;
}

export function Hud({
  difficultyLabel,
  onBorrow,
  onRestart,
  qualityLabel,
}: HudProps) {
  return (
    <header className="hud">
      <div>
        <span className="hud-label">当前难度</span>
        <strong>当前难度：{difficultyLabel}</strong>
      </div>
      <div>
        <span className="hud-label">特效档位</span>
        <strong>特效：{qualityLabel}</strong>
      </div>
      <div className="hud-actions">
        <button className="secondary-action" onClick={onBorrow} type="button">
          随机借牌
        </button>
        <button className="secondary-action" onClick={onRestart} type="button">
          返回首页
        </button>
      </div>
    </header>
  );
}
