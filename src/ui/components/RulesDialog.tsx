import { useEffect, useRef } from "react";

interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RulesDialog({ open, onClose }: RulesDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    cardRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="overlay" onClick={onClose} role="dialog">
      <div
        className="overlay-card overlay-card--rules"
        onClick={(e) => e.stopPropagation()}
        ref={cardRef}
        tabIndex={-1}
      >
        <p className="eyebrow">HOUSE RULES</p>
        <h2>规则说明</h2>
        <p className="hero-copy">
          这是基于传统接7玩法改造的双人版本，重点在于围绕 7 接龙，以及"无牌可出时向对手借牌"的节奏变化。
        </p>
        <ul className="rules-list">
          <li>红桃 3 持有者先尝试开局，第一张必须是 7。</li>
          <li>同花色的 A 不接在 K 后面，只有该花色已经出到 2 时才能再出 A。</li>
          <li>若无合法牌可出，则从对方手中随机借 1 张牌。</li>
          <li>借到的牌先加入手牌；若此时已有合法牌，可自行决定是否立刻打出。</li>
          <li>谁先让自己的手牌变成 0 张，谁获胜。</li>
        </ul>
        <button className="secondary-action" onClick={onClose} type="button">
          关闭
        </button>
      </div>
    </div>
  );
}
