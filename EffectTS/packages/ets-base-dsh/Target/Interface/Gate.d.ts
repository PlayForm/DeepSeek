export default interface Gate {
    /** Whether the observation passes every g1 gate and may proceed to g2. */
    pass: boolean;
    /** Why the gate failed — absent when `pass` is true. */
    reason?: "target" | "govern" | "actor" | "kind" | "idempotent" | "basename" | "excluded";
    /** The display path, when one was readable. */
    path?: string;
}
