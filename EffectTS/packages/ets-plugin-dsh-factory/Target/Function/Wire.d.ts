import type { Context } from "@deepseek-ai/cordis";
import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type { State } from "@playform/ets-base-dsh";
export default _default;
declare function _default(Context: Context, _State: State, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void): void;
