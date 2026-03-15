# Suit Center Emblem Design

## Definition Of Done

- 当某个花色的真实 `7` 尚未落桌时，牌桌中心显示一张同尺寸的大花色占位牌。
- 当真实 `7` 落桌后，占位牌消失，中心恢复显示标准 `7` 牌面。
- 普通手牌、普通落桌牌、真实 `7` 牌面保持现状不变。
- 新增回归测试覆盖“占位牌仅在无 `7` 时显示”的切换行为与专用牌面生成。

## Current State

- [SuitBoardLayer.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/SuitBoardLayer.ts) 目前将每个花色列中心牌直接构造成 `rank: 7` 的普通牌。
- [CardView.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/CardView.ts) 只负责在牌背与标准正面牌之间选择。
- [PokerCardSprite.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/PokerCardSprite.ts) 使用 [cardSvg.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/cardSvg.ts) 提供的正面贴图。
- [cardSvg.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/cardSvg.ts) 目前只支持标准扑克牌面，没有中心牌专用样式。

## Design

### Rendering Variant

- 为卡牌正面增加一个可选渲染变体，默认值保持标准牌面。
- 新增 `suit-emblem` 变体，仅用于“真实 `7` 未出现时”的中心占位牌。
- 该变体沿用现有卡牌外框、纸面、阴影、牌背、翻牌和 owner badge 机制，只替换正面内容。

### Center Card Appearance

- `suit-emblem` 牌面不显示点数、角标和 pip 布局。
- 牌中央仅保留一个大号花色字符 `♠ ♥ ♣ ♦`。
- 字体、颜色继续使用现有花色墨色规则，确保黑红花色风格一致。

### Scope Control

- [SuitBoardLayer.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/SuitBoardLayer.ts) 在无真实 `7` 时渲染中心占位牌，并传入 `suit-emblem`。
- 一旦真实 `7` 在 `snapshot.layout` 中存在，中心位直接渲染该真实 `7`，不再使用占位牌。
- 其他所有通过 `createCardView` 创建的牌继续使用默认标准牌面，不做行为改动。

### Testing

- 在 [suitBoardLayer.test.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/__tests__/suitBoardLayer.test.ts) 中断言：
  - 无真实 `7` 时，中心使用 `seed-...` 占位牌并收到 `faceVariant: "suit-emblem"`
  - 真实 `7` 落桌后，占位牌消失，中心改回标准 `7`
- 在 [cardSvg.test.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/__tests__/cardSvg.test.ts) 中断言专用牌面包含大花色符号且不包含 `7` 角标。

## Risks

- 如果直接在 `SuitBoardLayer` 手写另一套假牌组件，会与现有翻牌和阴影逻辑分叉，后续维护成本更高。
- 如果把变体默认值处理错，会影响所有普通牌面，所以需要显式测试默认分支不变。
