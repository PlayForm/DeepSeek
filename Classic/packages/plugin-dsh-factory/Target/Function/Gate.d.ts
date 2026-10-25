import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
import type Decision from "@Interface/Gate.js";
import type State from "@Interface/State.js";
declare const _default: (State: State, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
    basename: string;
    mutationToolsField?: string;
}) => Decision;
export default _default;
