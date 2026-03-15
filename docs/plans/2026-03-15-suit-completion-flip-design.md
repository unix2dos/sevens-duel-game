# Suit Completion Flip Design

## Definition Of Done

- 当某个花色从“未集齐”变为“13 张全部落桌”时，该花色整列牌统一播放一次翻牌动画。
- 该动画只在凑齐当下触发一次，后续普通重绘、重新进入页面或其他状态更新不重复播放。
- 不修改游戏规则、胜负判定和事件模型。
- 新增回归测试覆盖“刚集齐”的识别、整列牌的翻牌标记和翻牌动画通道。

## Current State

- 牌桌每次由 `GameScene` 根据当前 `snapshot` 重建。
- `SuitBoardLayer` 负责渲染四个花色列。
- `PokerCardSprite` 目前只有入场滑入动画，没有整列翻牌能力。

## Design

### Trigger Logic

- 在视图层比较上一帧 `layout` 和当前 `layout`。
- 仅当某花色满足 `previous < 13` 且 `next === 13` 时，视为“刚集齐”。
- 首次进入对局不触发，避免对已存在的完整布局误播。

### Propagation

- `GameScene` 计算本次需要庆祝的花色集合。
- 该集合透传到 `TableView` 和 `SuitBoardLayer`。
- `SuitBoardLayer` 对命中的花色，把中心 `7` 与该列全部牌都标记为 `replayFlip`。

### Animation

- `PokerCardSprite` 增加一次性翻牌动画通道。
- 动画形态：正面缩至窄边 -> 切到牌背 -> 展开 -> 再缩 -> 切回正面 -> 展开。
- 该动画与现有 hover/入场动画并存，但对庆祝花色应关闭普通入场动画，避免双重效果冲突。

## Risks

- 若只根据当前 `layout` 是否完整判断，会在每次重绘时重复播放。
- 若不关闭入场动画，最后一张补齐牌可能与整列翻牌叠加，观感会脏。
