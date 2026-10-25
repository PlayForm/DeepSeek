import type Manifest from "./Manifest.js";
export default interface Passage {
    /** The decoded manifest from the transform — the update stage's input. */
    Current: Manifest | null;
    /** Whether the update stage may follow the chain pass. */
    Proceed: boolean;
}
