/**
 * @module Detect
 *
 * The DETERMINISTIC CLASSIFIER (the plan §4.3: pure function, no LLM, no I/O, O(intents x rules)
 * + a map lookup).
 *
 * @remarks
 * Given the compiled pack and a call probe (the tool name + the JSON of its arguments), it
 * returns the winning Match or null - the algebra's identity element is silence.
 *
 * The math is the plan's §3.5: `k = sigmoid(sum(weights of matching signals) + bias)`, bias
 * -0.6 so that a single weak signal does not cross the default threshold. For the convention
 * pack the probe's leading tool name (write / edit / raw-write) is itself context, so the
 * signals key on the target path inside the arguments.
 *
 * The regexes arrive precompiled (Function/Apply compiles once at apply) - the hot path never
 * compiles a regex.
 */
import type { CompiledIntent, Intent, Match } from "../Interface/Pack.js";
export default _default;
declare function _default(Rules: CompiledIntent[], Tool: string, Probe: string): Match | null;
/**
 * Compile the raw pack once at apply: the regex sources become RegExp
 * objects (with the case-insensitive flag - the probes are prose-ish) and
 * invalid patterns are dropped rather than thrown (fail-open posture).
 */
export declare const Compile: (Raw: Intent[]) => CompiledIntent[];
