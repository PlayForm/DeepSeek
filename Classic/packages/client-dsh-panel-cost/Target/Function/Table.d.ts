import type { TurnsCells } from "./Columns.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type TableProps = {
    Body: readonly ReturnType<typeof createElement>[];
    Totals: ReturnType<typeof createElement>;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function Table(Props: TableProps): ReturnType<typeof createElement>;
export {};
