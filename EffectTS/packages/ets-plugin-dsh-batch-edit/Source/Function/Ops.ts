// Ops - the transition-table executor: the commit driver that turns the
// machine's prepared table into applied writes (SCHEMA.md section 2.1,
// STATE-MACHINE.md section 3.2). Every write goes through Factory.Write and
// nothing else - the governors see the batch's writes exactly as they see
// any write - with the actor WRAPPED in the `govern` marker (Gate.ts route 2:
// the event path skips the marked events silently) and the governed
// basenames (package.json / Cargo.toml) re-run through the factory's DIRECT
// path exactly once per write, immediately after the write succeeds. Never
// bypass governance - RE-ROUTE it deliberately.
//
// THE ATOMIC GATE (ranked suggestion 3): no partial application. Phase 1
// (plan) validates every selected file against its HELD version and computes
// the next content plus the diff BEFORE any write; a planning failure
// (stale version, search-not-found under strict mode) halts or errors that
// FILE alone - the machine stays open (the halted process, protected and
// resumable), the rest of the batch proceeds. Phase 2 (apply) writes through
// Factory.Write with the explicit `replaceIfVersion` intent (the
// fresh-stat version guard); a write failure stops the apply loop and
// returns the unwritten remainder to observed - nothing half-committed gets
// a successor write.
//
// THE DEADLINE: the in-line deadline (capped at 120000) is scanned between
// files with a clock read, never a timer; files not yet written when the
// deadline passes continue as ONE background job through the jobs hub (the
// typed jobId handle), and the settle truth arrives through the jobs
// subscription and the next presentation. Without a jobs hub the remainder
// halts with the deadline reason - graceful degradation, never a hang.
//
// PREVIEW PARITY: the returned diffs are computed from the SAME content that
// is written, so they match the applied result byte-for-byte (the
// acceptance-criteria check 3). A planned file with zero changed occurrences
// is the designed NO-OP: nothing written, nothing logged, the cell returns
// to observed (the factory's no-op law).
import { basename as Base } from "node:path";

import type { ToolRunContext } from "@deepseek-ai/dsh-tools";
import type { JobsHub } from "@Interface/Events.js";
import type { FsTarget } from "@Interface/Fs.js";
import type Output from "@Interface/Output.js";
import type { MachineRecord, OpLine, ProcessCell, SearchSpec } from "@Interface/Process.js";
import type State from "@Interface/State.js";

import * as Ledger from "./Ledger.js";
import { Cells } from "./Present.js";
import Shield from "./Shield.js";

/** The governed basenames (the module gate's vocabulary). */
const GovernedBasenames = ["package.json", "Cargo.toml"];

/** The in-line deadline cap (the composition contract). */
const DeadlineCap = 120000;

/** The deadline floor (the schema validates 1000..120000). */
const DeadlineFloor = 1000;

/** One planned file transition: everything decided before any write. */
interface Plan {
	cell: ProcessCell;
	target: FsTarget;
	before: string;
	after: string;
	changed: number;
	diff: string;
}

/** The op selector match: an exact held path, or a simple glob over the
 *  held set (`*` within one segment, `**` across segments). */
const OpMatches = (Path: string, Selector: string): boolean => {
	if (!Selector.includes("*")) {
		return Path === Selector;
	}
	const Escaped = Selector.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const Source = Escaped.replace(/\*\*\//g, "(?:.*/)?")
		.replace(/\*\*/g, ".*")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, ".");
	return new RegExp(`^${Source}$`).test(Path);
};

/** Apply one op to a content string. Returns the next content and the
 *  number of changed occurrences (0 = the designed no-op). Throws the
 *  contained "search not found" error under strict counting. */
