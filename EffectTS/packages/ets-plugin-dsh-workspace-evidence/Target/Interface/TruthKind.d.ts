export type TruthKind = 
/** Reality - the claim about the world itself (the file on disk). */
"reality"
/** Observation - the claim about what was observed (the stamp/version). */
 | "observation"
/** Representation - the claim about the managed representation (the
 *  model, the block, the index). */
 | "representation"
/** Intent - the claim about what is meant to happen (the proposal, the
 *  plan). */
 | "intent";
