import { Container } from "pixi.js";

import { createCardBackSprite } from "./cards/CardBackSprite";
import type { CardFaceVariant } from "./cards/cardSvg";
import { createPokerCardSprite, playShakeAnimation } from "./cards/PokerCardSprite";
import type { Actor } from "../../game/core/state";
import type { Card } from "../../game/core/types";

interface CardViewOptions {
  card: Card;
  isFaceUp: boolean;
  isInteractive: boolean;
  isSelected?: boolean;
  isLegal: boolean;
  onPress?: (cardId: string) => void;
  animateEntrance?: boolean;
  owner?: Actor;
  replayFlip?: boolean;
  flipDelay?: number;
  flipStartTime?: number;
  faceVariant?: CardFaceVariant;
  width: number;
  height: number;
}

export function createCardView({
  card,
  isFaceUp,
  isInteractive,
  isSelected = false,
  isLegal,
  onPress,
  animateEntrance = true,
  owner,
  replayFlip = false,
  flipDelay = 0,
  flipStartTime = 0,
  faceVariant = "standard",
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
          isSelected,
          isLegal,
          onPress,
          animateEntrance,
          owner,
          replayFlip,
          flipDelay,
          flipStartTime,
          faceVariant,
          width,
        })
      : createCardBackSprite({ height, width }),
  );
  (root as any).playShakeAnimation = () => playShakeAnimation(root);

  return root;
}
