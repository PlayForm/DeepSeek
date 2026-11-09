/**
 * @module Score
 *
 * The confidence and the gate.
 *
 * @remarks
 * Completion spec D8 + 03-SUGGESTERS section 2: the pickable heuristic
 * scorer.
 *
 *   k = sigmoid(evidence + b), b = -0.6;
 *   score(c) = sum over the ENABLED heuristics of weight(h) * value(h)
 *
 * The six pickable heuristics (Variable/Heuristics) and their default weights
 * (Variable/Weights) are:
 *
 *   scope   0.35   the call matched the family's path rules (1.00);
 *   graph   0.00   the graph-distance placeholder (0.50, no graph service here);
 *   prior   0.25   the pack's prior for the companion;
 *   literal 0.25   the neutral literal (0.50, no generated index here);
 *   history 0.15   the LEARNED per-companion accept rate (neutral 1/3);
 *   accept  0.00   the LEARNED per-family accept rate (neutral 1/3).
 *
 * The default row reproduces the PoC formula exactly:
 * 0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3). The PoC's recent penalty is
 * not applied: a companion touched this turn is dropped outright below, so no
 * survivor can be recent. A missing learning store answers the neutral 1/3,
 * so the default score is unchanged byte-for-byte; a present one moves the
 * history/accept terms, and the config's `heuristics`/`weights` make any term
 * pickable (a disabled name is dropped from the sum).
 *
 * The gate: "abstain" below the family's threshold or when every companion
 * is already touched this turn; "suppress" for cooldown/dedupe/cap; "emit"
 * for the ordered, capped companion list. Every row is measured by
 * Function/Measure, the same leaf a gated silence's decision record uses.
 */
import type { Detection, Verdict } from "../Interface/Execution.js";
import { type MeasureInput } from "./Measure.js";
/**
 * The gate input, built by Apply from the per-agent state and the config.
 */
export interface Gate {
    /**
     * The family ids that emitted within the cooldown window.
     */
    Cooled: string[];
    /**
     * The dedupe keys already noted this turn.
     */
    Noted: Set<string>;
    /**
     * The paths touched since the last user message (already-touched
     * companions are dropped).
     */
    Touched: Set<string>;
    /**
     * Notes emitted this turn.
     */
    Notes: number;
    /**
     * The per-turn cap.
     */
    MaxNotes: number;
    /**
     * The config's threshold.
     */
    Threshold: number;
    /**
     * The companion cap.
     */
    MaxCompanions: number;
    /**
     * The measure input: the effective weights and the learned-rate lookups.
     */
    Measure: MeasureInput;
}
/**
 * The companion-set dedupe key: the family plus its sorted paths.
 */
declare const Key: (Family: string, Paths: string[]) => string;
export default _default;
declare function _default(
/**
 * The ranked detections (Detect's output).
 */
Detections: Detection[], 
/**
 * The gate input.
 */
Input: Gate): Verdict;
/**
 * The dedupe key for an emitted note (Apply records it for the next call).
 */
export declare const NoteKey: typeof Key;
