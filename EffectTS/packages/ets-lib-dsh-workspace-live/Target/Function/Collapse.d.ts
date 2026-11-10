/**
 * @module Collapse
 *
 * Applies the budget collapse: fits the framed sections into a byte budget by
 * rendering in order and replacing the OLDEST overflow sections with
 * ONE-LINE SUMMARIES.
 *
 * @remarks
 * The collapse is never a silent drop - the live-containers failsafe-8 rule:
 * the collapsed section stays visible as its summary line. Pure: sections in,
 * `{ text, collapsed }` list out; the caller joins the texts with the
 * separator it owns.
 */
import type { Section } from "../Interface/Section.js";
/**
 * One collapsed entry: the rendered text (full frame or one-line summary)
 * and whether it was collapsed by the budget.
 */
export interface CollapseEntry {
    text: string;
    collapsed: boolean;
}
export default _default;
declare function _default(Sections: Section[], BudgetBytes: number): CollapseEntry[];
