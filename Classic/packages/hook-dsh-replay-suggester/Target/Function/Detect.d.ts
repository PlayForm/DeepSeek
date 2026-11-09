/**
 * @module Detect
 *
 * The deterministic classifier: a pure function that scores a call probe
 * against compiled rules and returns the winning Match or null.
 *
 * @remarks
 * The plan §4.3 shapes it: pure function, no LLM, no I/O, O(intents x rules)
 * + a map lookup. Given the compiled rules (the synthesized `Repeat` family
 * first, then an explicit pack's families) and a call probe (the tool name +
 * the JSON of its arguments), it returns the winning Match or null - the
 * algebra's identity element is silence.
 *
 * The math is the plan's §3.5: k = sigmoid(sum(weights of matching signals)
 * + bias), bias -0.6. The history evidence is no longer a separate lift: it
 * is the synthesized family's `history` signal (weight 2.5), so a recalled
 * record crosses the gate at k = sigmoid(2.5 - 0.6) = 0.87, while an
 * explicit pack family still has to earn its own weight.
 *
 * The regexes arrive precompiled (Function/Apply compiles the explicit pack
 * once per root and the synthesized family once per call) - this leaf never
 * compiles a regex itself.
 */
import type { CompiledIntent, Intent, Match } from "@Interface/Pack.js";
export default _default;
declare function _default(Rules: CompiledIntent[], Tool: string, Probe: string): Match | null;
/**
 * Compile the raw rows: the regex sources become RegExp objects (with the
 * case-insensitive flag - the probes are prose-ish). Function/Apply calls it
 * for the explicit pack (once per root) and for the synthesized family (once
 * per call); a malformed pattern throws, and the listener's try/catch is the
 * fail-open posture (the call passes through unnoted).
 */
export declare const Compile: (Raw: Intent[]) => CompiledIntent[];
