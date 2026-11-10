/**
 * @module Detect
 *
 * Classifies a call probe deterministically against compiled rules and returns the Match.
 *
 * @remarks
 * The DETERMINISTIC CLASSIFIER (the plan §4.3: pure function, no LLM, no I/O,
 * O(intents x rules) + a map lookup). Given the compiled rules and a call probe (the
 * tool name + the JSON of its arguments), it returns the winning Match or null - the
 * algebra's identity element is silence.
 *
 * The rules are the SYNTHETIC graph intents of the call (Function/Apply builds them from
 * the graph query and prepends them as data), so the classifier never reads a table and
 * never learns where a candidate came from: it sums the evidence and applies the gate.
 *
 * The math is the plan's §3.5: k = sigmoid(sum(weights of matching signals) + bias),
 * bias -0.6 so that a single weak signal does not cross the default threshold.
 *
 * The regexes arrive precompiled: Function/Apply compiles the synthetic rule set once
 * per judged call (one literal `.` pattern per intent), so the hot path never builds a
 * regex per signal.
 */
import type { CompiledIntent, Intent, Match } from "../Interface/Pack.js";
export default _default;
declare function _default(Rules: CompiledIntent[], Tool: string, Probe: string): Match | null;
/**
 * Compile one raw rule set into the classifier's form: the regex sources
 * become RegExp objects (with the case-insensitive flag - the probes are
 * prose-ish) and invalid patterns are dropped rather than thrown (fail-open
 * posture). The graph intents are compiled per judged call, from the graph
 * query's own answer.
 */
export declare const Compile: (Raw: Intent[]) => CompiledIntent[];
