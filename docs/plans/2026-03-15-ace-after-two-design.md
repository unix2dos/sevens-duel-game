# Ace After Two Design

## Definition Of Done

- 同花色 `A` 只能在该花色 `2` 已经落桌后打出。
- 同花色 `K` 后不再允许直接打出 `A`。
- 牌桌展示中，`A` 与 `6/5/4/3/2` 同列，显示在 `2` 的外侧。
- 手牌排序与可出牌判定不再把 `A` 当作 `K` 的后继。
- 相关单元测试和现有回归测试通过。

## Current State

- 规则层在 [rules.ts](/Users/liuwei/workspace/sevens-duel-game/src/game/core/rules.ts) 中把 `A` 放在 `K` 后面。
- 牌桌层在 [SuitBoardLayer.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/SuitBoardLayer.ts) 中使用数值排序，当前会把 `A` 视为最高牌。
- 手牌展示在 [cardPresentation.ts](/Users/liuwei/workspace/sevens-duel-game/src/ui/cardPresentation.ts) 中同样将 `A` 排在末尾。

## Design

### Rule Model

- 将规则顺序改为两条链：
  - 上行链：`7 -> 8 -> 9 -> 10 -> J -> Q -> K`
  - 下行链：`7 -> 6 -> 5 -> 4 -> 3 -> 2 -> A`
- `canPlayCard` 继续沿用“相邻牌已存在即可出牌”的模式，只调整顺序数组即可完成规则迁移。

### Visual Ordering

- 牌桌按“视觉顺序”排序，而不是按传统扑克点数排序。
- 为避免 `A` 仍被放到 `K` 一侧，需要单独定义一个牌桌顺序值，让 `A` 小于 `2`。
- 手牌排序也改用同一套视觉顺序，保证玩家认知一致。

### Testing

- 规则测试新增：
  - `K` 后不能接 `A`
  - `2` 后可以接 `A`
  - `A` 不会在只有 `K` 时被列为合法牌
- 展示测试新增：
  - 牌桌同花色展示时 `A` 位于 `2` 的外侧

## Risks

- 若只改规则不改展示，玩家会看到 `A` 还在底部，产生规则与视觉不一致。
- 若只改牌桌不改手里排序，玩家仍会把 `A` 当高牌理解，降低可读性。
