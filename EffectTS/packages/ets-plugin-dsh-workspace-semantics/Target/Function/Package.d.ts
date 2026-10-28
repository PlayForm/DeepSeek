import type ReferenceNode from "@Interface/ReferenceNode.js";
import type Span from "@Interface/Span.js";
import type SymbolNode from "@Interface/SymbolNode.js";
declare const _default: {
    extensions: never[];
    files: string[];
    scan(text: string, _path: string): {
        symbols: SymbolNode[];
        references: ReferenceNode[];
        dependencies: string[];
        certain: true;
    };
    rename(text: string, path: string, span: Span, to: string): {
        path: string;
        from: string;
        to: string;
        edits: Span[];
        certainty: "references";
    } | undefined;
};
export default _default;
