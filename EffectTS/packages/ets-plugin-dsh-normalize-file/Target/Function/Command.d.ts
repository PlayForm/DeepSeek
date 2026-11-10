import type State from "../Interface/State.js";
import { type CommandResult, type ConfigEditorService, type SettingsService } from "@playform/ets-base-dsh";
/**
 * @module Command
 *
 * The `normalize-overpass` handler: a real files sweep plus delegation of every
 * other branch to the ETS base's generic handler.
 *
 * @remarks
 *
 * The FILES SWEEP is the one real implementation (the six stream flavors
 * decline that scope), and every non-files branch delegates to the ETS base's
 * generic handler (@playform/ets-base-dsh/Overpass/Command) - the grammar, the
 * scopes report, the batch arm, the results paths and the usage line are the
 * same machinery the other flavors run, so they are not forked here.
 *
 * The files sweep runs the normalize-file pipeline (Function/Normalize) per
 * path, writes each changed file through the ONE shared write executor with its
 * own count line, then emits the summary ledger line
 * `overpass: swept K file(s), normalized M char(s)`. A failing path fails the
 * command with the context prefix, like the tool does.
 *
 * The module keeps its identity through State.Module (the Classic identity,
 * `plugin-dsh-normalize-file`), so every user-facing string stays
 * byte-identical. The service types are re-exported because Function/Apply
 * imports them from this module (the import path stays untouched).
 */
export type { CommandResult, CommandsService, ConfigEditorService, SettingsService, } from "@playform/ets-base-dsh";
/**
 * The structural CommandInvocation: only the fields the handler reads.
 */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
export default _default;
declare function _default(State: State, Invocation: Invocation, Settings: SettingsService | undefined, Editor: ConfigEditorService | undefined): Promise<CommandResult>;
