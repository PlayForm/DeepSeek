import { Service, type Context } from "@deepseek-ai/cordis";
import type Config from "./Interface/Config.js";
import type Decision from "./Interface/Decision.js";
import type Proposal from "./Interface/Proposal.js";
import type Result from "./Interface/Result.js";
export default class Ingester extends Service {
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        stopOnConflict: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        stopOnConflict: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>, "plain">;
    private State;
    constructor(Context: Context, Config: Config);
    /** Apply an approved proposal, per target, in order, version-fenced
     *  (the honest BatchResult; a conflict never silently overwrites). */
    Apply(Proposal: Proposal, Decision: Decision): Promise<Result>;
}
