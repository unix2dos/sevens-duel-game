import { Container, Text } from "pixi.js";

import { cardTheme } from "../cards/cardTheme";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";
import { formatCardId } from "../../../ui/cardPresentation";

interface TransientFeedLayerOptions {
  layout: TableLayout;
  showChildGuidance: boolean;
  snapshot: MatchSnapshot;
}

function latestMessage(snapshot: MatchSnapshot) {
  const event = snapshot.eventLog.at(-1);

  if (!event) {
    return "牌局开始";
  }

  switch (event.type) {
    case "GAME_STARTED":
      return "红桃 3 持有者负责尝试开线";
    case "CARD_PLAYED":
      return `${event.actor === "player" ? "你" : "AI"}打出 ${formatCardId(event.cardId)}`;
    case "CARD_BORROWED":
      return `${event.actor === "player" ? "你" : "AI"}借到 ${formatCardId(event.cardId)}`;
    case "TURN_PASSED":
      return event.actor === "player" ? "轮到你出牌" : "AI 接手";
    case "GAME_FINISHED":
      return event.winner === "player" ? "你赢下这一局" : "AI 赢下这一局";
  }
}

function helperMessage(snapshot: MatchSnapshot, showChildGuidance: boolean) {
  if (snapshot.status === "finished") {
    return "";
  }

  if (snapshot.turn !== "player") {
    return "观察对手落牌，准备下一手。";
  }

  if (showChildGuidance) {
    return "发亮的底部手牌可以直接点击，没有可出牌时系统会帮你借牌。";
  }

  return "从底部手牌区直接出牌。";
}

export function createTransientFeedLayer({
  layout,
  showChildGuidance,
  snapshot,
}: TransientFeedLayerOptions) {
  const root = new Container();
  const primary = latestMessage(snapshot);
  const secondary = helperMessage(snapshot, showChildGuidance);
  const width = Math.min(layout.board.width * 0.36, layout.compact ? 236 : 332);

  const primaryText = new Text({
    style: {
      fill: cardTheme.textPrimary,
      fontFamily: "Sora, IBM Plex Sans, sans-serif",
      fontSize: layout.compact ? 13 : 14,
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
  primaryText.anchor.set(0.5, 0);
  primaryText.position.set(layout.toastAnchor.x, layout.toastAnchor.y + 10);
  root.addChild(primaryText);

  if (secondary) {
    const secondaryText = new Text({
      style: {
        fill: cardTheme.textMuted,
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: layout.compact ? 11 : 12,
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
    secondaryText.position.set(layout.toastAnchor.x, layout.toastAnchor.y + 32);
    root.addChild(secondaryText);
  }

  return root;
}
