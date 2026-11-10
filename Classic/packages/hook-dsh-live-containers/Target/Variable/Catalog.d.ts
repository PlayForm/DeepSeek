import type { BlockSpecification } from "../Interface/Execution.js";
/**
 * @module Catalog
 *
 * The suggester-facing projection of the 14-entry template catalog
 * (Requirements/03 section 3; the design's section 2.6 + I6 section 2).
 *
 * @remarks
 *
 * ONE source, THREE consumers: the default block table
 * (`Variable/DefaultBlocks`), this catalog (the suggester's compressed
 * input) and the docs' block table.
 *
 * I6 1.2 + R2: the compressed catalog is built AT PROCESS START and cached -
 * it never changes within a process; a user-edited catalog mid-process is
 * picked up only on restart (the catalog is config data, not live state).
 *
 * The I6 R1 token grammar is FROZEN for v1 to `expectAgents` + `steps`:
 * templates whose opening variables are richer (countdown targetAt, validator
 * thresholds) are NOT suggestable-configured - they fall back to the
 * "section" tier's plain note even in "plant" mode.
 */
/**
 * One catalog entry: the block spec plus the suggester's projection fields.
 */
export interface CatalogEntry {
    /**
     * The template id (also the block id in the default table).
     */
    id: string;
    /**
     * The block kind.
     */
    kind: string;
    /**
     * One-line use case (03 section 3).
     */
    use: string;
    /**
     * The template's token names (the docs' variable list).
     */
    tokens: string[];
    /**
     * Whether the kind is suggestable-configured in v1 (the frozen grammar).
     */
    configurable: boolean;
    /**
     * The shape class: board-shaped (expectAgents) or list-shaped (steps).
     */
    shape: "board" | "list" | "none";
}
/**
 * The 14 catalog entries in the default table's order (03 section 3).
 */
export declare const CATALOG: CatalogEntry[];
/** The compressed catalog text the suggester prompt embeds (I6 section 2:
 * one line per template - `<id>: <one-line use>. vars: <variable list>` -
 * capped at 2000 bytes, built once). */
export declare const Compressed: (At: number, Maximum?: number) => string;
/**
 * Whether a catalog id exists (the suggestion parser's unknown-template check).
 */
export declare const Known: (ID: string) => boolean;
/**
 * The catalog entry for one id (undefined when unknown).
 */
export declare const Entry: (ID: string) => CatalogEntry | undefined;
/** The default table's specs for one kind (the accept path instantiates from
 * the default table's template). */
export declare const Specifications: (DefaultBlocks: BlockSpecification[]) => BlockSpecification[];
