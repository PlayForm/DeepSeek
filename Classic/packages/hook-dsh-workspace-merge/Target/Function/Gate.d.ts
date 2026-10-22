import type { FsTarget } from "@deepseek-ai/dsh-fs";
import type Operation from "@Interface/Operation.js";
import type State from "@Interface/State.js";
export interface GatedFile {
    path: string;
    target: FsTarget;
    expected: string;
    observed: string;
    bytes: number;
    conflict: boolean;
}
export interface GateResult {
    ok: boolean;
    reason?: string;
    files: GatedFile[];
}
export default _default;
declare function _default(State: State, Operations: Operation[]): Promise<GateResult>;
