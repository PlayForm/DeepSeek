/**
 * @module Command
 *
 * The generic `normalize-overpass` human-command handler shared by the six
 * stream flavors.
 *
 * @remarks
 *
 * A dependency-free factory leaf: the module's Function/Command is a thin
 * delegate that re-exports this handler and its service types, while the
 * module keeps its identity through `State.Module` (every composed line is
 * prefixed with it - the base never hardcodes a module name) and its
 * settings/editor seams through Function/Apply.
 *
 * Grammar (the rawInput begins after the parsed command name):
 *
 * - `files <path...>` - declined here: the file sweep is owned by the
 *   normalize-file hook (its own Function/Command), so the stream flavors
 *   return the exact decline line.
 * - `batch` - arm the one-shot step-batch overpass (the flavor's
 *   Function/StepBatch consumes it on the next batch).
 * - `results on|off` - flip `scopes.toolResults` through the settings
 *   service when present, else the config editor, else report the
 *   settings-UI path - the command never mutates State directly (config
 *   stays the single source of truth, R1 section 4b).
 * - `scopes` - report the current effective values (read-only).
 *
 * The handler returns a CommandResult (`success`/`error` with text). Pure per
 * call: the only State mutation is the one-shot `Overpass` flag.
 *
 * The State is structural: only the cells this handler reads are named
 * (Module, Scopes, Exempt, Overpass), so each flavor's own State interface
 * satisfies it without the base importing the factory's types.
 */
/**
 * The structural scope gates the handler reports (all optional).
 */
type Scopes = {
    conversation?: boolean | undefined;
    reasoning?: boolean | undefined;
    toolInput?: boolean | undefined;
    toolResults?: boolean | undefined;
    files?: boolean | undefined;
    batch?: boolean | undefined;
};
/**
 * The per-apply state cells the handler reads.
 */
type State = {
    Module: string;
    Scopes?: Scopes | undefined;
    Exempt?: string[] | undefined;
    Overpass?: boolean | undefined;
};
/**
 * The structural CommandInvocation: only the fields the handler reads.
 */
type Invocation = {
    rawInput?: unknown;
    signal?: unknown;
};
/**
 * The structural `commands` service surface the Apply registration uses.
 */
export type CommandsService = {
    register: (Definition: {
        name: string;
        description: string;
        handler: (Invocation: Invocation) => Promise<CommandResult> | CommandResult;
    }) => unknown;
};
/**
 * The structural CommandResult (success/error with text).
 */
export type CommandResult = {
    kind: "success";
    text?: string;
} | {
    kind: "error";
    text: string;
};
/**
 * Structural views of the optional config-writing services.
 */
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
