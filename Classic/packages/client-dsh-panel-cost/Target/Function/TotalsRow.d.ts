import type { TurnsCells } from "./Columns.js";
import type CostSummary from "../Interface/Summary.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
/**
 * @module TotalsRow
 *
 * The tfoot row: the session label spanning the identity columns with the call count, the
 * files-column spacer, and one cell per remaining resolved column, each built by that column's
 * render.
 *
 * @remarks
 *
 * The row reads the same resolved definition as the header and the body, so its cell count cannot
 * drift from theirs.
 */
type TotalsRowProps = {
    Summary: CostSummary;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function TotalsRow(Props: TotalsRowProps): ReturnType<typeof createElement>;
export {};
