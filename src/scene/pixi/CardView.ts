import { Container } from "pixi.js";

import { createCardBackSprite } from "./cards/CardBackSprite";
import { createPokerCardSprite } from "./cards/PokerCardSprite";
import type { Actor } from "../../game/core/state";
import type { Card } from "../../game/core/types";

interface CardViewOptions {
  card: Card;
  isFaceUp: boolean;
  isInteractive: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  animateEntrance?: boolean;
  owner?: Actor;
  width: number;
  height: number;
}

export function createCardView({
  card,
  isFaceUp,
  isInteractive,
  isLegal,
  onPress,
  animateEntrance = true,
  owner,
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
          animateEntrance,
          owner,
          width,
        })
      : createCardBackSprite({ height, width }),
  );

  return root;
}
