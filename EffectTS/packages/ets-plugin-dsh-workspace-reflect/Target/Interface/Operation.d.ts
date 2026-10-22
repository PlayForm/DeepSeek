export type Operation = {
    kind: "rename";
    /** The file holding the block. */
    path: string;
    /** The block span (1-based, inclusive). */
    startLine: number;
    endLine: number;
    /** The identifier to rename (matched whole-word). */
    oldName: string;
    /** The new identifier. */
    newName: string;
    /** The scope: the block span, or the whole file. Overrides config
     *  `propagate`. */
    scope?: "block" | "file";
} | {
    kind: "connect";
    /** The file the reference is added to. */
    fromPath: string;
    /** The file (and optional symbol) the reference points at. */
    toPath: string;
    /** The symbol to import; without it the operation inserts a
     *  reference comment, not a code import. */
    symbol?: string;
} | {
    kind: "replace";
    /** The file holding the block. */
    path: string;
    /** The block span to replace (1-based, inclusive). */
    startLine: number;
    endLine: number;
    /** The replacement text (replaces the span's lines exactly). */
    text: string;
};
