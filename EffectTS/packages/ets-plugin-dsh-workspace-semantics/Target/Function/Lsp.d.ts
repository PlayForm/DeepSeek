import type ReferenceNode from "@Interface/ReferenceNode.js";
import type RenamePlan from "@Interface/RenamePlan.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";
declare const _default: {
    name: string;
    extensions: string[];
    references(Context: unknown, Root: string, Path: string, Text: string, Symbols: SymbolNode[]): Promise<ReferenceNode[] | undefined>;
    rename(Context: unknown, Root: string, Path: string, Text: string, Range: Span, To: string): Promise<RenamePlan | undefined>;
};
export default _default;
