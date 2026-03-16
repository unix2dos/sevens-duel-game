import { Container, Text, Graphics } from "pixi.js";

import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";
import { formatCardId } from "../../../ui/cardPresentation";
import {
  actorName,
  playerBorrowWaitingMessage,
  playerTurnFeed,
  playerWonRound,
} from "../../../ui/playerText";

export type TransientFeedLayerContainer = Container & {
  updateTimerText: (time: number | null) => void;
};

interface TransientFeedLayerOptions {
  layout: TableLayout;
  playerName: string;
  showChildGuidance: boolean;
  snapshot: MatchSnapshot;
}

function latestMessage(snapshot: MatchSnapshot, playerName: string) {
  if (snapshot.phase === "borrowing") {
    return snapshot.turn !== "player" ? "协助出借" : "等待借牌";
  }

  const event = snapshot.eventLog.at(-1);

  if (!event) {
    return "请先出任意花色的 7，随后接龙";
  }

  switch (event.type) {
    case "GAME_STARTED":
      return "请先出任意花色的 7，随后接龙";
    case "CARD_PLAYED":
      return `${actorName(event.actor, playerName)}打出 ${formatCardId(event.cardId)}`;
    case "CARD_BORROWED":
      return `${actorName(event.actor, playerName)}借到 ${formatCardId(event.cardId)}`;
    case "TURN_PASSED":
      return event.actor === "player" ? playerTurnFeed(playerName) : "机器人接手";
    case "GAME_FINISHED":
      return event.winner === "player" ? playerWonRound(playerName) : "机器人赢下这一局";
  }
}

function helperMessage(snapshot: MatchSnapshot, showChildGuidance: boolean, playerName: string) {
  if (snapshot.status === "finished") {
    return "";
  }

  if (snapshot.phase === "borrowing") {
    return snapshot.turn !== "player" 
      ? "对手无牌可出。请从下方选择一张手牌借给对手。"
      : playerBorrowWaitingMessage(playerName);
  }

  if (snapshot.turn !== "player") {
    return "观察对手落牌，准备下一手。";
  }

  if (showChildGuidance) {
    return "发亮的底部手牌可以直接点击，没有可出牌时请手动借牌。";
  }

  return "";
}

export function createTransientFeedLayer({
  layout,
  playerName,
  showChildGuidance,
  snapshot,
}: TransientFeedLayerOptions) {
  const root = new Container() as TransientFeedLayerContainer;
  const primary = latestMessage(snapshot, playerName);
  const secondary = helperMessage(snapshot, showChildGuidance, playerName);
  const width = Math.min(layout.board.width * 0.50, layout.compact ? 320 : 460);

  const primaryText = new Text({
    style: {
      fill: cardTheme.textPrimary,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: layout.compact ? 18 : 20,
      fontWeight: "700",
      dropShadow: {
        alpha: 0.8,
        blur: 4,
        color: 0x000000,
        distance: 2,
      }
    },
    text: primary,
  });
  primaryText.anchor.set(0.5, 1);
  primaryText.position.set(layout.toastAnchor.x, layout.toastAnchor.y - 2);
  root.addChild(primaryText);

  // Capsule Timer UI
  const timerContainer = new Container();
  timerContainer.visible = false;
  
  const timerBg = new Graphics();
  // We will re-draw this dynamically or just draw a fixed size that fits "15s"
  timerBg.roundRect(0, 0, 42, 24, 12)
    .fill({ color: 0xd4af37, alpha: 0.2 }) // Luxury gold tint
    .stroke({ color: 0xd4af37, width: 1.5, alpha: 0.8 });
  
  const timerText = new Text({
    style: {
      fill: 0xffedd5, // Very light warm white
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: 14,
      fontWeight: "600",
    },
    text: "30s",
  });
  timerText.anchor.set(0.5);
  timerText.position.set(21, 12);
  
  timerContainer.addChild(timerBg, timerText);
  // Anchor middle-left of the capsule
  timerContainer.pivot.set(0, 12);
  root.addChild(timerContainer);

  root.updateTimerText = (time: number | null) => {
    if (time !== null && snapshot.status === "playing" && snapshot.turn === "player") {
      primaryText.text = primary;
      timerText.text = `${time}s`;
      timerContainer.position.set(primaryText.x + primaryText.width / 2 + 10, primaryText.y - primaryText.height / 2);
      timerContainer.visible = true;
    } else {
      primaryText.text = primary;
      timerContainer.visible = false;
    }
  };

  if (secondary) {
    const secondaryText = new Text({
      style: {
        fill: cardTheme.textMuted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: layout.compact ? 13 : 14,
        wordWrap: true,
        wordWrapWidth: width - 28,
        dropShadow: {
          alpha: 0.8,
          blur: 4,
          color: 0x000000,
          distance: 2,
        }
      },
      text: secondary,
    });
    secondaryText.anchor.set(0.5, 0);
    secondaryText.position.set(layout.toastAnchor.x, layout.toastAnchor.y + 4);
    root.addChild(secondaryText);
  }

  return root;
}
