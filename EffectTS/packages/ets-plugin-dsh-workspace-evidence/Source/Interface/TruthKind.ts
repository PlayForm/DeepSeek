/**
 * @module TruthKind
 *
 * The four kinds of truth the evidence service owns as its taxonomy.
 *
 * @remarks
 *
 * The Representation-First research (V4-1 section 2.4): reality, observation,
 * representation, and intent are different truth claims - what counts as
 * proof differs per kind. A named export: a bare string-union type cannot be
 * a default export under verbatimModuleSyntax.
 */
export type TruthKind =
	/**
	 * Reality - the claim about the world itself (the file on disk).
	 */
	| "reality"
	/**
	 * Observation - the claim about what was observed (the stamp/version).
	 */
	| "observation"
	/**
	 * Representation - the claim about the managed representation (the
	 * model, the block, the index).
	 */
	| "representation"
	/**
	 * Intent - the claim about what is meant to happen (the proposal, the
	 * plan).
	 */
	| "intent";
