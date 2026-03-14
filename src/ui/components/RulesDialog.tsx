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
      <div className="overlay-card">
        <h2>规则说明</h2>
        <ul className="rules-list">
          <li>红桃 3 持有者先尝试开局，第一张必须是 7。</li>
          <li>若无合法牌可出，则从对方手中随机借 1 张牌。</li>
          <li>借到后若立刻合法，则必须马上打出。</li>
          <li>谁先打光手牌，或把对方借到归零，谁获胜。</li>
        </ul>
        <button className="secondary-action" onClick={onClose} type="button">
          关闭
        </button>
      </div>
    </div>
  );
}
