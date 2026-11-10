import { Service, type Context } from "@deepseek-ai/cordis";
import type Config from "./Interface/Config.js";
import type Decision from "./Interface/Decision.js";
import type Proposal from "./Interface/Proposal.js";
import type Result from "./Interface/Result.js";
import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the INGESTER (@playform/plugin-dsh-ingester,
 * ctx.ingester), the apply direction of the batch flow
 * (Documentation/Plans/PASS-ON-AND-INGESTER.md section 4).
 *
 * @remarks
 *
 * Class form (the factory's precedent): `export default class Ingester extends
 * Service` with `super(Context, "ingester")`, registered immediately on
 * construction and removed with its owning fiber.
 *
 * THE SERVICE SURFACE (ctx.ingester):
 *
 * - Apply(proposal, decision) - the version-fenced apply: per target, in the
 *   proposal's order, through the governed filesystem. Returns the honest
 *   BatchResult. One apply per proposal (the claim in Function/Claim).
 * - WhenIdle() - await every in-flight apply (the flush seam the smokes use
 *   instead of sleeping).
 *
 * THE EVENT PATH (the plan's deferred trace adapter, now wired): the
 * constructor registers two bus listeners (Function/Listen) - `batch/proposed`
 * records the proposal, `batch/decision` consumes the decision and applies it
 * through the same content fence. An approved batch therefore applies with no
 * caller wiring at all, and the tool handoff path (the decision hook's
 * `Apply`) shares the same one-apply claim.
 *
 * THE ONLY-WRITER LAW: the ingester is the batch's write path - the pass-on
 * and the decision must never write. Writes go through ctx.fs (the governed
 * write path: editText with the version guard, so a stale content is
 * FS_STALE_VERSION, not a silent overwrite). The journal is written before and
 * after; the ledger line per target.
 *
 * inject: ["fs"] - the governed filesystem service is the write path; the
 * plugin registers NO fs/observed listener and never reads policy files.
 */
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
    /**
     * Apply an approved proposal, per target, in order, version-fenced (the
     * honest BatchResult; a conflict never silently overwrites; one apply per
     * proposal however many callers ask).
     */
    Apply(Proposal: Proposal, Decision: Decision): Promise<Result | null>;
    /**
     * Await every in-flight apply (the flush seam: no sleeps in the smokes, no
     * timers in the hot path).
     */
    WhenIdle(): Promise<void>;
    /**
     * The recorded proposals (the decision consumer's read).
     */
    Proposals(): Proposal[];
}
/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's names are unchanged (the
 * class form's default export with static inject/Config), and Version is a
 * standalone named export, not on the class.
 */
export { Version };
