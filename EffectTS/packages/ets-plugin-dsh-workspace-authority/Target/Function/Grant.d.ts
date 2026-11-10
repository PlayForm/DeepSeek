/**
 * @module Grant
 *
 * The capability grant path: validate, enforce the ceiling, stamp, ledger.
 *
 * @remarks
 * The capability is the WHAT record: the holder, the resource, the
 * permitted operations, the expiration, the delegation rule - never a
 * weight, never a priority (the license/weight conflation is a logged
 * pitfall). A grant when disabled is refused honestly ("the authority is
 * disabled"), never faked.
 */
import type Capability from "../Interface/Capability.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Spec: {
    holder: string;
    resource: string;
    operations: string[];
    expiresAt?: number | undefined;
    delegation?: "none" | "delegate";
}): Capability | undefined;
