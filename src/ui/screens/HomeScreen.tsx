import type { DifficultyId } from "../../app/model";
import { DifficultyPicker } from "../components/DifficultyPicker";

interface HomeScreenProps {
  playerName: string;
  selectedDifficulty: DifficultyId;
  soundEnabled: boolean;
  onPlayerNameChange: (playerName: string) => void;
  onSelectDifficulty: (difficulty: DifficultyId) => void;
  onStart: (playerName: string) => void;
  onOpenRules: () => void;
  onToggleSound: () => void;
}

export function HomeScreen({
  playerName,
  selectedDifficulty,
  soundEnabled,
  onPlayerNameChange,
  onSelectDifficulty,
  onStart,
  onOpenRules,
  onToggleSound,
}: HomeScreenProps) {
  return (
    <main className="app-shell app-shell--home">
      <section className="hero-panel">
        <p className="eyebrow">SEVENS SALON</p>
        <h1>双人改良版接7</h1>
        <p className="hero-copy">
          单机 机器人 对战的改良版接7牌桌，在手机和桌面上都能快速开局。围绕四个 7 接龙，在借牌与卡位之间，先把自己的手牌清空。
        </p>

        <div className="player-name-field">
          <label className="player-name-label" htmlFor="player-name">
            玩家姓名
          </label>
          <input
            className="player-name-input"
            id="player-name"
            maxLength={100}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="请输入玩家姓名"
            required
            type="text"
            value={playerName}
          />
        </div>

        <DifficultyPicker
          onSelectDifficulty={onSelectDifficulty}
          selectedDifficulty={selectedDifficulty}
        />

        <div className="hero-actions">
          <button
            className="primary-action"
            disabled={playerName.trim().length === 0}
            onClick={() => onStart(playerName)}
            type="button"
          >
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

      <section aria-hidden="true" className="home-tableau">
        <div className="home-tableau-board" />
        <article className="home-card home-card--dark">
          <span>7♠</span>
          <small>黑桃 7</small>
        </article>
        <article className="home-card home-card--warm">
          <span>7♥</span>
          <small>红桃 7</small>
        </article>
        <article className="home-card home-card--warm home-card--rear">
          <span>8♦</span>
          <small>方块 8</small>
        </article>
        <div className="home-notes">
          <p>单机 机器人</p>
          <p>手机 + 桌面</p>
          <p>电影感牌桌反馈</p>
        </div>
      </section>

      <footer className="home-footer">
        <span>Sevens Duel v0.1</span>
      </footer>
    </main>
  );
}
