import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Passage from "@Interface/Passage.js";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
declare const _default: (State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Registry: Registry | null, Passage: Passage) => Promise<void>;
export default _default;
