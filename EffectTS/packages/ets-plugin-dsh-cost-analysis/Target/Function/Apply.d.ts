import type { Context } from "@deepseek-ai/cordis";
import type { CommandResult } from "@playform/ets-base-dsh";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type Config from "../Interface/Config.js";
/**
 * @module Apply
 *
 * The plugin entry function: the ledger opened READ-ONLY through the
 * fiber's effect lifecycle, and THE HUMAN SURFACE (Documentation/Plans/
 * COST-TRACK-PLUGIN.md section 13).
 *
 * @remarks
 *
 * ONE command, `/cost analysis [scope]`, registered through the commands
 * service. The registry's name law allows no spaces in a command name, so
 * the plugin registers under the family's "cost" name with the "analysis"
 * verb as its first word; the registration is fail-open (the normalize-file
 * precedent): a missing or already-registered commands service skips the
 * surface and the mount continues. The plugin registers NO tool, adds NO
 * prompt section, and sends NO model-visible message - it also registers no
 * session listener at all: a conversation runs identically whether this
 * plugin is loaded or not, and the command renders its text OUTSIDE model
 * history.
 *
 * A ledger file that does not exist is a setup state and not a crash: the
 * open failure is recorded, the plugin still loads, and the command says so
 * when it is invoked.
 */
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The plugin-factory service (@playform/ets-plugin-dsh-factory).
         */
        pluginFactory: Factory;
        /**
         * The human command registry (@deepseek-ai/dsh-commands).
         */
        commands: Commands;
    }
}
/**
 * The structural command-registry surface the plugin registers through.
 */
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
