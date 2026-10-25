import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
export declare const Envelope: {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Promise<number>;
};
declare const _default: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
export default _default;
