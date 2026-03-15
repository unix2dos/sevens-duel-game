# Card Corner Index Enlargement Design

## Definition Of Done

- 标准正面牌的左上角和右下角角标区域明显增大，点数与花色在重叠手牌中更易快速识别。
- 调整仅影响标准牌面角标，不改变牌桌规则、交互逻辑和 `suit-emblem` 专用牌面。
- 牌中央 pip / A / JQK 主视觉继续保持现有风格，不出现明显碰撞或裁切。
- 新增或更新测试，覆盖标准牌面角标的尺寸与位置调整，以及 `suit-emblem` 分支保持不显示角标。

## Current State

- [cardSvg.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/cardSvg.ts) 在 `cornerMarkup` 中使用固定的角标布局：
  - 左上角基准位移为 `translate(28 38)`
  - 点数字号为 `34`
  - 花色字号为 `28`
- [PlayerHandLayer.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/PlayerHandLayer.ts) 会在底部手牌区对多张牌进行横向重叠显示，玩家主要依赖露出的左上角快速扫牌。
- 当前角标风格偏精致，但在重叠场景下信息密度不足，降低找牌速度。

## Design

### Corner Index First

- 保持现有牌张尺寸、手牌布局、中央花色 / pip 结构不变，优先改共享牌面 SVG 的角标设计。
- 将角标视为“快速识别层”，目标是提升读牌速度，而不是改变整张牌的美术风格。

### Size And Footprint

- 提高角标点数字号与花色字号，让 `2 / 10 / J / Q / K / A` 在重叠手牌中更容易区分。
- 同时增大角标组的占位区域，略微调整内边距与上下间距，让角标从牌角中“站出来”，但不贴边。
- 保持右下角沿用镜像方案，确保双角一致。

### Small Amount Of Option B

- 不引入明显的新装饰面板或标签底框，避免破坏当前真实扑克牌观感。
- 仅通过更明确的层级来吸收少量 B 方案：
  - 角标整体稍向内收，形成更清晰的角落识别窗口
  - 点数与花色间距略拉开，减轻拥挤感

### Scope Control

- 只修改 [cardSvg.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/cardSvg.ts) 中标准牌面的角标生成参数。
- 不改 [PlayerHandLayer.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/layers/PlayerHandLayer.ts) 的叠牌步长、缩放策略或交互区域，先验证“只放大角标”是否足够解决问题。
- 若后续仍觉得扫牌速度不够，再单独评估手牌步长或局部 hover 放大。

## Testing

- 在 [cardSvg.test.ts](/Users/liuwei/workspace/sevens-duel-game/src/scene/pixi/cards/__tests__/cardSvg.test.ts) 中新增标准牌面断言：
  - 角标使用新的更大字号
  - 角标使用新的偏移位置
- 保留并复用现有 `suit-emblem` 测试，确保该分支依然不渲染角标。

## Risks

- 如果字号放大过猛，可能与数字牌顶部 pip 的视觉留白互相挤压，尤其是 `8/9/10`。
- 如果角标过于靠边，会出现视觉拥挤；过于向内，则会侵占中央牌面呼吸感。
- 由于所有标准正面牌共享同一套 SVG，任何调整都会同时影响手牌区和牌桌区，因此测试必须锁住非目标分支不变。
