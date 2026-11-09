import type { MachineRecord } from "@Interface/Process.js";
/** `machine opened <id> (<n> files, scope=<glob>)` */
export declare const Opened: (Id: string, Machine: MachineRecord) => string;
/** `inserted <file> at version <version>` */
export declare const Inserted: (File: string, Version: string | undefined) => string;
/** `transition running <file> op=<n>/<total>` */
export declare const Running: (File: string, At: number, Total: number) => string;
/** `transition applied <file> version <old> -> <new>` */
export declare const Applied: (File: string, Old: string | undefined, Fresh: string) => string;
/** `transition errored <file> <reason>` */
export declare const Errored: (File: string, Reason: string) => string;
/** `transition halted <file> <reason>` (stale | deadline | pause | interrupted) */
export declare const Halted: (File: string, Reason: string) => string;
/** `machine committed <id> (<applied> applied, <failed> failed, <halted> halted)` */
export declare const Committed: (Id: string, Applied: number, Failed: number, Halted: number) => string;
/** `machine closed <id>` */
export declare const Closed: (Id: string) => string;
/** `apply refused <id> (policy write=approve)` - the D6 policy gate's refusal
 *  (the shipped `write: approve` default): the commit never plans or writes,
 *  the machine stays open with its cells observed, and the user's approval is
 *  the existing approve binding (flip `policy.write` to auto). */
export declare const Refused: (Id: string) => string;
/** The removed-files line (the `remove` action; same grammar family). */
export declare const Removed: (File: string) => string;
