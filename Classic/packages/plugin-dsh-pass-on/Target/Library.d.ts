import { Service, type Context } from "@deepseek-ai/cordis";
import type Config from "./Interface/Config.js";
import type Intent from "./Interface/Intent.js";
import type Proposal from "./Interface/Proposal.js";
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
    }>>, "plain">;
    private State;
    constructor(Context: Context, Config: Config);
    /** Prepare a batch proposal from an intent (READ-ONLY: no file writes;
     *  null when empty or ambiguous). */
    Prepare(Intent: Intent): Proposal | null;
    /** Fetch a prepared proposal by id (null when unknown or expired). */
    Get(Id: string): Proposal | null;
}
