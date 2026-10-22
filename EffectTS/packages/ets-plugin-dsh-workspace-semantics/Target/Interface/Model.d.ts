import type ReferenceNode from "@Interface/ReferenceNode.js";
import type SymbolNode from "@Interface/SymbolNode.js";
export default interface Model {
    /** The path the model was built for (as the caller addressed it). */
    path: string;
    /** The observed version token the model was built from; "absent" for an
     *  absent observation (honest, never fabricated). */
    version: string;
    /** The index revision at build time (the service's own monotonic
     *  counter - never a wall clock). */
    indexRevision: number;
    /** The file's symbols. */
    symbols: SymbolNode[];
    /** The file's references. */
    references: ReferenceNode[];
    /** The file's dependencies (the imported paths as the adapter saw them). */
    dependencies: string[];
    /** The freshness: "fresh" since the last build, "stale" after an fs/observed
     *  event the Wire listener saw before a resolve could rebuild. */
    freshness: "fresh" | "stale";
}
