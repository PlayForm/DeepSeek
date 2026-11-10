import type State from "../Interface/State.js";
import { type CommandResult, type ConfigEditorService, type SettingsService } from "@playform/lib-dsh-core";
/**
 * @module Command
 *
 * The plugin-dsh-normalize-file's `normalize-overpass` handler: the FILES
 * SWEEP is the one real implementation (the six stream flavors decline that
 * scope).
 *
 * @remarks
 *
 * Every non-files branch delegates to the core's generic handler
 * (@playform/lib-dsh-core/Overpass/Command) - the grammar, the `scopes`
 * report, the `batch` one-shot arm, the `results on|off` settings/editor paths
 * and the usage line are the same machinery the other flavors run, so they are
 * not forked here.
 *
 * The files sweep (ONLY this hook implements it): the normalize-file pipeline
 * (Function/Normalize) per path, each changed file written through the ONE
 * shared write executor with its own count line, then the summary ledger line
 * `overpass: swept K file(s), normalized M char(s)`. A failing path fails the
 * command with the context prefix, like the tool does.
 *
 * The module keeps its identity through `State.Module` (the core prefixes
 * every composed line with it) and its settings/editor seams through
 * Function/Apply. The service types are re-exported because Function/Apply
 * imports them from this module (the import path stays untouched).
 */
export type { CommandResult, CommandsService, ConfigEditorService, SettingsService, } from "@playform/lib-dsh-core";
/**
 * The structural CommandInvocation: only the fields the handler reads.
 */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
export default _default;
declare function _default(State: State, Invocation: Invocation, Settings: SettingsService | undefined, Editor: ConfigEditorService | undefined): Promise<CommandResult>;
