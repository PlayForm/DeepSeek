/**
 * @module Matcher
 *
 * The ranked match: scoring arithmetic over candidate patterns, never an LLM
 * call.
 *
 * @remarks
 * A lookup plus arithmetic, never an LLM call (PATTERN-GRAPH-PLUGIN.md risk 5).
 * Score weights: the keyword overlap 0.6, the trigger's tool match 0.2, the
 * stored confidence 0.2. Two abstention paths, both producing the EMPTY result
 * (risk 1: the wrong suggestion is worse than none):
 * - threshold - every score below `Knobs.matchThreshold` drops;
 * - ambiguity - when the top two scores sit within `Knobs.ambiguityEpsilon`,
 *   the result is empty: two patterns matching equally is not a decision.
 */
import type Knobs from "../Interface/Config.js";
import type { MatchResult } from "../Interface/Match.js";
import type Pattern from "../Interface/Pattern.js";
export default _default;
declare function _default(Candidates: Pattern[], Context: {
    tool?: string | undefined;
    text?: string | undefined;
}, Knobs: Knobs): MatchResult[];
