/**
 * @module Score
 *
 * The confidence and the gate (plan sections 3.5-3.7, 4.7).
 *
 * @remarks
 *   k = sigmoid(sum(weights) + b), b = -0.6, so a single weak signal does not
 *   cross the default threshold;
 *
 *   score(c) = 0.35*scope(c) + 0.25*prior(c) + 0.25*literal(c)
 *            + 0.15*history(c) - 0.20*recent(c)
 *
 *   scope(c)   = the graph projection's depth tier (Function/Measure), or
 *                1.0 when the graph is absent/empty (the neutral fallback);
 *   prior(c)   = the pack's prior (1.0 canonical, 0.6 family, 0.3 fallback);
 *   literal(c) = the graph projection's proof of the candidate (the node
 *                exists, its kind is expected for the intent, its recency),
 *                or the documented NEUTRAL 0.5 when the graph is absent or
 *                has no nodes - the PoC value the projection replaces;
 *   history(c) = the Laplace rate (followed+1)/(count+2) from the knowledge;
 *   recent(c)  = 1.0 if c was suggested within the cooldown window.
 *
 * The gate (plan 2.4 + 4.7): the verdict is
 *   "abstain"  - below the intent's threshold, or the candidate list is empty
 *                (the algebra's identity element is silence);
 *   "suppress" - the confidence passes but the noise control holds it back
 *                (a dismissal, the cooldown, the dedupe, the per-turn cap);
 *   "emit"     - the ordered, capped candidate list with the intent's k.
 *
 * THE DISMISSAL (the plan's section 6.2, the `suggestion_dismiss` tool): a
 * family dismissal suppresses the whole note until it expires; a path
 * dismissal drops that candidate from the list. When the dismissals remove
 * every candidate the verdict is the `dismissed` suppression, not the
 * ambiguous-target abstention - the list was not empty, it was refused.
 */
import type { Detection, KnowledgeRow, Verdict } from "../Interface/Execution.js";
import type Projection from "../Interface/Projection.js";
/**
 * The gate input, built by Apply from the per-agent state and the config.
 */
export interface Gate {
    /**
     * The intent ids that emitted within the cooldown window.
     */
    Cooled: string[];
    /**
     * The dedupe keys ("intent:candidate-set-hash") already noted this turn.
     */
    Noted: Set<string>;
    /**
     * The candidate paths suggested within the cooldown window.
     */
    Recent: Set<string>;
    /**
     * Notes emitted this turn.
     */
    Notes: number;
    /**
     * The per-turn cap.
     */
    MaxNotes: number;
    /**
     * The config's threshold (the non-destructive default).
     */
    Threshold: number;
    /**
     * The candidate cap.
     */
    MaxCandidates: number;
    /**
     * The excluded directories (a candidate inside them is out of scope).
     */
    Exclude: string[];
    /**
     * The history lookup (the knowledge's Laplace inputs).
     */
    History: (Intent: string, Path: string) => KnowledgeRow | undefined;
    /**
     * The dismissal lookup (the knowledge's durable dismissals; Path
     * undefined = the family).
     */
    Dismissed: (Intent: string, Path: string | undefined) => boolean;
    /**
     * The graph projection, when one is available (Function/Projection).
     */
    Projection: Projection | undefined;
}
/**
 * The candidate-set dedupe key: the intent plus its sorted paths.
 */
declare const Key: (Intent: string, Paths: string[]) => string;
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
