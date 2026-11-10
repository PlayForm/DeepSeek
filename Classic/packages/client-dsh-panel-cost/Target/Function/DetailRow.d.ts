/**
 * @module DetailRow
 *
 * The per-file accordion under an expanded step row.
 *
 * @remarks
 * The head with the priced total, the five priced buckets, one block per file sorted by its money
 * and capped at the file limit, the touched and allocation-only fallbacks, and the hidden notice.
 * The cell spans every column the resolved definition keeps, so it cannot outgrow the header.
 */
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
