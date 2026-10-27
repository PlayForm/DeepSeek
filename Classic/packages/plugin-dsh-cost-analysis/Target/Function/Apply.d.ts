import type { Context } from "@deepseek-ai/cordis";
import type { CommandResult } from "@playform/lib-dsh-core";
import type Factory from "@playform/plugin-dsh-factory";
import type Config from "../Interface/Config.js";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: Factory;
        /** The human command registry (@deepseek-ai/dsh-commands). */
        commands: Commands;
    }
}
/** The structural command-registry surface the plugin registers through. */
interface Commands {
    register(Definition: {
        name: string;
        description: string;
        handler: (Invocation: {
            rawInput?: unknown;
            signal?: unknown;
        }) => Promise<CommandResult> | CommandResult;
    }): unknown;
}
export default _default;
declare function _default(Context: Context, Options: Config): void;
