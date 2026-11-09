import type { Span } from "../Interface/Node.js";
export interface SectionMatch {
    level: number;
    title: string;
    span: Span;
}
export default _default;
declare function _default(Lines: string[]): SectionMatch[];
