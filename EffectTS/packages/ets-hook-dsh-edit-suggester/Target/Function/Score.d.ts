import type { Detection, Verdict } from "../Interface/Execution.js";
/** The gate input, built by Apply from the per-agent state and the config. */
export interface Gate {
    /** The family ids that emitted within the cooldown window. */
    Cooled: string[];
    /** The dedupe keys already noted this turn. */
    Noted: Set<string>;
    /** The paths touched since the last user message (already-touched companions are dropped). */
    Touched: Set<string>;
    /** Notes emitted this turn. */
    Notes: number;
    /** The per-turn cap. */
    MaxNotes: number;
    /** The config's threshold. */
    Threshold: number;
    /** The companion cap. */
    MaxCompanions: number;
    /** The excluded directories (an edit or a companion inside them is out of scope). */
    Exclude: string[];
}
/** The companion-set dedupe key: the family plus its sorted paths. */
declare const Key: (Family: string, Paths: string[]) => string;
export default _default;
declare function _default(
/** The ranked detections (Detect's output). */
Detections: Detection[], 
/** The edited path (dropped from the companion list and counted as touched). */
EditPath: string, 
/** The gate input. */
Input: Gate): Verdict;
/** The dedupe key for an emitted note (Apply records it for the next call). */
export declare const NoteKey: typeof Key;
