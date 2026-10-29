import { Service, type Context } from "@deepseek-ai/cordis";
import type Config from "./Interface/Config.js";
import type Intent from "./Interface/Intent.js";
import type Proposal from "./Interface/Proposal.js";
import Version from "./Variable/Version.js";
export default class PassOn extends Service {
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        root: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxPreviewBytes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        expiresSeconds: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        kinds: import("@deepseek-ai/schemastery").default<import("@deepseek-ai/cosmokit").Dict<{
            globs?: string[] | null;
            param?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
            globs: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
            param: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        }>>, string>, "defined">;
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
        root: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxTargets: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxPreviewBytes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        expiresSeconds: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        kinds: import("@deepseek-ai/schemastery").default<import("@deepseek-ai/cosmokit").Dict<{
            globs?: string[] | null;
            param?: string | null;
        } & import("@deepseek-ai/cosmokit").Dict, string>, import("@deepseek-ai/cosmokit").Dict<Schemastery.ObjectT<NoInfer<{
            globs: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
            param: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        }>>, string>, "defined">;
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
    /** Prepare a batch proposal from an intent (READ-ONLY: no file writes;
     *  null when empty or ambiguous), then publish it: the canonical contract
     *  goes on `batch/proposed` and into the harness inbox. */
    Prepare(Intent: Intent, Origin?: string): Proposal | null;
    /** Fetch a prepared proposal by id (null when unknown or expired). */
    Get(Id: string): Proposal | null;
    /** The bus emission (structural: the `batch/proposed` event is declared by
     *  the decision hook's package, which this package does not import - the
     *  self-contained rule; a context without an emitter is a silent no-op). */
    private Publish;
}
export { Version };
