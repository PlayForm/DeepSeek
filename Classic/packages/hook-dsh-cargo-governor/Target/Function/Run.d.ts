import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Job from "@Interface/Job.js";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Root: string, Target: FsTarget, _Actor: object | undefined, Registry: Registry | null, PolicyPath: string, Signal: AbortSignal, Sink: Job | undefined): Promise<number>;
