import type { Section } from "../Interface/Section.js";
/** One collapsed entry: the rendered text (full frame or one-line summary)
 * and whether it was collapsed by the budget. */
export interface CollapseEntry {
    text: string;
    collapsed: boolean;
}
export default _default;
declare function _default(Sections: Section[], BudgetBytes: number): CollapseEntry[];
