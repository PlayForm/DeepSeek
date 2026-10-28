import type ReferenceNode from "./ReferenceNode.js";
import type RenamePlan from "./RenamePlan.js";
import type Span from "./Span.js";
import type SymbolNode from "./SymbolNode.js";
export default interface Adapter {
    /** The file extensions (with dot, lowercase) the adapter owns. */
    extensions: string[];
    /** The exact basenames the adapter owns (checked before the extension).
     *  Absent or empty for the extension adapters. */
    files?: string[];
    /** Build the model from the file's text. */
    scan(text: string, path: string): {
        symbols: SymbolNode[];
        references: ReferenceNode[];
        dependencies: string[];
        certain: boolean;
    };
    /** Compute the rename plan for the identifier at `span` (or refuse).
     *  The refusal-to-guess rule lives HERE: an adapter that cannot be
     *  certain returns undefined, and the service reports the refusal. */
    rename(text: string, path: string, span: Span, to: string): RenamePlan | undefined;
}