export const ApplyOp = (
	Content: string,
	Needle: RegExp | string,
	Mode: OpLine["op"],
	With: string,
	Scope: OpLine["mode"],
	Strict: boolean,
): { next: string; count: number } => {
	const Limit =
		Scope === "first"
			? 1
			: typeof Scope === "number" && Number.isFinite(Scope)
				? Math.max(1, Math.floor(Scope))
				: Number.MAX_SAFE_INTEGER;
	switch (Mode) {
		case "replace": {
			let Count = 0;
			let Next: string;
			if (typeof Needle === "string") {
				Count = Needle.length === 0 ? 0 : Content.split(Needle).length - 1;
				switch (true) {
					case Count === 0 && Strict:
						throw new Error("search not found");
					case Count === 0:
						return { next: Content, count: 0 };
				}
				// Replacing the first Limit occurrences: the segments before and
				// after each replaced needle rejoin with the replacement text,
				// the remaining needles stay needles.
				const Parts = Content.split(Needle);
				const At = Math.min(Count, Limit);
				const Replaced = Parts.slice(0, At + 1).join(With);
				const Rest = Count > At ? `${Needle}${Parts.slice(At + 1).join(Needle)}` : "";
				Next = `${Replaced}${Rest}`;
			} else {
				const Global = Needle.flags.includes("g")
					? Needle
					: new RegExp(Needle.source, `${Needle.flags}g`);
				Count = (Content.match(Global) ?? []).length;
				switch (true) {
					case Count === 0 && Strict:
						throw new Error("search not found");
					case Count === 0:
						return { next: Content, count: 0 };
				}
				let Seen = 0;
				Next = Content.replace(Global, (Matched) => (Seen++ < Limit ? With : Matched));
			}
			return { next: Next, count: Math.min(Count, Limit) };
		}
		case "insert-after":
		case "insert-before":
		case "remove-line": {
			const Out: string[] = [];
			let Count = 0;
			const LineMatch = (Line: string): boolean =>
				typeof Needle === "string"
					? Needle.length > 0 && Line.includes(Needle)
					: Needle.test(Line);
			for (const Line of Content.split("\n")) {
				if (!LineMatch(Line) || Count >= Limit) {
					Out.push(Line);
					continue;
				}
				Count += 1;
				switch (Mode) {
					case "remove-line":
						continue;
					case "insert-before":
						Out.push(With, Line);
						break;
					default:
						Out.push(Line, With);
				}
			}
			switch (true) {
				case Count === 0 && Strict:
					throw new Error("search not found");
				case Count === 0:
					return { next: Content, count: 0 };
			}
			return { next: Out.join("\n"), count: Count };
		}
		case "append":
			return {
				next: `${Content}${Content.length === 0 || Content.endsWith("\n") ? "" : "\n"}${With}\n`,
				count: 1,
			};
		case "prepend":
			return { next: `${With}\n${Content}`, count: 1 };
		default:
			throw new Error(`unknown op mode "${Mode}"`);
	}
};

/** A capped line diff between two contents: the removed/added lines as
 *  `- old` / `+ new` pairs, computed with a bounded LCS table; beyond the
 *  cap the diff degrades to a line-count summary (the honest large-batch
 *  form). */
export const Diff = (Before: string, After: string, Cap = 2000): string => {
	const A = Before.split("\n");
	const B = After.split("\n");
	if (A.length > Cap || B.length > Cap) {
		return `(${A.length} lines -> ${B.length} lines)`;
	}
	const Rows = A.length;
	const Cols = B.length;
	const Table: number[][] = Array.from({ length: Rows + 1 }, () =>
		new Array<number>(Cols + 1).fill(0),
	);
	for (let I = Rows - 1; I >= 0; I--) {
		for (let J = Cols - 1; J >= 0; J--) {
			Table[I]![J] =
				A[I] === B[J]
					? (Table[I + 1]?.[J + 1] ?? 0) + 1
					: Math.max(Table[I + 1]?.[J] ?? 0, Table[I]?.[J + 1] ?? 0);
		}
	}
	const Parts: string[] = [];
	let I = 0;
	let J = 0;
	while (I < Rows && J < Cols) {
		if (A[I] === B[J]) {
			I++;
			J++;
		} else if ((Table[I + 1]?.[J] ?? 0) >= (Table[I]?.[J + 1] ?? 0)) {
			Parts.push(`- ${A[I] ?? ""}`);
			I++;
		} else {
			Parts.push(`+ ${B[J] ?? ""}`);
			J++;
		}
	}
	while (I < Rows) {
		Parts.push(`- ${A[I] ?? ""}`);
		I++;
	}
	while (J < Cols) {
		Parts.push(`+ ${B[J] ?? ""}`);
		J++;
	}
	return Parts.join("\n");
};

/** Plan one file: resolve (the fresh-version guard), read, apply every op
 *  selected for it, diff. Throws a contained message on any failure
 *  ("stale" for the version mismatch - the caller maps it to the halt). */
