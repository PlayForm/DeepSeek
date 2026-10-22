import { Service, type Context } from "@deepseek-ai/cordis";
import type Knobs from "./Interface/Config.js";
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
    /** The knobs, defaults copied from the schema's intent; Configure applies
     *  the host's validated values. */
    private Knobs;
    /** The in-memory registry (Function/Registry). */
    private Store;
    /** The ledger sink (best-effort, never throws). */
    private Ledger;
    constructor(Context: Context);
    /** Apply the validated config knobs (called by the host on load/volatile). */
    Configure(Options: Partial<Knobs>): void;
    Put(Pattern_: Pattern): void;
    Get(Id: string): Pattern | undefined;
    List(): Pattern[];
    Match(Context_: {
        tool?: string | undefined;
        text?: string | undefined;
    }): MatchResult[];
    Record(Id: string, Outcome_: Outcome, Now?: number): void;
    Decay(Now?: number): void;
    Save(): Promise<void>;
}
