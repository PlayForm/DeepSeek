import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type State from "../Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
/**
 * The chain + normalization pass WITHOUT the update stage: the direct-path
 * counterpart of the Observe's g2 + seed + Continue sequence.
 */
export declare const Cargo: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
/**
 * The update stage alone: the module's Dispatch path with its own
 * in-flight/cooldown/breaker machinery (quiet g2 - the chain-pass skip lines
 * describe a pass this step does not run).
 */
export declare const Update: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
