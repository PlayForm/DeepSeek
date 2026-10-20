import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
import type State from "../Interface/State.js";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number): import("effect/Effect").Effect<number, never, never>;