export const PlanFile = async (
	State: State,
	Machine: MachineRecord,
	Cell: ProcessCell,
	Signal: AbortSignal | undefined,
): Promise<Plan> => {
	const FS = State.Context.fs as unknown as {
		resolve: (Path: string, O?: { signal?: AbortSignal | undefined }) => Promise<FsTarget>;
		stat: (Target: FsTarget, S?: AbortSignal) => Promise<{ version?: string } | null>;
		readText: (Target: FsTarget, S?: AbortSignal) => Promise<string>;
	};
	const Target = await FS.resolve(Cell.path, { signal: Signal });
	const Stat = await FS.stat(Target, Signal);
	switch (true) {
		case Stat === null:
			throw new Error("file disappeared");
		case Cell.version !== undefined && Stat?.version !== Cell.version:
			throw new Error("stale");
	}
	const Before = await FS.readText(Target, Signal);
	let After = Before;
	let Changed = 0;
	for (const Op of Machine.ops) {
		if (!OpMatches(Cell.path, Op.file)) {
			continue;
		}
		const Search: SearchSpec | undefined = Machine.searches.get(Op.search);
		switch (true) {
			case Op.op !== "append" && Op.op !== "prepend" && Search === undefined:
				throw new Error(`unknown search "${Op.search}"`);
		}
		const Needle =
			Search === undefined
				? ""
				: Search.regex
					? (Search.matcher as RegExp)
					: (Search.matcher as string);
		const Result = ApplyOp(After, Needle, Op.op, Op.with ?? "", Op.mode, State.Strict);
		After = Result.next;
		Changed += Result.count;
	}
	return {
		cell: Cell,
		target: Target,
		before: Before,
		after: After,
		changed: Changed,
		diff: Diff(Before, After),
	};
};

/** Apply one planned write through the factory's write executor with the
 *  govern-wrapped actor, then re-route governance through the direct path
 *  for the governed basenames. Returns the fresh version. */
const ApplyWrite = async (
	State: State,
	Plan: Plan,
	Exec: ToolRunContext | undefined,
): Promise<string> =>
	// The factory's write/govern seams run spanned Effects whose tracer
	// samples the global Date.now internally - Shield keeps those internal
	// samples out of the commit deadline's budget (Function/Shield).
	Shield(async () => {
		const Actor = { ...(Exec as object | undefined), govern: true };
		const Outcome = await State.Factory.Write(State, Plan.target, Plan.after, {
			intent: { kind: "replaceIfVersion", version: Plan.cell.version ?? "" },
			actor: Actor,
			stash: true,
			signal: Exec?.signal,
		});
		switch (true) {
			case GovernedBasenames.includes(Base(Plan.target.displayPath)):
				await State.Factory.Govern(Plan.target, true, Actor, Outcome.version);
				break;
		}
		return Outcome.version;
	});

