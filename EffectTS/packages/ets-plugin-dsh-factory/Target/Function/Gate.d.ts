import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type { Gate as Decision, State } from "@playform/ets-base-dsh";
export default _default;
declare function _default(State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
    basename: string;
    mutationToolsField?: string;
}): Decision;
