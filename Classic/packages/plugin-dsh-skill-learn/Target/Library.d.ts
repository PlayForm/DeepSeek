import { Service, type Context } from "@deepseek-ai/cordis";
import { type DigestResult } from "./Function/Digest.js";
import { type Reverted } from "./Function/Revert.js";
import { type Session } from "./Function/Trigger.js";
import type Configuration from "./Interface/Configuration.js";
import type { ConsolidationResult } from "./Interface/Consolidation.js";
import type { Curation } from "./Interface/Curation.js";
import type Message from "./Interface/Message.js";
import type { ReviewInput, ReviewResult } from "./Interface/Review.js";
import type { Trigger } from "./Interface/Trigger.js";
import Version from "./Variable/Version.js";
/** The corpus-wide counts (plan section 2, row 8). */
export interface Status {
    /** Every record the usage store holds. */
    readonly total: number;
    /** Records in the `active` state. */
    readonly active: number;
    /** Records in the `stale` state. */
    readonly stale: number;
    /** Records in the `archived` state; only `Restore` leaves it. */
    readonly archived: number;
    /** Records exempt from every transition. */
    readonly pinned: number;
    /** Records in the curator's jurisdiction, which is what `Curate` walks. */
    readonly tracked: number;
    /** When the curator last ran, or null before its first pass. */
    readonly lastRunAt: string | null;
}
/** The lifecycle answer (`Pin`, `Restore`): the verdict, its class, and one clause. */
export interface Lifecycle {
    /** Whether the lifecycle move landed. */
    readonly ok: boolean;
    /** The class the move ended in; the first five are successes. */
    readonly outcome: "pinned" | "unpinned" | "restored" | "not-tracked" | "not-archived" | "destination-exists" | "foreign-root" | "failed";
    /** One clause naming why a move was refused, or the path it wrote. */
    readonly detail: string;
}
/** One review request: the leaf's input plus the claimed run's write budget. */
export interface ReviewRequest extends ReviewInput {
    /**
     * The session the write cap counts on. Present only when the run came from
     * the idle edge through `Gate.Run`, whose session IS the cap
     * (`Function/Trigger.ts:69-91`); a direct call has no claimed run, so the
     * per-run cap is its tighter bound (plan section 6.6).
     */
    readonly session?: Session;
}
export default class SkillLearnService extends Service {
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
    /** The usage store (Function/Usage), bound to the expanded `storagePath` at construction. */
    private Usage;
    /**
     * The idle-edge gate (Function/Trigger). Its two WeakMaps ARE the per-agent
     * state this service owns - the trigger counter (`Reviewed`) and the session
     * write cap (`Spent`), both keyed by the agent object, so a resumed session
     * starts a fresh budget (plan section 14, question 2).
     */
    private Gate;
    /** The ledger sink (best-effort, never throws). */
    private Ledger;
    /** The harness context (the optional `llm`, `skills` and `workingDirectory` probes). */
    private Context;
    constructor(Context_: Context, Raw?: unknown);
    /** Apply the validated config knobs (called by the host on load/volatile). */
    Configure(Options: Partial<Configuration>): void;
    /**
     * One idle edge: the review, then the curator when its interval is due. The
     * counter, the caps and the maintenance claim are `Gate.Run`'s
     * (`Function/Trigger.ts:76-117`); this method only sequences the two halves.
     */
    Trigger(Agent_: unknown): Promise<Trigger>;
    /** One review. Never throws; every degradation is one of the twelve classes. */
    Review(Input: ReviewRequest): Promise<ReviewResult>;
    /** The deterministic lifecycle pass, and the consolidation pass when it is enabled. */
    Curate(Now?: Date): Promise<Curation>;
    /**
     * The opt-in survey pass. `consolidate: false` is the shipped posture, so the
     * leaf returns `disabled` before it ever asks for a plan
     * (`Function/Consolidate.ts:110-116`).
     */
    Consolidate(Options?: {
        readonly signal?: AbortSignal;
        readonly dryRun?: boolean;
    }): Promise<ConsolidationResult>;
    /** One observed load through the `skill` tool. A store failure ledgers and returns. */
    Record(Name: string, _Agent?: unknown): Promise<void>;
    /** One audit row back to files, fail-closed (`Function/Revert.ts:1-24`). */
    Revert(Identifier: string): Promise<Reverted>;
    /** The corpus-wide counts. Always answers; the store is quarantined before the read. */
    Status(): Status;
    /** Exempt one skill from every transition, or lift the exemption. */
    Pin(Name: string, Pinned: boolean): Promise<Lifecycle>;
    /** Put one archived skill back into the catalog and reactivate its record. */
    Restore(Name: string): Promise<Lifecycle>;
    /** The bounded digest of one derived transcript. */
    Digest(Messages: readonly Message[]): DigestResult;
    /** The byte-stable phase prompt; there is no assembly here by design. */
    Prompt(Phase: 1 | 2): string;
    /** Persist the usage store (the smoke seam). Swallows and ledgers. */
    Save(): Promise<void>;
    /**
     * The pipeline of plan section 3.1, steps 8 to 23. It runs INSIDE the claimed
     * idle phase, so it never drives the agent and never touches the live turn,
     * and it never throws: every risky read is guarded, and every exit writes the
     * report and exactly one ledger line.
     */
    private Pipeline;
    /** Write the run report and its one ledger line, and answer the result. */
    private Finish;
    /**
     * Whether the curator's interval has elapsed since its last persisted pass.
     * The clock is the store's (`Function/Usage`), never a field of this instance,
     * so a restart does not reset it.
     */
    private Due;
    /** One idle edge: the review, then the curator when its interval is due. */
    private Edge;
    /**
     * The filesystem seam (`ctx.fs`). `Context.get` answers `undefined` when the
     * provider is not mounted, so the presence check is explicit and the absence
     * is NOT a silent skip: an absent provider becomes the seam that refuses every
     * call, and the fence already has the class for a seam it cannot use - its own
     * `failed` arm, whose detail is the error's clause
     * (`Function/Write.ts:325-327`) - while every leaf that catches reports its
     * own failure class. Nothing is quietly treated as absent.
     *
     * The value that remains is the real `FileSystem`, and its seven members are
     * checked structurally from here rather than cast: `resolve`, `stat`,
     * `readText`, `listDir`, `writeText`, `editText` and `contains` all match,
     * because a branded key is still a `string`, a narrower result shape is still
     * that shape, and a method may drop its optional trailing arguments.
     */
    private Seam;
    /** The catalog (`ctx.skills`); a missing provider surfaces as a caught throw. */
    private Skills;
    /** The model service, or undefined when it is absent, which is the `no-llm` class. */
    private Llm;
    /** Where the catalog is listed from: the agent's working directory, else the corpus root. */
    private Where;
    /** The catalog index; a provider that rejects is an empty index, never a failed run. */
    private Index;
    /** One catalog lookup; a provider that rejects is a name the catalog does not resolve. */
    private Lookup;
    /** One path's text; an absent or unreadable file is null, which is the `absent` case. */
    private Body;
    /** Drop the catalog cache after a mutation, so the next read sees the new bytes. */
    private Refresh;
    /** The judge's read-only corpus view, over the evidence one run gathered. */
    private CorpusView;
}
export { Version };
