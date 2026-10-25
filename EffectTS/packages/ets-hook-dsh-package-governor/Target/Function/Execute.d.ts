import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
declare const _default: (State: State, Root: string, _Target: FsTarget, _Actor: object | undefined, Registry: Registry | null, PolicyPath: string, Signal: AbortSignal, Emit?: (text: string) => void) => Promise<number>;
export default _default;
