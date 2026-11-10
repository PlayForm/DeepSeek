import type Operation from "../Interface/Operation.js";
import type Target from "../Interface/Target.js";
export default _default;
/**
 * @module Digest
 *
 * The content-derived id and fence (plan section 2): sha256 over the targets
 * (path + version) and the operations (find + replace).
 *
 * @remarks
 *
 * The ingester applies only the proposal whose digest still matches.
 */
declare function _default(Targets: Target[], Operations: Omit<Operation, "path">[]): string;
