import type { NodeKind } from "@Interface/Node.js";
export default interface Query {
    name?: string;
    pattern?: string;
    kind?: NodeKind;
    limit?: number;
}
