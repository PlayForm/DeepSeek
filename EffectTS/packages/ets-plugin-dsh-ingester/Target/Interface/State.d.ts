import type { Context } from "@deepseek-ai/cordis";
import type FileSystem from "@deepseek-ai/dsh-fs";
import type Config from "./Config.js";
import type Proposal from "./Proposal.js";
import type Result from "./Result.js";
export default interface State {
    /** The config-derived knobs. */
    Config: Config;
    /** The loading context. */
    Context: Context;
    /** The module identity - the ledger prefix. */
    Module: string;
    /** Ledger file (one log per module). */
    Ledger: string;
    /** Ledger enabled - write the durable log file. */
    Enabled: boolean;
    /** The governed filesystem service (the only write path). */
    Fs: FileSystem | undefined;
    /** The proposals recorded from `batch/proposed`, bounded by
     *  `maxProposals` (the decision's lookup). */
    Proposals: Map<string, Proposal>;
    /** The one in-flight (or settled) apply per DECISION identity
     *  (`proposal:outcome:at`) - the claim that makes the same decision
     *  delivered twice apply exactly once. */
    Pending: Map<string, Promise<Result | null>>;
}
