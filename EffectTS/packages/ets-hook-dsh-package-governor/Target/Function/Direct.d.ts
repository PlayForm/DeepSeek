import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "@Interface/State.js";
export declare const Canonicalize: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
export declare const Update: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
