/**
 * @module DefaultPatterns
 *
 * The cold-start catalog of shipped patterns, seeded at construction.
 *
 * @remarks
 *
 * PATTERN-GRAPH-PLUGIN.md section 3: "the cold start is the static repo map
 * plus the family's conventions, not an empty registry". The shipped patterns
 * are the conventions any repository of this family shares; confidence 0.5,
 * not seeded by evidence. The learner's offline mining replaces these with
 * session-derived patterns at the same ids (Put is idempotent by id).
 */
declare const _default: ({
    id: string;
    intent: string;
    trigger: {
        keywords: string[];
        tool?: never;
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: true;
    updatedAt: number;
} | {
    id: string;
    intent: string;
    trigger: {
        tool: string;
        keywords: string[];
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: false;
    updatedAt: number;
} | {
    id: string;
    intent: string;
    trigger: {
        tool?: never;
        keywords: string[];
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: false;
    updatedAt: number;
})[];
export default _default;
