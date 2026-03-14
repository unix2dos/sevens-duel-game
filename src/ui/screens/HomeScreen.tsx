import type { DifficultyId } from "../../app/model";
import { DifficultyPicker } from "../components/DifficultyPicker";

interface HomeScreenProps {
  selectedDifficulty: DifficultyId;
  soundEnabled: boolean;
  onSelectDifficulty: (difficulty: DifficultyId) => void;
  onStart: () => void;
  onOpenRules: () => void;
  onToggleSound: () => void;
}

export function HomeScreen({
  selectedDifficulty,
  soundEnabled,
  onSelectDifficulty,
  onStart,
  onOpenRules,
  onToggleSound,
}: HomeScreenProps) {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">CYBER SEVENS DUEL</p>
        <h1>双人改良版排七</h1>
        <p className="hero-copy">
          免登录即玩，单人挑战 AI。围绕四个 7 展开接龙，在借牌与卡位之间抢先清空手牌。
        </p>

        <DifficultyPicker
          onSelectDifficulty={onSelectDifficulty}
          selectedDifficulty={selectedDifficulty}
        />

        <div className="hero-actions">
          <button className="primary-action" onClick={onStart} type="button">
            开始游戏
          </button>
          <button className="secondary-action" onClick={onOpenRules} type="button">
            规则说明
          </button>
          <button className="secondary-action" onClick={onToggleSound} type="button">
            音效：{soundEnabled ? "开" : "关"}
          </button>
        </div>
      </section>

      <section aria-label="核心特性" className="status-grid">
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
