import type { TurnsCells } from "./Columns.js";
import type CostSummary from "../Interface/Summary.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type TotalsRowProps = {
    Summary: CostSummary;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function TotalsRow(Props: TotalsRowProps): ReturnType<typeof createElement>;
export {};
