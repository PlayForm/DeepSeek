import type State from "@Interface/State.js";
import type PluginFactory from "@playform/plugin-dsh-factory";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
export declare const Cargo: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
export declare const Update: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
