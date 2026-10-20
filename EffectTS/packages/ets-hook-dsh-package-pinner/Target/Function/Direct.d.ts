import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";
import type Factory from "@playform/ets-plugin-dsh-factory";
import type State from "../Interface/State.js";
export declare const Pin: (Furnace: Factory, State: State, Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void;
