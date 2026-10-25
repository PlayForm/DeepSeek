import type Lens from "@Interface/Lens.js";
interface Resolved {
    name: string;
    nodes: Set<string>;
    edges: Set<string>;
    known: boolean;
}
export default _default;
declare function _default(Requested: string | undefined, Available: string[], Default: string, Catalog: Lens[]): Resolved;
