import type { CompiledIntent, Intent, Match } from "../Interface/Pack.js";
export default _default;
declare function _default(Rules: CompiledIntent[], Tool: string, Probe: string): Match | null;
/**
 * Compile the raw pack once at apply: the regex sources become RegExp
 * objects (with the case-insensitive flag - the probes are prose-ish) and
 * invalid patterns are dropped rather than thrown (fail-open posture).
 */
export declare const Compile: (Raw: Intent[]) => CompiledIntent[];
