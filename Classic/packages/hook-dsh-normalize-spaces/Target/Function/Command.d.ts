import type State from "../Interface/State.js";
/** The structural CommandInvocation: only the fields the handler reads. */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
/** The structural `commands` service surface the Apply registration uses. */
export type CommandsService = {
    register: (Definition: {
        name: string;
        description: string;
        handler: (Invocation: Invocation) => Promise<CommandResult> | CommandResult;
    }) => unknown;
};
/** The structural CommandResult (success/error with text). */
export type CommandResult = {
    kind: "success";
    text?: string;
} | {
    kind: "error";
    text: string;
};
/** Structural views of the optional config-writing services. */
export type SettingsService = {
    describe?: () => unknown;
    update?: (ns: string, patch: object) => Promise<void> | void;
};
export type ConfigEditorService = {
    entries?: () => unknown;
    edit?: (Entry: unknown, Change: (Current: object) => object) => Promise<void> | void;
};
export default _default;
declare function _default(State: State, Invocation: Invocation, Settings: SettingsService | undefined, Editor: ConfigEditorService | undefined): Promise<CommandResult>;
