import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type { Gate as Decision, State } from "@playform/ets-base-dsh";
declare const _default: (State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
    basename: string;
    mutationToolsField?: string;
}) => Decision;
export default _default;
