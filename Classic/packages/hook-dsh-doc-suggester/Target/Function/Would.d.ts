import type { CompanionDecision } from "../Interface/Decision.js";
import type { Family } from "../Interface/Execution.js";
import { type MeasureInput } from "./Measure.js";
export default _default;
declare function _default(
/** The winning family (already existence-filtered). */
Family: Family, 
/** The measure input (the effective weights and the learned rates). */
Input: MeasureInput, 
/** The companion cap (config `maxCompanions`). */
Limit: number): CompanionDecision[];
