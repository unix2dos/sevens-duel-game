import { Container, Text } from "pixi.js";

import { createCardBackSprite } from "../cards/CardBackSprite";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";

interface OpponentLayerOptions {
  layout: TableLayout;
  snapshot: MatchSnapshot;
}

export function createOpponentLayer({ layout, snapshot }: OpponentLayerOptions) {
  const root = new Container();
  const previewCount = Math.min(snapshot.hands.opponent.length, layout.compact ? 2 : 3);

  for (let index = 0; index < previewCount; index += 1) {
    const back = createCardBackSprite({
      height: layout.compact ? 62 : 74,
      width: layout.compact ? 42 : 50,
    });
    back.position.set(
      layout.opponentAnchor.x + index * (layout.compact ? 10 : 14),
      layout.opponentAnchor.y + index * 2,
    );
    back.alpha = 0.96;
    root.addChild(back);
  }

  if (!layout.compact && previewCount > 0) {
    const label = new Text({
      style: {
        fill: 0x9ea9b7,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 11,
        fontWeight: "600",
      },
      text: "AI 牌堆",
    });
    label.position.set(layout.opponentAnchor.x + 6, layout.opponentAnchor.y + 80);
    root.addChild(label);
  }

  return root;
}
