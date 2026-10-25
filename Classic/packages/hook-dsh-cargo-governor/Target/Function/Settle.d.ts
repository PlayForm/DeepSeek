import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
declare const _default: (Factory: PluginFactory, State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Promise<number>;
export default _default;
