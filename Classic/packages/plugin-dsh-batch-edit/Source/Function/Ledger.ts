// Ledger - the MODULE-OWNED ledger strings (STATE-MACHINE.md section 3.3,
// the contract): byte-stable, one log per module. The factory never owns
// these strings - every family module composes its own lines and logs them
// through Factory.Append (the ledger-string law). Each export is a pure
// composer: it takes the runtime values and returns the EXACT line the
// contract records, so the smokes can assert them byte-identically and a
// rename changes mechanics, never strings.
import type { MachineRecord } from "@Interface/Process.js";

/** `machine opened <id> (<n> files, scope=<glob>)` */
export const Opened = (Id: string, Machine: MachineRecord): string =>
	`machine opened ${Id} (${Machine.files.size} files, scope=${Machine.scope})`;

/** `inserted <file> at version <version>` */
export const Inserted = (File: string, Version: string | undefined): string =>
	`inserted ${File} at version ${Version ?? "unknown"}`;

/** `transition running <file> op=<n>/<total>` */
export const Running = (File: string, At: number, Total: number): string =>
	`transition running ${File} op=${At}/${Total}`;

/** `transition applied <file> version <old> -> <new>` */
export const Applied = (File: string, Old: string | undefined, Fresh: string): string =>
	`transition applied ${File} version ${Old ?? "unknown"} -> ${Fresh}`;

/** `transition errored <file> <reason>` */
export const Errored = (File: string, Reason: string): string =>
	`transition errored ${File} ${Reason}`;

/** `transition halted <file> <reason>` (stale | deadline | pause | interrupted) */
export const Halted = (File: string, Reason: string): string =>
	`transition halted ${File} ${Reason}`;

/** `machine committed <id> (<applied> applied, <failed> failed, <halted> halted)` */
export const Committed = (Id: string, Applied: number, Failed: number, Halted: number): string =>
	`machine committed ${Id} (${Applied} applied, ${Failed} failed, ${Halted} halted)`;

/** `machine closed <id>` */
export const Closed = (Id: string): string => `machine closed ${Id}`;

/** The removed-files line (the `remove` action; same grammar family). */
export const Removed = (File: string): string => `removed ${File}`;
