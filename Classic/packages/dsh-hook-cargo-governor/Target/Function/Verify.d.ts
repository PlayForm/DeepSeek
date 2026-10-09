import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "@Interface/State.js";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Command: string, Root: string, Signal: AbortSignal): Promise<boolean>;
