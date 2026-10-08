import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";
import type { FsTarget, FsObservation } from "@deepseek-ai/dsh-fs";
export default _default;
declare function _default(Context: Context, _State: State, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void): void;
