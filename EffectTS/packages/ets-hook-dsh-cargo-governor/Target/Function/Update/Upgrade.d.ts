import type Invocation from "@Interface/Invocation.js";
import type Job from "@Interface/Job.js";
import type Policy from "@Interface/Policy.js";
import type State from "@Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
declare const _default: (Factory: PluginFactory, State: State, Binary: string, ManifestPath: string, Cwd: string, Invocation: Invocation, Chosen: Policy, Signal: AbortSignal, Sink: Job | undefined) => Promise<boolean>;
export default _default;
