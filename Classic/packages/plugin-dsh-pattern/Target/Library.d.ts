import { Service, type Context } from "@deepseek-ai/cordis";
import type Configuration from "./Interface/Config.js";
import type { MatchResult } from "./Interface/Match.js";
import type { Outcome } from "./Interface/Outcome.js";
import type Pattern from "./Interface/Pattern.js";
export default class PatternService extends Service {
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
    /** The knobs, from the constructor defaults plus the loader's validated
     *  config; Configure applies hot overrides. */
    private Knobs;
    /** The in-memory registry (Function/Registry). */
    private Store;
    /** The ledger sink (best-effort, never throws). */
    private Ledger;
    /** The open KV domain (undefined in the JSON fallback). */
    private Handle;
    /** The store chain: the open/recovery and every mutation write, in order.
     *  Flush and Save await it, so the smokes need no sleep. */
    private Pending;
    constructor(Context: Context, Raw?: unknown);
    /** Apply the validated config knobs (called by the host on load/volatile). */
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
    /** Await the pending store work (the open/recovery and the mutation
     *  writes). The flush seam the smokes use: every assertion after a
     *  mutation is deterministic without a sleep. */
    Flush(): Promise<void>;
    /** The full snapshot flush: the KV domain when it is open (every pattern
     *  plus the meta timestamp), the JSON file in the fallback. */
    Save(): Promise<void>;
    /** Open the KV domain and recover the registry from it (the primary
     *  store). A failed open is loud and degrades to the JSON fallback. */
    private Connect;
    /** The JSON fallback's load (Function/Snapshot): a stale or unreadable
     *  file is a silent miss - the catalog stays. */
    private RestoreJson;
    /** Persist the mutated patterns on the primary store (best-effort, on the
     *  chain, so the open always lands first). The JSON fallback is written
     *  only by the explicit Save - the PoC's behaviour, unchanged. */
    private Persist;
}
