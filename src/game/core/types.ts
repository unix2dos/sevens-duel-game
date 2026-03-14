export type Suit = "spades" | "hearts" | "clubs" | "diamonds";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A";

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface Hands {
  player: Card[];
  opponent: Card[];
}
