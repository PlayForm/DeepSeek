import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";
export declare const Envelope: (Factory: PluginFactory) => {
    Dispatch: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string) => import("effect/Effect").Effect<void, never, import("effect/Scope").Scope>;
    Settle: (State: State, Dir: string, Target: FsTarget, Actor: object | undefined, Code: number) => import("effect/Effect").Effect<number>;
};
export default _default;
declare function _default(Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Registry: Registry | null, PolicyPath: string): Promise<void>;
