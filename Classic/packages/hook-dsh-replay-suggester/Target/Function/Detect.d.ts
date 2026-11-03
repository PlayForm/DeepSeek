import type { CompiledIntent, Intent, Match } from "../Interface/Pack.js";
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
