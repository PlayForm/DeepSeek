import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "../../Interface/State.js";
import type Invocation from "../../Interface/Invocation.js";
import type Policy from "../../Interface/Policy.js";
import type Job from "../../Interface/Job.js";
export default _default;
declare function _default(Factory: PluginFactory, State: State, Binary: string, ManifestPath: string, Cwd: string, Invocation: Invocation, Chosen: Policy, Signal: AbortSignal, Sink: Job | undefined): Promise<boolean>;
