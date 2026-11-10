import type { Section } from "../Interface/Section.js";
/**
 * @module Collapse
 *
 * The budget collapse: fit the framed sections into a byte budget by rendering
 * in order and replacing the OLDEST overflow sections with ONE-LINE
 * SUMMARIES.
 *
 * @remarks
 *
 * The collapsed section is never a silent drop (the live-containers failsafe-8
 * rule): it stays visible as its summary line.
 *
 * The function is pure: sections in, a `{ text, collapsed }` list out; the
 * caller joins the texts with the separator it owns.
 */
/**
 * One collapsed entry: the rendered text (full frame or one-line summary) and
 * whether it was collapsed by the budget.
 */
export interface CollapseEntry {
    text: string;
    collapsed: boolean;
}
export default _default;
declare function _default(Sections: Section[], BudgetBytes: number): CollapseEntry[];
