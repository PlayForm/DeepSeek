import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
/**
 * The chain pass WITHOUT the update follow: the direct-path counterpart of the
 * Observe's g2 + seed + Continue sequence.
 */
export declare const Canonicalize: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
/**
 * The update stage alone: the module's Follow/Dispatch path with its own
 * in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
 * describe a pass this step does not run).
 */
export declare const Update: (State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