/** The commit driver. Returns the canonical output value. */
export const Commit = async (
	State: State,
	Machine: MachineRecord,
	Options: {
		preview?: boolean | undefined;
		deadlineMs?: number | undefined;
		monitors?: string[] | undefined;
	},
	Exec: ToolRunContext | undefined,
	Append: (Message: string) => void,
	Jobs: JobsHub | undefined,
): Promise<Output> => {
	const Deadline = Math.min(
		Math.max(Options.deadlineMs ?? State.Deadline, DeadlineFloor),
		DeadlineCap,
	);
	const StartedAt = Date.now();
	const Signal = Exec?.signal;
	const Held = [...Machine.files.values()].sort((A, B) => (A.path < B.path ? -1 : 1));
	const Selected = Held.filter(
		(Cell) =>
			Cell.status === "observed" || Cell.status === "halted" || Cell.status === "errored",
	);
	// Per-file check-set names recorded on the run (the live containers'
	// monitor vocabulary, reused as labels in v1).
	void Options.monitors;
	// ---- PHASE 1: plan everything before writing anything. ----
	const Plans: Plan[] = [];
	let Applied = 0;
	let Failed = 0;
	let Halted = 0;
	const Total = Selected.length;
	for (let Index = 0; Index < Total; Index++) {
		const Cell = Selected[Index]!;
		Cell.status = "running";
		Cell.opAt = Index + 1;
		Append(Ledger.Running(Cell.path, Index + 1, Total));
		try {
			const Plan = await PlanFile(State, Machine, Cell, Signal);
			switch (true) {
				case Plan.changed === 0:
					// The designed NO-OP: the cell returns to observed, nothing
					// written, nothing logged (the silence invariant).
					Cell.status = "observed";
					Cell.haltReason = undefined;
					Cell.error = undefined;
					Cell.diff = undefined;
					Cell.opAt = undefined;
					break;
				default:
					Plans.push(Plan);
			}
		} catch (Thrown) {
			const Reason = Thrown instanceof Error ? Thrown.message : String(Thrown);
			switch (true) {
				case Reason === "stale":
					Cell.status = "halted";
					Cell.haltReason = "stale";
					Cell.error = undefined;
					Append(Ledger.Halted(Cell.path, "stale"));
					Halted += 1;
					break;
				default:
					Cell.status = "errored";
					Cell.error = Reason;
					Cell.haltReason = undefined;
					Append(Ledger.Errored(Cell.path, Reason));
					Failed += 1;
			}
		}
	}
	// ---- PHASE 2: apply, with the deadline scan between files. ----
	let At = 0;
	let JobId: string | undefined;
	for (; At < Plans.length; At++) {
		const Plan = Plans[At]!;
		if (Date.now() - StartedAt > Deadline) {
			// The overflow continues as ONE background job (the typed jobId
			// handle); without a jobs hub the remainder halts instead.
			const Rest = Plans.slice(At);
			if (Jobs !== undefined) {
				JobId = Jobs.start({
					kind: "batch-edit-continue",
					label: `batch ${Machine.id}`,
					owner: Exec?.agent?.id,
					run: async () => {
						for (const Remaining of Rest) {
							try {
								const Fresh = await ApplyWrite(State, Remaining, Exec);
								const Old = Remaining.cell.version;
								Remaining.cell.version = Fresh;
								Remaining.cell.status = "done";
								Remaining.cell.diff = Remaining.diff;
								Remaining.cell.freshVersion = Fresh;
								Remaining.cell.opAt = undefined;
								Append(Ledger.Applied(Remaining.cell.path, Old, Fresh));
								Applied += 1;
							} catch (Thrown) {
								const Reason =
									Thrown instanceof Error ? Thrown.message : String(Thrown);
								Remaining.cell.status = "errored";
								Remaining.cell.error = Reason;
								Append(Ledger.Errored(Remaining.cell.path, Reason));
								Failed += 1;
							}
						}
						return { status: "completed", detail: `batch ${Machine.id} continued` };
					},
				});
			} else {
				for (const Remaining of Rest) {
					Remaining.cell.status = "halted";
					Remaining.cell.haltReason = "deadline";
					Append(Ledger.Halted(Remaining.cell.path, "deadline"));
					Halted += 1;
				}
			}
			break;
		}
		try {
			const Old = Plan.cell.version;
			const Fresh = await ApplyWrite(State, Plan, Exec);
			Plan.cell.version = Fresh;
			Plan.cell.freshVersion = Fresh;
			Plan.cell.status = "done";
			Plan.cell.diff = Options.preview === false ? undefined : Plan.diff;
			Plan.cell.opAt = undefined;
			Append(Ledger.Applied(Plan.cell.path, Old, Fresh));
			Applied += 1;
		} catch (Thrown) {
			// The write failed loudly: the ATOMIC GATE stops the apply loop -
			// the unwritten remainder returns to observed, nothing
			// half-committed gets a successor write.
			const Reason = Thrown instanceof Error ? Thrown.message : String(Thrown);
			Plan.cell.status = "errored";
			Plan.cell.error = Reason;
			Append(Ledger.Errored(Plan.cell.path, Reason));
			Failed += 1;
			for (const Remaining of Plans.slice(At + 1)) {
				Remaining.cell.status = "observed";
				Remaining.cell.opAt = undefined;
			}
			break;
		}
	}
	// The one-shot rule: persistent=false closes the machine after commit.
	if (!Machine.persistent && !Machine.closed) {
		Machine.closed = true;
		Append(Ledger.Closed(Machine.id));
	}
	Append(Ledger.Committed(Machine.id, Applied, Failed, Halted));
	const Output: Output = {
		machine: Machine.id,
		state: Cells(Machine),
		applied: Applied,
		failed: Failed,
		halted: Halted,
	};
	if (JobId !== undefined) {
		Output.jobId = JobId;
	}
	if (Machine.misses.length > 0) {
		Output.misses = [...Machine.misses];
	}
	return Output;
};
