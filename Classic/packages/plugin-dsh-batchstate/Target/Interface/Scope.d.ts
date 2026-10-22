export default interface Scope {
    /** The agent's own surfaces. */
    yours: string[];
    /** Surfaces shared with another ACTIVE lane (the lane id -> the shared
     *  surfaces). */
    shared: Record<string, string[]>;
    /** Surfaces another lane owns exclusively - OFF-LIMITS. */
    offLimits: string[];
}
