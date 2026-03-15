interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RulesDialog({ open, onClose }: RulesDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="overlay" role="dialog">
      <div className="overlay-card overlay-card--rules">
        <p className="eyebrow">HOUSE RULES</p>
        <h2>规则说明</h2>
        <p className="hero-copy">
          这是基于排七母规则改造的双人版本，重点在于围绕 7 接龙，以及“无牌可出时向对手借牌”的节奏变化。
        </p>
        <ul className="rules-list">
          <li>红桃 3 持有者先尝试开局，第一张必须是 7。</li>
          <li>若无合法牌可出，则从对方手中随机借 1 张牌。</li>
          <li>借到后若立刻合法，则必须马上打出。</li>
          <li>谁先让自己的手牌变成 0 张，谁获胜。</li>
        </ul>
        <button className="secondary-action" onClick={onClose} type="button">
          关闭
        </button>
      </div>
    </div>
  );
}
