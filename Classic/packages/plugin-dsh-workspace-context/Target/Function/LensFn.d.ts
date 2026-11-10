import type Lens from "../Interface/Lens.js";
/**
 * @module LensFn
 *
 * The lens resolution and filtering (Function/LensFn): resolve the requested
 * lens name against config `lenses` and the shipped catalog, and return the
 * node/edge kind filters.
 *
 * @remarks
 *
 * An unknown name falls back to the configured default; a default that is
 * itself unknown degrades to no filtering (the honest "all" reading),
 * reported to the caller through an OPEN line the packet builder adds.
 */
interface Resolved {
    name: string;
    nodes: Set<string>;
    edges: Set<string>;
    known: boolean;
}
export default _default;
declare function _default(Requested: string | undefined, Available: string[], Default: string, Catalog: Lens[]): Resolved;
