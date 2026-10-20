import type { BlockSpec } from "@Interface/Execution.js";
/** One catalog entry: the block spec plus the suggester's projection fields. */
export interface CatalogEntry {
    id: string;
    kind: string;
    /** One-line use case (03 section 3). */
    use: string;
    /** The template's token names (the docs' variable list). */
    tokens: string[];
    /** Whether the kind is suggestable-configured in v1 (the frozen grammar). */
    configurable: boolean;
    /** The shape class: board-shaped (expectAgents) or list-shaped (steps). */
    shape: "board" | "list" | "none";
}
/** The 14 catalog entries in the default table's order (03 section 3). */
export declare const CATALOG: CatalogEntry[];
/** The compressed catalog text the suggester prompt embeds (I6 section 2:
 * one line per template - `<id>: <one-line use>. vars: <variable list>` -
 * capped at 2000 bytes, built once). */
export declare const Compressed: (At: number, Max?: number) => string;
/** Whether a catalog id exists (the suggestion parser's unknown-template check). */
export declare const Known: (Id: string) => boolean;
/** The catalog entry for one id (undefined when unknown). */
export declare const Entry: (Id: string) => CatalogEntry | undefined;
/** The default table's specs for one kind (the accept path instantiates from
 * the default table's template). */
export declare const Specs: (DefaultBlocks: BlockSpec[]) => BlockSpec[];
