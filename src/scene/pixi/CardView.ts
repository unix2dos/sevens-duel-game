import { Container } from "pixi.js";

import { createCardBackSprite } from "./cards/CardBackSprite";
import { createPokerCardSprite } from "./cards/PokerCardSprite";
import type { Card } from "../../game/core/types";

interface CardViewOptions {
  card: Card;
  isFaceUp: boolean;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  width: number;
  height: number;
}

export function createCardView({
  card,
  isFaceUp,
  isInteractive,
  isLegal,
  onPress,
  width,
  height,
}: CardViewOptions) {
  const root = new Container();

  root.addChild(
    isFaceUp
      ? createPokerCardSprite({
          card,
          height,
          isInteractive,
          isLegal,
          onPress,
          width,
        })
      : createCardBackSprite({ height, width }),
  );

  return root;
}
