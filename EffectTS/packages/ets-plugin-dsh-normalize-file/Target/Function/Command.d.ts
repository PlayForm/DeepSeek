import type State from "@Interface/State.js";
import { type CommandResult, type ConfigEditorService, type SettingsService } from "@playform/ets-base-dsh";
export type { CommandResult, CommandsService, ConfigEditorService, SettingsService, } from "@playform/ets-base-dsh";
/** The structural CommandInvocation: only the fields the handler reads. */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
export default _default;
declare function _default(State: State, Invocation: Invocation, Settings: SettingsService | undefined, Editor: ConfigEditorService | undefined): Promise<CommandResult>;
