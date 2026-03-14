interface GameScreenProps {
  difficultyLabel: string;
  onRestart: () => void;
}

export function GameScreen({ difficultyLabel, onRestart }: GameScreenProps) {
  return (
    <main className="game-layout">
      <header className="hud">
        <div>
          <span className="hud-label">当前难度</span>
          <strong>当前难度：{difficultyLabel}</strong>
        </div>
        <button className="secondary-action" onClick={onRestart} type="button">
          返回首页
        </button>
      </header>

      <section className="table-shell">
        <div className="table-grid">
          <span>黑桃</span>
          <span>红桃</span>
          <span>梅花</span>
          <span>方块</span>
        </div>
        <div className="table-stage" data-testid="table-stage">
          牌桌渲染即将接入
        </div>
      </section>
    </main>
  );
}
