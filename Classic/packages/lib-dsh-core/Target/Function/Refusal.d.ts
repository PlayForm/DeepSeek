export default _default;
/**
 * @module Refusal
 *
 * The shared refusal guard: only the declared dependency sections may differ from the
 * author's manifest.
 *
 * @remarks
 *
 * If a module's own logic would EVER change a non-dependency section, the rewrite is
 * refused - never applied. The guard composes the family's byte-identical line through the
 * module's Append:
 *
 *   `REFUSED rewrite of <path>: non-dependency section "<name>" would change`
 *
 * It returns true when refused: the module returns null, the factory stays silent and no
 * update stage follows.
 */
declare function _default(Append: (Message: string) => void, Path: string, Sections: string[], Current: Record<string, unknown>, Next: Record<string, unknown>): boolean;
