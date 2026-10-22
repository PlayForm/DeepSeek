import type { Span } from "@Interface/Node.js";
export interface SymbolMatch {
    name: string;
    keyword: string;
    span: Span;
    body?: Span;
}
export default _default;
declare function _default(Lines: string[]): SymbolMatch[];
