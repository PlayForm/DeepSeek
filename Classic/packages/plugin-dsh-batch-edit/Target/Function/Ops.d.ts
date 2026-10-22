import type { ToolRunContext } from "@deepseek-ai/dsh-tools";
import type { JobsHub } from "../Interface/Events.js";
import type { FsTarget } from "../Interface/Fs.js";
import type Output from "../Interface/Output.js";
import type { MachineRecord, OpLine, ProcessCell } from "../Interface/Process.js";
import type State from "../Interface/State.js";
/** One planned file transition: everything decided before any write. */
interface Plan {
    cell: ProcessCell;
    target: FsTarget;
    before: string;
    after: string;
    changed: number;
    diff: string;
}
/** Apply one op to a content string. Returns the next content and the
 *  number of changed occurrences (0 = the designed no-op). Throws the
 *  contained "search not found" error under strict counting. */
export declare const ApplyOp: (Content: string, Needle: RegExp | string, Mode: OpLine["op"], With: string, Scope: OpLine["mode"], Strict: boolean) => {
    next: string;
    count: number;
};
/** A capped line diff between two contents: the removed/added lines as
 *  `- old` / `+ new` pairs, computed with a bounded LCS table; beyond the
 *  cap the diff degrades to a line-count summary (the honest large-batch
 *  form). */
export declare const Diff: (Before: string, After: string, Cap?: number) => string;
/** Plan one file: resolve (the fresh-version guard), read, apply every op
 *  selected for it, diff. Throws a contained message on any failure
 *  ("stale" for the version mismatch - the caller maps it to the halt). */
export declare const PlanFile: (State: State, Machine: MachineRecord, Cell: ProcessCell, Signal: AbortSignal | undefined) => Promise<Plan>;
/** The commit driver. Returns the canonical output value. */
export declare const Commit: (State: State, Machine: MachineRecord, Options: {
    preview?: boolean | undefined;
    deadlineMs?: number | undefined;
    monitors?: string[] | undefined;
}, Exec: ToolRunContext | undefined, Append: (Message: string) => void, Jobs: JobsHub | undefined) => Promise<Output>;
export {};
