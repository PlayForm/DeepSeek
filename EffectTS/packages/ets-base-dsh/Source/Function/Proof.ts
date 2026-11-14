import Activate from "./Activate.js";

/**
 * @module Proof
 *
 * The mount proof: the ONE line a module writes at apply - the activation
 * summary when the module is live, the disabled marker when its master switch
 * is off.
 *
 * @remarks
 *
 * The master switch (`enabled: false`) must still leave every registration
 * mounted and inert, so the only observable difference between a live mount and
 * a disabled one is this line. Writing the branch per module produced copies
 * that drifted, two of which forgot the disabled arm entirely; this composer
 * owns the branch and the marker's byte-exact text, and delegates the
 * `activated (...)` join to `Activate`, which owns the pair grammar.
 *
 * Pure: the module passes its own boolean and its own field list, so the field
 * values - and therefore the byte-exact ledger line - stay module-side.
 */
export default (On: boolean, Fields: readonly (readonly [string, string | undefined])[]): string =>
	On ? Activate(Fields) : "disabled (enabled=false)";
