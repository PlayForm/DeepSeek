import type { TurnsCells } from "./Columns.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
/**
 * @module Table
 *
 * The table shell: the colgroup, the sticky header row carrying the column locale keys, and the
 * body and footer the view composes.
 *
 * @remarks
 *
 * Every part reads the one resolved definition the view hands down, so the header and the widths
 * cannot drift from the cells the rows emit.
 */
type TableProps = {
    Body: readonly ReturnType<typeof createElement>[];
    Totals: ReturnType<typeof createElement>;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function Table(Props: TableProps): ReturnType<typeof createElement>;
export {};
