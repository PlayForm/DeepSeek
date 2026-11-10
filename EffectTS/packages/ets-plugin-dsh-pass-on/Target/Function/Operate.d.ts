/**
 * @module Operate
 *
 * The operation synthesis: the deterministic transform per target, per kind.
 *
 * @remarks
 * Plan section 3. Declarative: the pass-on computes find/replace but never
 * executes them. Returns null when the kind makes no change for this target
 * (the target is then skipped, with the reason).
 */
import type Operation from "../Interface/Operation.js";
export default _default;
declare function _default(Kind: string, _Path: string, Content: string, Params: Record<string, string | number | boolean>): Omit<Operation, "path"> | null;
