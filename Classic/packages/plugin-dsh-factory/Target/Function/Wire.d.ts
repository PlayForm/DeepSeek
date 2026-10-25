import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
declare const _default: (Context: Context, _State: State, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void) => void;
export default _default;
