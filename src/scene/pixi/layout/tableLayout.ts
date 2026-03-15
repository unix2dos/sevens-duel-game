import type { Suit } from "../../../game/core/types";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SuitLaneLayout {
  key: Suit;
  label: string;
  rect: Rect;
  centerX: number;
  centerY: number;
}

export interface TableLayout {
  width: number;
  height: number;
  compact: boolean;
  padding: number;
  topBar: Rect;
  board: Rect;
  handRail: Rect;
  toastAnchor: { x: number; y: number };
  opponentAnchor: { x: number; y: number };
  suitLanes: SuitLaneLayout[];
}

const laneMeta: Array<{ key: Suit; label: string }> = [
  { key: "spades", label: "黑桃" },
  { key: "hearts", label: "红桃" },
  { key: "clubs", label: "梅花" },
  { key: "diamonds", label: "方块" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createTableLayout(width: number, height: number): TableLayout {
  const compact = width < 960;
  const padding = clamp(width * 0.028, compact ? 16 : 20, 34);
  const actionInset = compact ? 92 : 144;
  const topHeight = clamp(height * 0.115, compact ? 74 : 80, compact ? 92 : 102);
  const topWidth = width - padding * 2 - actionInset;
  // Increase the hand rail height to make the cards more visible
  const handHeight = clamp(height * 0.28, compact ? 160 : 190, compact ? 240 : 280);
  const boardTop = padding + topHeight + (compact ? 16 : 22);
  // Also reduce the bottom padding under the hand rail to push it lower
  const bottomPadding = compact ? 8 : 12;
  const rawBoardHeight = height - boardTop - handHeight - bottomPadding - (compact ? 14 : 20);
  const boardHeight = compact ? Math.min(rawBoardHeight, width * 1.05) : rawBoardHeight;
  const laneGap = clamp(width * 0.012, 10, 18);
  const boardWidth = width - padding * 2;
  const laneWidth = (boardWidth - laneGap * 3) / 4;
  const laneCenterY = boardTop + boardHeight / 2 + (compact ? 4 : 10);

  return {
    width,
    height,
    compact,
    padding,
    topBar: {
      x: padding,
      y: padding,
      width: topWidth,
      height: topHeight,
    },
    board: {
      x: padding,
      y: boardTop,
      width: boardWidth,
      height: boardHeight,
    },
    handRail: {
      x: padding,
      y: height - bottomPadding - handHeight,
      width: width - padding * 2,
      height: handHeight,
    },
    toastAnchor: {
      x: padding + topWidth / 2,
      y: padding + topHeight / 2,
    },
    opponentAnchor: {
      x: padding + topWidth - (compact ? 124 : 152),
      y: padding + (compact ? 10 : 12),
    },
    suitLanes: laneMeta.map((lane, index) => {
      const x = padding + index * (laneWidth + laneGap);

      return {
        key: lane.key,
        label: lane.label,
        rect: {
          x,
          y: boardTop,
          width: laneWidth,
          height: boardHeight,
        },
        centerX: x + laneWidth / 2,
        centerY: laneCenterY,
      };
    }),
  };
}
