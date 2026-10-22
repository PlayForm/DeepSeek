import type Operation from "../Interface/Operation.js";
export default _default;
declare function _default(Kind: string, _Path: string, Content: string, Params: Record<string, string | number | boolean>): Omit<Operation, "path"> | null;
