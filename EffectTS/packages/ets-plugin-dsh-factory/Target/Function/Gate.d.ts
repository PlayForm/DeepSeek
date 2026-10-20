import type { State as State } from "@playform/ets-base-dsh";
import type { Gate as Decision } from "@playform/ets-base-dsh";
import type { FsTarget, FsObservation } from "@deepseek-ai/dsh-fs";
export default _default;
declare function _default(State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
    basename: string;
    mutationToolsField?: string;
}): Decision;
