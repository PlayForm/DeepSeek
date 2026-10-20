export default interface Actor {
    /** The tool name of the mutating actor, when one is present. */
    name?: string;
    /** The raw-write's marker: any value here routes the write's governance
     *  to the factory's direct `Govern` path exclusively (presence, not the
     *  value, is what the gate checks). */
    govern?: unknown;
}
