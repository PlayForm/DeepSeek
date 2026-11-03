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
