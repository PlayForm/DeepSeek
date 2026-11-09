import type { TurnsCells } from "./Columns.js";
import type CostStep from "../Interface/Step.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type DetailRowProps = {
    Step: CostStep;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function DetailRow(Props: DetailRowProps): ReturnType<typeof createElement>;
export {};
