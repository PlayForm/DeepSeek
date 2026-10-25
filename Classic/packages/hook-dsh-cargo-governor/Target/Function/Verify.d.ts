import type State from "@Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
declare const _default: (Factory: PluginFactory, State: State, Command: string, Root: string, Signal: AbortSignal) => Promise<boolean>;
export default _default;
