import type { FsVersion } from "@deepseek-ai/dsh-fs";
import type Passage from "@Interface/Passage.js";
import type Registry from "@Interface/Registry.js";
import type State from "@Interface/State.js";
import type PluginFactory from "@playform/ets-plugin-dsh-factory";
declare const _default: (Factory: PluginFactory, State: State, Path: string, Dir: string, Found: string | null, Registry: Registry | null, Passage: Passage) => ((current: string | null, section: unknown, keep: string[]) => {
    next: unknown;
    count: number;
    message?: string | ((outcome: {
        version: FsVersion;
    }) => string) | undefined;
} | null);
export default _default;
