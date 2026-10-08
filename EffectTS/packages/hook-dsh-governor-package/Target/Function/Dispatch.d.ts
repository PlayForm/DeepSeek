import { Effect, Scope } from "effect";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";
export declare const Envelope: {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
export default _default;
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string): Promise<void>;
