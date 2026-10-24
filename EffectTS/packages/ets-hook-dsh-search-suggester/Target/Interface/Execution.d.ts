export interface Signal {
    /** The rule id (plan R1-R13) this row implements. */
    rule: string;
    /** The regex source, compiled once at apply. */
    pattern: string;
    /** The evidence weight a match contributes. */
    weight: number;
    /** Optional extra weight source: "context" (the user text) or "loop" (the ring). */
    source?: string;
}
export interface Target {
    /** The candidate path or glob. */
    path: string;
    /** The candidate kind ("manifest", "literal", "family", ...). */
    kind: string;
    /** The prior: 1.0 canonical, 0.6 family, 0.3 fallback. */
    prior: number;
    /** The digest hint - the short literal the generated index will verify (end-phase P2). */
    digest?: string;
    /** The one reason phrase the model reads. */
    reason: string;
    /** True when the row is a long-tail family glob with a count. */
    family?: boolean;
}
export interface Intent {
    /** The intent kind (X). */
    id: string;
    /** Lower wins when two intents fire on one call. */
    priority: number;
    /** The intent's own gate (destructive: 0.85). */
    threshold: number;
    /** The rule table (plan R1-R13). */
    signals: Signal[];
    /** The ordered candidate set. */
    targets: Target[];
    /** The long-tail family globs. */
    familyGlobs: string[];
}
/** One judged call, reduced to what the classifier reads. */
export interface CallView {
    /** The tool name. */
    name: string;
    /** The classified text: the grep/glob pattern, the read file_path, or the first search-shaped bash segment. */
    text: string;
    /** The path the call names (the read file_path, the grep path/include), or "". */
    path: string;
}
/** One detection: the winning intent, the runner-up within 0.1, the evidence sum, and the context/loop bonuses. */
export interface Detection {
    /** The winning intent (highest priority among matches). */
    intent: Intent;
    /** The runner-up, folded into one note only when its k is within 0.1. */
    second?: Intent;
    /** The sum of matched signal weights (before the bias). */
    evidence: number;
    /** The context bonus (plan R12). */
    context: number;
    /** The loop bonus (plan R13). */
    loop: number;
}
/** One scored candidate (plan section 3.7). */
export interface Candidate {
    /** The candidate path or glob. */
    path: string;
    /** The candidate kind. */
    kind: string;
    /** The one reason phrase. */
    reason: string;
    /** The aggregate row's family count (family rows only). */
    count?: number;
    /** The candidate score (not the intent's k). */
    score: number;
}
/** The gate's verdict (plan section 3.1 emit / section 2.4 abstain). */
export interface Verdict {
    /** "emit" passes every gate; "suppress" is a cooled/deduped/capped would-be note; "abstain" is below threshold, ambiguous, or empty. */
    action: "emit" | "suppress" | "abstain";
    /** The abstention/suppression reason (the ledger line's middle segment). */
    reason: string;
    /** The intent's confidence k. */
    kappa: number;
    /** The ordered, capped candidate list (emit only). */
    candidates: Candidate[];
}
/** The learned knowledge file's shape (plan section 5.2, schema 1). */
export interface Knowledge {
    /** The schema version. */
    schema: number;
    /** Per intent, per candidate path: the count, the followed count, the last seen timestamp. */
    intents: Record<string, Record<string, KnowledgeRow>>;
    /** The journal (the last 2000 entries, a ring). */
    journal: KnowledgeEntry[];
    /** The durable dismissals (the `suggestion_dismiss` tool's record, pruned on read). */
    dismissals: Dismissal[];
    /** True once the offline seed ran (Function/Seed); the rows keep their own marker. */
    seed?: boolean;
    /** The epoch-seconds timestamp of the last seed run. */
    seededAt?: number;
    /** The stats counters. */
    stats: {
        emitted: number;
        followed: number;
        ignored: number;
        dismissed: number;
    };
}
/** One recorded dismissal (the plan's section 5.2 dismissals row). */
export interface Dismissal {
    /** The dismissed suggestion family (the intent id). */
    intent: string;
    /** The dismissed candidate path; absent means the whole family. */
    path?: string;
    /** The epoch-seconds expiry: at or after it the dismissal is forgotten. */
    until: number;
}
/** One learned candidate row. */
export interface KnowledgeRow {
    /** Times this candidate was in an emitted set for the intent. */
    count: number;
    /** Times the model actually touched it. */
    followed: number;
    /** The last seen timestamp (epoch seconds). */
    lastSeen: number;
    /** True when the row came from the offline seed (the online counts move on top). */
    seed?: boolean;
}
/** One journal entry. */
export interface KnowledgeEntry {
    /** The journal id ("sug-<8hex>"). */
    id: string;
    /** The intent. */
    intent: string;
    /** The judged call's id. */
    call: string;
    /** The epoch-seconds timestamp. */
    at: number;
    /** The confidence. */
    kappa: number;
    /** The emitted candidate paths. */
    candidates: string[];
    /** The outcome. */
    outcome: "followed" | "ignored" | "dismissed";
    /** The candidate the model chose (followed only). */
    followedBy?: string;
}
