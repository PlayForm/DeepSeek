// Process - the Process<File> typing (SCHEMA.md section 2.2, the
// Process<Halted> philosophy re-typed onto files): each inserted file IS a
// process the machine holds. The states are the live containers'
// BoardMember/MonitorEntry states re-typed; the transitions are ALL
// event-driven, no timers.
//
//   observed   the file is inserted; its version read and held in state;
//              nothing in flight
//   running    a transition is executing on it (a search, a preview, a
//              write through Factory.Write, or a monitor check)
//   halted     the transition is suspended: the deadline hit, the machine
//              paused, the file went stale (the version moved underneath),
//              or the agent was interrupted - the HALTED PROCESS, the state
//              the machine PROTECTS
//   done       the transition settled: applied + fs/observed confirmed
//              (the fresh version recorded)
//   errored    the transition failed loudly: the preview mismatch, the
//              sandbox denial, the search-not-found under strict mode
import type { FsVersion } from "./Fs.js";

export type ProcessStatus = "observed" | "running" | "halted" | "done" | "errored";

/** The halt reason vocabulary (STATE-MACHINE.md 3.3's transition halted
 *  line: stale | deadline | pause | interrupted). */
export type HaltReason = "stale" | "deadline" | "pause" | "interrupted";

/** One held file: a process cell with its LICENSE (the version stamp is the
 *  license's content; the reconciliation stamps are the renewals). */
export interface ProcessCell {
	/** The absolute display path the fs backend resolved at insert. */
	path: string;
	/** The process state. */
	status: ProcessStatus;
	/** The held version (the license stamp at insert or last reconciliation). */
	version: FsVersion | undefined;
	/** The fresh version after an applied write (the reconciliation stamp). */
	freshVersion: FsVersion | undefined;
	/** Why the process halted (set only in the halted state). */
	haltReason: HaltReason | undefined;
	/** The errored state's reason (the op's message, contained). */
	error: string | undefined;
	/** The last applied transition's diff (set on done, preview parity). */
	diff: string | undefined;
	/** The op index this process is at within the current commit (running). */
	opAt: number | undefined;
}

/** One op of the transition table: the machine grammar
 *  `file=<glob> search=<name> op=<MODE> [with=<text>] [mode=first|all|count]`
 *  parsed at open and re-validated at commit. */
export interface OpLine {
	/** The file selector: an exact held path or a glob over the held set. */
	file: string;
	/** The named search this op reads (declared in `searches`). */
	search: string;
	/** The transition mode. */
	op: "replace" | "insert-after" | "insert-before" | "remove-line" | "append" | "prepend";
	/** The replacement / inserted text (required by replace, insert-after,
	 *  insert-before, append, prepend). */
	with: string | undefined;
	/** The match scope: first occurrence, all occurrences, or a count. */
	mode: "first" | "all" | number | undefined;
}

/** One named search: `name=pattern` (literal) or `name=re:/pattern/flags`
 *  (a simple regex, v1 scope). */
export interface SearchSpec {
	name: string;
	/** The raw pattern text as the agent wrote it. */
	pattern: string;
	/** True when the pattern is a simple regex (the `re:` prefix). */
	regex: boolean;
	/** The compiled matcher (regex mode) or the literal needle. */
	matcher: RegExp | string;
}

/** A machine: the agent-prepared schema, the held processes, and the
 *  lease state (the planted-board lease semantics when persistent). */
export interface MachineRecord {
	/** The machine id (`open` returns it; the agent re-presents it). */
	id: string;
	/** The scope string the agent declared at open (the glob that seeded it
	 *  or the literal scope label). */
	scope: string;
	/** The declared searches (the named patterns). */
	searches: Map<string, SearchSpec>;
	/** The transition table (the op lines), stored at open. */
	ops: OpLine[];
	/** The held processes, keyed on the display path. */
	files: Map<string, ProcessCell>;
	/** Whether the machine stays open across turns (true = persistent lease;
	 *  false = one-shot, the machine closes after commit). */
	persistent: boolean;
	/** Set when the machine was closed (the settle-first rule). */
	closed: boolean;
	/** The insert misses listed at open/insert, never guessed. */
	misses: string[];
}
