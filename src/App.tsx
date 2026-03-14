import "./App.css";

const difficulties = ["儿童", "标准", "挑战"] as const;

function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">CYBER SEVENS DUEL</p>
        <h1>双人改良版排七</h1>
        <p className="hero-copy">
          免登录即玩，单人挑战 AI。围绕四个 7 展开接龙，在借牌与卡位之间抢先清空手牌。
        </p>

        <div className="difficulty-preview" aria-label="难度选择">
          {difficulties.map((difficulty) => (
            <button key={difficulty} className="difficulty-chip" type="button">
              {difficulty}
            </button>
          ))}
        </div>

        <div className="hero-actions">
          <button className="primary-action" type="button">
            开始游戏
          </button>
          <button className="secondary-action" type="button">
            规则说明
          </button>
        </div>
      </section>

      <section className="status-grid" aria-label="核心特性">
        <article>
          <span>模式</span>
          <strong>单机 AI</strong>
        </article>
        <article>
          <span>难度</span>
          <strong>儿童 / 标准 / 挑战</strong>
        </article>
        <article>
          <span>平台</span>
          <strong>手机 + 桌面</strong>
        </article>
      </section>
    </main>
  );
}

export default App;
