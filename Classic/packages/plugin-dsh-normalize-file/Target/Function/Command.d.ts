import type State from "@Interface/State.js";
import { type CommandResult, type ConfigEditorService, type SettingsService } from "@playform/lib-dsh-core";
export type { CommandResult, CommandsService, ConfigEditorService, SettingsService, } from "@playform/lib-dsh-core";
/** The structural CommandInvocation: only the fields the handler reads. */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
export default _default;
declare function _default(State: State, Invocation: Invocation, Settings: SettingsService | undefined, Editor: ConfigEditorService | undefined): Promise<CommandResult>;
