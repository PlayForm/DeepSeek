import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
import type Transform from "@Interface/Transform.js";
export default _default;
declare function _default(State: State, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform): Promise<void>;
