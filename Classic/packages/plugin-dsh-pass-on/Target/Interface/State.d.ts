import type { Context } from "@deepseek-ai/cordis";
import type Config from "./Config.js";
import type Proposal from "./Proposal.js";
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
    /** proposal id -> proposal (the handoff record the decision reads). */
    Proposals: Map<string, Proposal>;
}
