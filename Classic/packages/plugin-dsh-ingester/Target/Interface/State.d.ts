import type { Context } from "@deepseek-ai/cordis";
import type FileSystem from "@deepseek-ai/dsh-fs";
import type Config from "./Config.js";
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
}
