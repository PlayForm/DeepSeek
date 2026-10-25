import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import type Invocation from "@Interface/Invocation.js";
import type Job from "@Interface/Job.js";
import type State from "@Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
declare const _default: (Factory: PluginFactory, State: State, Seam: SubprocessService, Binary: string, Argv: string[], Cwd: string, Invocation: Invocation, Signal: AbortSignal, Sink: Job | undefined) => Promise<boolean>;
export default _default;
