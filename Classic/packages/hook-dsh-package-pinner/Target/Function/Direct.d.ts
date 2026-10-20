import type Factory from "@playform/plugin-dsh-factory";
import type State from "../Interface/State.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
export declare const Pin: (Furnace: Factory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
