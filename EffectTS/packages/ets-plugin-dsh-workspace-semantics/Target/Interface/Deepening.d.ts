import type ReferenceNode from "./ReferenceNode.js";
import type RenamePlan from "./RenamePlan.js";
import type Span from "./Span.js";
import type SymbolNode from "./SymbolNode.js";
export default interface Deepening {
    /** The name the ledger reports (`deepened <path> ... via <name>`). */
    name: string;
    /** The file extensions (with dot, lowercase) the deepener owns. */
    extensions: string[];
    /** The scope-resolved references for the file's declared symbols;
     *  `undefined` means "cannot answer" - the lexical list stands. */
    references(Context: unknown, Root: string, Path: string, Text: string, Symbols: SymbolNode[]): Promise<ReferenceNode[] | undefined>;
    /** The scope-resolved rename plan for the identifier at `span`;
     *  `undefined` means "cannot answer" - the adapter's plan stands. */
    rename(Context: unknown, Root: string, Path: string, Text: string, Span: Span, To: string): Promise<RenamePlan | undefined>;
}
