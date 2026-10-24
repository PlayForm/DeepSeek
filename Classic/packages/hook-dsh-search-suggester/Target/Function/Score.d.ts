import type Projection from "../Interface/Projection.js";
import type { Detection, KnowledgeRow, Verdict } from "../Interface/Execution.js";
/** The gate input, built by Apply from the per-agent state and the config. */
export interface Gate {
    /** The intent ids that emitted within the cooldown window. */
    Cooled: string[];
    /** The dedupe keys ("intent:candidate-set-hash") already noted this turn. */
    Noted: Set<string>;
    /** The candidate paths suggested within the cooldown window. */
    Recent: Set<string>;
    /** Notes emitted this turn. */
    Notes: number;
    /** The per-turn cap. */
    MaxNotes: number;
    /** The config's threshold (the non-destructive default). */
    Threshold: number;
    /** The candidate cap. */
    MaxCandidates: number;
    /** The excluded directories (a candidate inside them is out of scope). */
    Exclude: string[];
    /** The history lookup (the knowledge's Laplace inputs). */
    History: (Intent: string, Path: string) => KnowledgeRow | undefined;
    /** The dismissal lookup (the knowledge's durable dismissals; Path undefined = the family). */
    Dismissed: (Intent: string, Path: string | undefined) => boolean;
    /** The graph projection, when one is available (Function/Projection). */
    Projection: Projection | undefined;
}
/** The candidate-set dedupe key: the intent plus its sorted paths. */
declare const Key: (Intent: string, Paths: string[]) => string;
export default _default;
declare function _default(
/** The ranked detections (Detect's output). */
Detections: Detection[], 
/** The gate input. */
Input: Gate): Verdict;
/** The dedupe key for an emitted note (Apply records it for the next call). */
export declare const NoteKey: typeof Key;
