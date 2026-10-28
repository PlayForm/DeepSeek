import type Manifest from "./Manifest.js";
export default interface Passage {
    /** The decoded manifest from the transform — the update stage's input. */
    Manifest: Manifest | null;
    /** The resolved update-policy path (Function/Resolve — first-wins). */
    Policy: string;
    /** Set when the rewrite was REFUSED (a section intruder or a Pin
     *  refusal): the pre-refactor flow skipped the update stage entirely in
     *  that case, and the module's Observe honors this flag the same way. */
    Refused: boolean;
}
