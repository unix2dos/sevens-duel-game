import type { Actor } from "../game/core/state";

export function normalizePlayerName(value: string) {
  return value.trim();
}

export function isValidPlayerName(value: string) {
  return normalizePlayerName(value).length > 0;
}

export function actorName(actor: Actor, playerName: string) {
  return actor === "player" ? playerName : "机器人";
}

export function playerHandLabel(playerName: string) {
  return `${playerName}的手牌`;
}

export function playerTurnLabel(playerName: string) {
  return `${playerName}的回合`;
}

export function playerTurnFeed(playerName: string) {
  return `轮到${playerName}出牌`;
}

export function playerWinTitle(playerName: string) {
  return `${playerName}赢了`;
}

export function playerWonRound(playerName: string) {
  return `${playerName}赢下这一局`;
}

export function gameResultCopy(playerName: string) {
  return `这一局已经收桌。${playerName}可以立刻再开一局，或者回到首页重新挑选难度。`;
}

export function gameModalResultCopy(playerName: string) {
  return `这一局已经收桌。${playerName}可以立刻再开一局，或者关闭此弹窗查看桌面的最后一手牌复盘。`;
}

export function playerBorrowWaitingMessage(playerName: string) {
  return `${playerName}无牌可出，只能向对手求助。请等待对手借牌。`;
}
