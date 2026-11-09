/**
 * @module Measure
 *
 * Measures one pack candidate against the graph projection: the P2 rules that replace the
 * neutral 0.5 literal of Function/Score.
 *
 * @remarks
 * literal(c) =
 *
 *   - 0.5 when the graph is absent or empty (the documented neutral fallback - the caller
 *     passes no projection);
 *   - 1.0 * recency(c) when a node exists at c and its kind is one the intent expects
 *     (Variable/Kinds), where recency(c) = 0.9 + 0.1 * rank;
 *   - 0.8 * recency(c) when a node exists at c with another kind;
 *   - 0.3 when the graph has nodes but none at c (the candidate is unproven - the existence
 *     filter already proved the file on disk, the graph did not).
 *
 * scope(c) =
 *
 *   - 1.0 when the graph is absent/empty, or the shallowest matched node sits at depth <= 2
 *     (the canonical top);
 *   - 1.0 - min(0.3, 0.05 * (depth - 2)) for a deeper literal node;
 *   - 0.7 for a glob candidate the graph proves (the plan's in-scope glob tier).
 *
 * The match rules (the projection only READS the graph; it never rewrites a candidate):
 *
 *   - a literal path matches a node path equal to it or ending in `/<path>` (the pack mixes
 *     repo-relative and package-relative paths, and the graph stores display paths);
 *   - a `*` then `/<rest>` glob matches any node path ending in `/<rest>` (any package, the same
 *     sibling rule the existence filter uses);
 *   - any other glob is translated to a segment-anchored regex (a double star then a slash = any depth, `*` = one
 *     segment).
 */
import type { Intent, Target } from "../Interface/Execution.js";
import type Measurement from "../Interface/Measurement.js";
import type Projection from "../Interface/Projection.js";
/** Whether a node path satisfies a candidate path or glob. */
export declare const Match: (Candidate: string, NodePath: string) => boolean;
export default _default;
declare function _default(
/** The built projection (Function/Projection). */
Projection: Projection, 
/** The intent the candidate belongs to (its expected kinds). */
Intent: Intent, 
/** The pack candidate. */
Target: Target): Measurement;
