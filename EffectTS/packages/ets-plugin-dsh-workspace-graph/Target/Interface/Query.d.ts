import type { NodeKind } from "./Node.js";
export default interface Query {
    name?: string;
    pattern?: string;
    kind?: NodeKind;
    limit?: number;
}
