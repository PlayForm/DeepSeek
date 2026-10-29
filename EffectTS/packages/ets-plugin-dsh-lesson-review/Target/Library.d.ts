import { Service, type Context } from "@deepseek-ai/cordis";
import { type Curation } from "./Function/Curate.js";
import { type DigestResult } from "./Function/Digest.js";
import { type ParseResult } from "./Function/Parse.js";
import type Configuration from "./Interface/Config.js";
import type { Op, Proposal } from "./Interface/Proposal.js";
import type { ReviewInput, ReviewMessage, ReviewResult } from "./Interface/Review.js";
import Version from "./Variable/Version.js";
/** The nudge verdict. */
export interface Tick {
    /** Whether a review is due now. */
    due: boolean;
    /** The counter's value after this tick. */
    count: number;
}
/** One queued proposal (the pending queue's row). */
export interface Queued {
    /** Epoch ms when it was queued. */
    at: number;
    /** The operation. */
    op: Op;
}
/** The corpus-wide counts. */
export interface Status {
    total: number;
    active: number;
    stale: number;
    archived: number;
    pinned: number;
    pending: number;
}
export default class LessonService extends Service {
    static inject: string[];
    /** The loader-contract Config (validated at load; knobs via Configure). */
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, "plain">;
    /** The knobs: constructor defaults plus the loader's validated config. */
    private Knobs;
    /** The usage store (Function/Usage). */
    private Usage;
    /** The ledger sink (best-effort, never throws). */
    private Ledger;
    /** The per-agent nudge counters (the agent object is the key). */
    private Counters;
    /** The store chain: the load and every write, in order. */
    private Chain;
    /** The harness context (the optional `llm` probe). */
    private Context;
    constructor(Context_: Context, Raw?: unknown);
    /** Apply the validated config knobs (called by the host on load/volatile). */
    Configure(Options: Partial<Configuration>): void;
    /** Advance one agent's nudge counter; `due` is true on the interval. */
    Tick(Agent: unknown): Tick;
    /** Clear one agent's counter (a new session, or a manual reset). */
    Reset(Agent: unknown): void;
    /** The bounded digest of one conversation snapshot. */
    Digest(Messages: readonly ReviewMessage[]): DigestResult;
    /** The review prompt (a `promptFile` override wins over the shipped text). */
    Prompt(Focus?: string): string;
    /** The strict reply parse. */
    Parse(Reply: string): ParseResult;
    /** The deterministic acceptance rules, over the live corpus. */
    Judge(Proposal_: Proposal): import("./Interface/Proposal.js").Verdict;
    /** The live-session projection (the integration seam; never throws). */
    Snapshot(Agent: unknown): ReviewMessage[];
    /** One review. Never throws; every degradation is an outcome class. */
    Review(Input: ReviewInput): Promise<ReviewResult>;
    /** The deterministic lifecycle pass; archives move whole directories. */
    Curate(Now?: number): Promise<Curation>;
    /** The corpus-wide counts. */
    Status(): Status;
    /** Pin one entry: no transitions, no review writes. */
    Pin(Name: string): boolean;
    /** Unpin one entry. */
    Unpin(Name: string): boolean;
    /** Move one archived skill back and reactivate its record. */
    Restore(Name: string): Promise<boolean>;
    /** Archive one skill now (the manual pass, no model involved). */
    Archive(Name: string): Promise<boolean>;
    /** The queued proposals, oldest first. */
    Pending(): Queued[];
    /** Land one queued proposal by name (the acceptance seam). */
    Accept(Name: string): Promise<boolean>;
    /** Await the store chain (the smoke seam). */
    Flush(): Promise<void>;
    /** Persist the usage store on the chain. */
    Save(): Promise<void>;
    /** The judge's read-only corpus view (the store plus one directory probe). */
    private Corpus;
    /** The review route: the knobs win, then the agent's own options. */
    private Route;
    /** Queue one operation (one JSON line, appended). */
    private Enqueue;
    /** Read the pending queue (a malformed line is skipped, never fatal). */
    private ReadPending;
    /** Rewrite the pending queue (the acceptance path). */
    private WritePending;
    /** Write the run report (best-effort). */
    private Record;
    /** Finish a review that never reached the model (or failed on the way). */
    private Settle;
}
export { Version };
