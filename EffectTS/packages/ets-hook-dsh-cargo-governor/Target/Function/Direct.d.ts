import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
import type State from "../Interface/State.js";
export declare const Cargo: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
export declare const Update: (Factory: PluginFactory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
