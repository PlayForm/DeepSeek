export interface PatternRow {
    /** The RegExp source matched against the normalized command pipeline. */
    pattern: string;
    /** The regression class this row assigns. */
    class: "write" | "read" | "search" | "discovery" | "control";
    /** The dedicated tool the coaching note names. */
    tool: string;
    /** Optional per-row override of the tier-1 note body. */
    note?: string;
}
export declare const CLASS_PRIORITY: readonly ["write", "read", "search", "discovery", "control"];
export declare const DEFAULT_PATTERNS: PatternRow[];
export declare const DEFAULT_EXEMPTS: string[];
