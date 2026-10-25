import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
import { Effect, Scope } from "effect";
export declare const Envelope: {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Effect.Effect<void, never, Scope.Scope>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => Effect.Effect<number>;
};
declare const _default: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => Promise<void>;
export default _default;
