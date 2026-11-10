/**
 * @module Library
 *
 * The entry module of the PATTERN service (@playform/plugin-dsh-pattern), the
 * service plugin of the pattern-graph family.
 *
 * @remarks
 * PATTERN-GRAPH-PLUGIN.md section 4: "the core owns the service and the
 * storage". Loader contract: the CLASS form, mirroring the factory -
 * `export default class PatternService extends Service` with
 * `super(Context, "pattern")`, registered immediately on construction. The
 * ONLY named export is the Config schema (the loader validates it at load; also
 * attached as a static for the class-form reading) - every other module is a
 * nameless default export and each service method is a thin delegate to one
 * Function module.
 *
 * THE SERVICE SURFACE (ctx.pattern):
 *
 * - `Configure(options)` - apply validated config knobs (volatile cells)
 * - `Put(pattern)` - idempotent upsert by id (memory; Save flushes)
 * - `Get(id)` - one pattern or undefined
 * - `List()` - every pattern, sorted by id
 * - `Match(context)` - the ranked match; the EMPTY result is the abstention
 *   (below threshold or ambiguous)
 * - `Record(id, outcome)` - the confidence update + the ledger line, and the
 *   persist of the changed pattern
 * - `Decay(now?)` - the half-life sweep, and the persist of every pattern it
 *   moved
 * - `Save()` - the full snapshot flush (awaitable)
 * - `Flush()` - await the pending store work (the smoke seam)
 *
 * THE STORE (the PoC-posture fix, completion spec wave 3): the KV domain
 * (Function/Open, config `domain`, version 1) is the PRIMARY store; the JSON
 * snapshot (Function/Snapshot) is the FALLBACK, engaged ONLY when the harness
 * provides no storage facility (the probe below) or when the open fails. A
 * present facility whose open fails is LOUD: one best-effort ledger line
 * `storage open failed: <reason>`, then the JSON fallback loads. Load on open,
 * save on every mutation (Record/Decay), and the explicit Save/Flush seams. The
 * match/record/decay behaviour and every ledger string are unchanged.
 *
 * The cold start seeds the static catalog (Variable/DefaultPatterns) - the
 * registry is never empty (PATTERN-GRAPH-PLUGIN.md section 3). The store's
 * restore runs detached at construction and REPLACES the catalog only when the
 * store is valid and non-empty; a failure keeps the catalog. The KV domain
 * restores as a PER-RECORD overlay (a stored record replaces the catalog entry
 * with the same id; a catalog entry the domain never received stays), the JSON
 * fallback as a FULL snapshot (it replaces the catalog, exactly as the PoC
 * did).
 */
import { Service, type Context } from "@deepseek-ai/cordis";
import type Configuration from "./Interface/Config.js";
import type { MatchResult } from "./Interface/Match.js";
import type { Outcome } from "./Interface/Outcome.js";
import type Pattern from "./Interface/Pattern.js";
import Version from "./Variable/Version.js";
export { Version };
export default class PatternService extends Service {
    static inject: string[];
    /**
     * The loader-contract Config (validated at load; knobs via Configure).
     */
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
    /**
     * The knobs, from the constructor defaults plus the loader's validated
     * config; Configure applies hot overrides.
     */
    private Knobs;
    /**
     * The in-memory registry (Function/Registry).
     */
    private Store;
    /**
     * The ledger sink (best-effort, never throws).
     */
    private Ledger;
    /**
     * The open KV domain (undefined in the JSON fallback).
     */
    private Handle;
    /**
     * The store chain: the open/recovery and every mutation write, in order.
     * Flush and Save await it, so the smokes need no sleep.
     */
    private Pending;
    constructor(Context: Context, Raw?: unknown);
    /**
     * Apply the validated config knobs (called by the host on load/volatile).
     */
    Configure(Options: Partial<Configuration>): void;
    Put(Pattern_: Pattern): void;
    Get(Id: string): Pattern | undefined;
    List(): Pattern[];
    Match(Context_: {
        tool?: string | undefined;
        text?: string | undefined;
    }): MatchResult[];
    Record(Id: string, Outcome_: Outcome, Now?: number): void;
    Decay(Now?: number): void;
    /**
     * Await the pending store work (the open/recovery and the mutation
     * writes). The flush seam the smokes use: every assertion after a
     * mutation is deterministic without a sleep.
     */
    Flush(): Promise<void>;
    /**
     * The full snapshot flush: the KV domain when it is open (every pattern
     * plus the meta timestamp), the JSON file in the fallback.
     */
    Save(): Promise<void>;
    /**
     * Open the KV domain and recover the registry from it (the primary
     * store). A failed open is loud and degrades to the JSON fallback.
     */
    private Connect;
    /**
     * The JSON fallback's load (Function/Snapshot): a stale or unreadable
     * file is a silent miss - the catalog stays.
     */
    private RestoreJson;
    /**
     * Persist the mutated patterns on the primary store (best-effort, on the
     * chain, so the open always lands first). The JSON fallback is written
     * only by the explicit Save - the PoC's behaviour, unchanged.
     */
    private Persist;
}
