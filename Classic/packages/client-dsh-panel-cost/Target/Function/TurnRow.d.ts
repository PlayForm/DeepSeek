import type { TurnsCells } from "./Columns.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import type CostTurn from "../Interface/Turn.js";
import { createElement } from "react";
type TurnRowProps = {
    Turn: CostTurn;
    Open: boolean;
    Scale: number;
    OnToggle: () => void;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function TurnRow(Props: TurnRowProps): ReturnType<typeof createElement>;
export {};
