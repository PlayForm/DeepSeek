// Scope - one agent's compiled scope view (Interface/Scope): the surfaces
// the agent owns, the overlaps (shared with another lane - read before
// edit), and the OFF-LIMITS surfaces (owned by another lane only). Derived
// from the file-ownership matrix at call time - pre-baked, never negotiated.
export default interface Scope {
	/** The agent's own surfaces. */
	yours: string[];
	/** Surfaces shared with another ACTIVE lane (the lane id -> the shared
	 *  surfaces). */
	shared: Record<string, string[]>;
	/** Surfaces another lane owns exclusively - OFF-LIMITS. */
	offLimits: string[];
}
