/**
 * @module Detect
 *
 * The deterministic classifier: a pure function that scores a call probe
 * against compiled rules and returns the winning Match or null.
 *
 * @remarks
 * The plan §4.3 shape: pure function, no LLM, no I/O, O(intents x rules) plus
 * a map lookup. Given the compiled rules (the synthetic `History` family
 * first, then an explicit pack's families) and a call probe (the tool name +
 * the JSON of its arguments), the classifier returns the winning Match or
 * null - the algebra's identity element is silence.
 *
 * The math is the plan's §3.5: k = sigmoid(sum(weights of matching signals) +
 * bias), bias -0.6 so that a single weak signal does not cross the default
 * threshold. Rules: a call may satisfy several rules; the highest-priority
 * intent wins, and a second intent is folded in only if its k is within 0.1
 * (not implemented in v1 - one note, one intent).
 *
 * The regexes arrive precompiled (`Function/Apply` compiles once at apply) -
 * the hot path never compiles a regex.
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
