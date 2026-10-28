import { Service, type Context } from "@deepseek-ai/cordis";
import type Config from "./Interface/Config.js";
import type Decision from "./Interface/Decision.js";
import type Proposal from "./Interface/Proposal.js";
import type Result from "./Interface/Result.js";
import Version from "./Variable/Version.js";
export default class Ingester extends Service {
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        stopOnConflict: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        maxProposals: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        stopOnConflict: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        maxProposals: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, "plain">;
    private State;
    constructor(Context: Context, Config: Config);
    /** Apply an approved proposal, per target, in order, version-fenced
     *  (the honest BatchResult; a conflict never silently overwrites; one
     *  apply per proposal however many callers ask). */
    Apply(Proposal: Proposal, Decision: Decision): Promise<Result | null>;
    /** Await every in-flight apply (the flush seam: no sleeps in the smokes,
     *  no timers in the hot path). */
    WhenIdle(): Promise<void>;
    /** The recorded proposals (the decision consumer's read). */
    Proposals(): Proposal[];
}
export { Version };
