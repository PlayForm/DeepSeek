/**
 * @module Patterns
 *
 * The default regression-pattern table and the default exemption list (the
 * plan's Part 2 tables, verbatim scope). The tool-coach only judges TERMINAL
 * calls (config `judgeTools`); these rows classify the COMMAND text.
 *
 * @remarks
 *
 * The boundary rule (Documentation/Skill/task-routing/SKILL.md:165-170 +
 * code-authoring/SKILL.md:25-32): the terminal runs COMMANDS; the tools handle
 * CONTENT. Any bash segment that (a) reads file content into the conversation
 * or (b) mutates file content on disk is a regression class match; everything
 * else is legitimate bash and is never counted.
 *
 * ROW ORDER MATTERS: Detect scans the rows in order (write rows first) and the
 * FIRST matching row wins for a segment; class priority across segments is
 * write > read > search > discovery > control. Discovery and control are
 * note-only classes - they are never denied, even at `enforce: "all"`.
 *
 * Every row: { pattern (RegExp source, matched against the normalized
 * pipeline), class, tool (the dedicated tool the note names), note? (optional
 * per-row override of the tier-1 note body) }. The user's `patternTable` rows
 * are APPENDED after these defaults at runtime (the plan's Detect order) and
 * may not duplicate a default pattern (fail-loud, plan §3).
 */
export interface PatternRow {
    /**
     * The RegExp source matched against the normalized command pipeline.
     */
    pattern: string;
    /**
     * The regression class this row assigns.
     */
    class: "write" | "read" | "search" | "discovery" | "control";
    /**
     * The dedicated tool the coaching note names.
     */
    tool: string;
    /**
     * Optional per-row override of the tier-1 note body.
     */
    note?: string;
}
/**
 * The CLASS priority used to pick a match when several segments of one call
 * match different classes (the tier-2 mapped-tool ordering uses the same
 * sequence: write, read, search, discovery, control).
 */
export declare const CLASS_PRIORITY: readonly ["write", "read", "search", "discovery", "control"];
/**
 * DEFAULT_PATTERNS - the regression table (plan Part 2, §2.1-§2.4).
 */
export declare const DEFAULT_PATTERNS: PatternRow[];
/**
 * DEFAULT_EXEMPTS - the legitimate-bash boundary (plan §2.6), checked AFTER
 * normalization and BEFORE the row scan / catch-all. Exemption is decided per
 * PIPELINE (a maximal run of command segments joined by `|`), anchored at the
 * pipeline's head command: an exempt head dominates the rest of the pipeline
 * (rule 5) - `git diff > patch.txt` and `pnpm build | tail -20` are exempt,
 * while a bare `echo x > tracked.md` (head not exempt) still fires.
 */
export declare const DEFAULT_EXEMPTS: string[];
