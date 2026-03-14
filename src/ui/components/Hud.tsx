interface HudProps {
  difficultyLabel: string;
  onRestart: () => void;
  opponentCards: number;
  phaseLabel: string;
  playerCards: number;
  qualityLabel: string;
  turnLabel: string;
}

export function Hud({
  difficultyLabel,
  onRestart,
  opponentCards,
  phaseLabel,
  playerCards,
  qualityLabel,
  turnLabel,
}: HudProps) {
  return (
    <header className="hud">
      <div className="hud-cluster">
        <div>
          <span className="hud-label">当前难度</span>
          <strong>当前难度：{difficultyLabel}</strong>
        </div>
        <div>
          <span className="hud-label">局势</span>
          <strong>{turnLabel}</strong>
        </div>
        <div>
          <span className="hud-label">阶段 / 特效</span>
          <strong>
            {phaseLabel} / {qualityLabel}
          </strong>
        </div>
      </div>
      <div className="hud-cluster hud-metrics">
        <div className="hud-metric">
          <span className="hud-label">你的手牌</span>
          <strong>{playerCards}</strong>
        </div>
        <div className="hud-metric">
          <span className="hud-label">AI 手牌</span>
          <strong>{opponentCards}</strong>
        </div>
      </div>
      <div className="hud-actions">
        <button className="secondary-action" onClick={onRestart} type="button">
          返回首页
        </button>
      </div>
    </header>
  );
}
