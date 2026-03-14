import { Container } from "pixi.js";
import type { TableLayout } from "../layout/tableLayout";
import type { MatchSnapshot } from "../../../game/match/engine";

interface OpponentLayerOptions {
  layout: TableLayout;
  snapshot: MatchSnapshot;
}

export function createOpponentLayer({ layout, snapshot }: OpponentLayerOptions) {
  void layout;
  void snapshot;

  return new Container();
}
