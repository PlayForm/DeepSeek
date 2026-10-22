// Machine - the state machine and the process cells (SCHEMA.md section 2.2,
// STATE-MACHINE.md section 3): the registry of open machines, the insert /
// remove / open / close verbs, the fs/observed stale-halt observer, and the
// grammar parsers for the agent-prepared schema (searches + ops, validated
// fail-loud at open - the live containers' Apply.ts Validate precedent).
//
// THE EVENT-LOOP LAW: the fs/observed observer (OnObserved) is a SYNCHRONOUS
// cell-flipper only - no awaits, no throws, no I/O; all async work (reads,
// previews, writes) runs inside the tool's execute through Ops.ts. The
// observer flips a held cell to halted("stale") when the version token
// MOVED underneath (the file went stale BEFORE committing) and logs the
// contract line only on an actual flip - an idle machine never logs (the
// silence invariant).
//
// THE GOVERN MARKER: the observer SKIPS every event whose actor carries the
// `govern` field (the batch's own writes through the factory's Gate.ts route
// 2) and every event the machine's own Stash idempotence gate catches - the
// machine never halts on its own reconciliations.
import { readdirSync } from "node:fs";
import { dirname as Dir, isAbsolute, resolve as ResolvePath } from "node:path";

import type { FsObservation, FsTarget, FsVersion } from "@Interface/Fs.js";
import type { MachineRecord, OpLine, ProcessCell, SearchSpec } from "@Interface/Process.js";
import type State from "@Interface/State.js";

import * as Ledger from "./Ledger.js";

/** The maximum glob expansion per pattern (the eviction-adjacent cap). */
const GlobCap = 200;

/** The agent id of an exec (the planted-board keying; "(unowned)" is the
 *  module-global fallback the counters use). */
export const AgentOf = (Exec: unknown): string => {
	const ID = (Exec as { agent?: { id?: string } } | undefined)?.agent?.id;
	return typeof ID === "string" && ID.length > 0 ? ID : "(unowned)";
};

/** The (possibly created) per-agent machine map. */
export const ScopeOf = (State: State, Agent: string): Map<string, MachineRecord> => {
	let Scope = State.Machines.get(Agent);
	if (Scope === undefined) {
		Scope = new Map();
		State.Machines.set(Agent, Scope);
	}
	return Scope;
};

/** Every machine in the registry (the observer scans all agents - the
 *  fs/observed event carries no agent id). */
export const AllMachines = (State: State): MachineRecord[] => {
	const Out: MachineRecord[] = [];
	for (const Scope of State.Machines.values()) {
		for (const Machine of Scope.values()) {
			Out.push(Machine);
		}
	}
	return Out;
};

/** One process cell in the observed state. */
const Cell = (Path: string, Version: FsVersion | undefined): ProcessCell => ({
	path: Path,
	status: "observed",
	version: Version,
	freshVersion: undefined,
	haltReason: undefined,
	error: undefined,
	diff: undefined,
	opAt: undefined,
});

/** Parse the named searches: `name=pattern` (literal) or
 *  `name=re:/pattern/flags` (a simple regex, the v1 scope). */
export const ParseSearches = (Entries: string[] | undefined): Map<string, SearchSpec> => {
	const Searches = new Map<string, SearchSpec>();
	for (const Entry of Entries ?? []) {
		const At = Entry.indexOf("=");
		if (At <= 0) {
			throw new Error(
				`plugin-dsh-batch-edit: malformed search "${Entry}" (expected name=pattern)`,
			);
		}
		const Name = Entry.slice(0, At);
		const Rest = Entry.slice(At + 1);
		const RegexMatch = /^re:\/(.*)\/([a-z]*)$/.exec(Rest);
		const Spec: SearchSpec = RegexMatch
			? {
					name: Name,
					pattern: Rest,
					regex: true,
					matcher: new RegExp(RegexMatch[1] ?? "", RegexMatch[2] ?? ""),
				}
			: { name: Name, pattern: Rest, regex: false, matcher: Rest };
		Searches.set(Name, Spec);
	}
	return Searches;
};

/** Parse one op line of the transition table: the machine grammar
 *  `file=<selector> search=<name> op=<MODE> [with=<text>] [mode=first|all|<count>]`.
 *  `with` takes the REST of the line (the replacement may contain spaces). */
export const ParseOp = (Line: string): OpLine => {
	const Fail = (Why: string): never => {
		throw new Error(`plugin-dsh-batch-edit: malformed op "${Line}" - ${Why}`);
	};
	const Op: OpLine = {
		file: "",
		search: "",
		op: "replace",
		with: undefined,
		mode: undefined,
	};
	let Rest = Line.trim();
	const Consume = (Key: string): boolean => {
		const Token = `${Key}=`;
		if (!Rest.startsWith(Token)) {
			return false;
		}
		if (Key === "with") {
			// The `with` text runs to the end of the line, EXCEPT a trailing
			// ` mode=` token (the grammar: [with=REPLACE] mode=first|all|count).
			const Body = Rest.slice(Token.length);
			const Mode = Body.lastIndexOf(" mode=");
			Op.with = Mode === -1 ? Body : Body.slice(0, Mode);
			Rest = Mode === -1 ? "" : Body.slice(Mode + 1);
			return true;
		}
		const Space = Rest.indexOf(" ");
		const Value = Space === -1 ? Rest.slice(Token.length) : Rest.slice(Token.length, Space);
		Rest = Space === -1 ? "" : Rest.slice(Space + 1);
		switch (Key) {
			case "file":
				Op.file = Value;
				break;
			case "search":
				Op.search = Value;
				break;
			case "op":
				Op.op = Value as OpLine["op"];
				break;
			case "mode":
				Op.mode = Value === "first" || Value === "all" ? Value : Number(Value);
				break;
			default:
				Fail(`unknown key ${Key}`);
		}
		return true;
	};
	if (!Consume("file")) Fail("file=<selector> is required");
	if (!Consume("search")) Fail("search=<name> is required");
	if (!Consume("op")) Fail("op=<mode> is required");
	while (Rest.length > 0) {
		const Key = Rest.slice(0, Rest.indexOf("=") === -1 ? Rest.length : Rest.indexOf("="));
		if (!Consume(Key)) Fail(`unknown key "${Key}"`);
	}
	if (
		!["replace", "insert-after", "insert-before", "remove-line", "append", "prepend"].includes(
			Op.op,
		)
	) {
		Fail(`unknown op mode "${Op.op}"`);
	}
	if (Op.file.length === 0 || Op.search.length === 0) Fail("empty file or search name");
	return Op;
};

/** Parse the whole transition table with the configured cap. */
export const ParseOps = (Lines: string[] | undefined, Cap: number): OpLine[] => {
	const Parsed = (Lines ?? []).map(ParseOp);
	if (Parsed.length > Cap) {
		throw new Error(
			`plugin-dsh-batch-edit: ${Parsed.length} ops exceed opsPerCommit ${Cap} - use the opfile path`,
		);
	}
	return Parsed;
};

/** The glob matcher: `**` crosses separators, `*` and `?` stay within one.
 *  The plain-fs walk is the factory's Discover exemption precedent (an
 *  auxiliary read-only discovery, not a governed write). */
const GlobToRegExp = (Pattern: string): RegExp => {
	const Escaped = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const Source = Escaped.replace(/\*\*\//g, "(?:.*/)?")
		.replace(/\*\*/g, ".*")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, ".");
	return new RegExp(`^${Source}$`);
};

/** Expand one pattern: an exact path returns itself (checked by the caller's
 *  resolve); a glob walks from its base directory. */
export const ExpandGlob = (Pattern: string): string[] => {
	if (!Pattern.includes("*")) {
		return [Pattern];
	}
	const Absolute = isAbsolute(Pattern) ? Pattern : ResolvePath(process.cwd(), Pattern);
	const Base =
		Absolute.indexOf("**") !== -1
			? Absolute.slice(0, Absolute.indexOf("**"))
			: Dir(Absolute.split("*")[0] ?? Absolute);
	const Root = Base.length > 0 ? Base : "/";
	const Match = GlobToRegExp(Absolute);
	let Hits: string[] = [];
	try {
		Hits = readdirSync(Root, { recursive: true, withFileTypes: false })
			.map((Entry) => `${Root.replace(/\/$/, "")}/${Entry}`)
			.filter((Path) => Match.test(Path))
			.slice(0, GlobCap);
	} catch {
		return [];
	}
	return Hits;
};

/** Resolve the file list into held process cells: an exact path resolves
 *  through the fs backend's stat (the version read); a glob expands first.
 *  Misses are LISTED, never guessed. Returns the cells and the misses. */
export const Hold = async (
	State: State,
	Patterns: string[] | undefined,
	Signal: AbortSignal | undefined,
): Promise<{ cells: ProcessCell[]; misses: string[] }> => {
	const FS = State.Context.fs as unknown as {
		resolve: (Path: string, O?: { signal?: AbortSignal | undefined }) => Promise<FsTarget>;
		stat: (Target: FsTarget, S?: AbortSignal) => Promise<{ version?: FsVersion } | null>;
	};
	const Cells: ProcessCell[] = [];
	const Misses: string[] = [];
	for (const Pattern of Patterns ?? []) {
		const Paths = ExpandGlob(Pattern);
		if (Paths.length === 0) {
			Misses.push(Pattern);
			continue;
		}
		for (const Path of Paths) {
			try {
				const Target = await FS.resolve(Path, { signal: Signal });
				const Stat = await FS.stat(Target, Signal);
				if (Stat === null || Stat.version === undefined) {
					Misses.push(Path);
					continue;
				}
				Cells.push(Cell(Target.displayPath, Stat.version));
			} catch {
				Misses.push(Path);
			}
		}
	}
	return { cells: Cells, misses: Misses };
};

/** Add already-held cells to a machine, deduplicating on path, and log the
 *  contract insertion lines. */
export const Adopt = (Machine: MachineRecord, Cells: ProcessCell[]): void => {
	for (const Item of Cells) {
		const Existing = Machine.files.get(Item.path);
		if (Existing !== undefined && Existing.status !== "done") {
			continue;
		}
		if (Existing !== undefined) {
			// done -> observed (re-inserted for a next batch).
			Existing.status = "observed";
			Existing.version = Item.version;
			Existing.diff = undefined;
			Existing.error = undefined;
			Existing.haltReason = undefined;
			continue;
		}
		Machine.files.set(Item.path, Item);
	}
};

/** Open a machine: build the record from the agent's prepared schema,
 *  validate fail-loud, adopt the cells, log the contract lines. */
export const Open = (
	_State: State,
	ID: string,
	Scope: string,
	Searches: Map<string, SearchSpec>,
	Ops: OpLine[],
	MachinePersistent: boolean,
	Cells: ProcessCell[],
	Misses: string[],
	Append: (Message: string) => void,
): MachineRecord => {
	for (const Op of Ops) {
		if (Op.op !== "append" && Op.op !== "prepend" && !Searches.has(Op.search)) {
			throw new Error(
				`plugin-dsh-batch-edit: op references an unknown search "${Op.search}" - declare it in searches`,
			);
		}
	}
	const Machine: MachineRecord = {
		id: ID,
		scope: Scope,
		searches: Searches,
		ops: Ops,
		files: new Map(),
		persistent: MachinePersistent,
		closed: false,
		misses: [...Misses],
	};
	for (const Item of Cells) {
		Machine.files.set(Item.path, Item);
	}
	Append(Ledger.Opened(ID, Machine));
	for (const Item of Machine.files.values()) {
		Append(Ledger.Inserted(Item.path, Item.version));
	}
	return Machine;
};

/** Insert into an open machine mid-life (the lease stays). */
export const Insert = (
	Machine: MachineRecord,
	Cells: ProcessCell[],
	Misses: string[],
	Append: (Message: string) => void,
): void => {
	const Before = new Set(Machine.files.keys());
	Adopt(Machine, Cells);
	Machine.misses.push(...Misses);
	for (const Item of Cells) {
		// Only the NEWLY held cells log the insertion line; a re-insertion
		// (done -> observed) is a renewal, not a new process.
		if (!Before.has(Item.path)) {
			Append(Ledger.Inserted(Item.path, Item.version));
		}
	}
};

/** Drop files from an open machine. */
export const Remove = (
	Machine: MachineRecord,
	Paths: string[],
	Append: (Message: string) => void,
): void => {
	for (const Path of Paths) {
		if (Machine.files.delete(Path)) {
			Append(Ledger.Removed(Path));
		}
	}
};

/** Close a machine: settle-first - running cells halt with the interrupted
 *  reason (nothing silently dropped), the machine is marked closed. */
export const Close = (Machine: MachineRecord, Append: (Message: string) => void): void => {
	for (const Item of Machine.files.values()) {
		if (Item.status === "running") {
			Item.status = "halted";
			Item.haltReason = "interrupted";
			Append(Ledger.Halted(Item.path, "interrupted"));
		}
	}
	Machine.closed = true;
	Append(Ledger.Closed(Machine.id));
};

/** The fs/observed observer (registered through the factory's Wire on the
 *  ROOT context): SYNCHRONOUS, side-effect-only. An external touch of a held
 *  file whose version moved flips the cell to halted("stale") and logs the
 *  contract line; our own writes (the `govern` actor marker) and our own
 *  Stash idempotence re-emits are skipped. */
export const OnObserved = (
	State: State,
	Target: FsTarget,
	Observation: FsObservation,
	Actor: object | undefined,
	Append: (Message: string) => void,
): void => {
	if (!State.On) {
		return;
	}
	if ((Actor as { govern?: unknown } | undefined)?.govern !== undefined) {
		return;
	}
	const Path = Target?.displayPath;
	if (typeof Path !== "string") {
		return;
	}
	const Version = Observation?.version;
	for (const Machine of AllMachines(State)) {
		const Item = Machine.files.get(Path);
		if (Item === undefined || Item.status === "running" || Item.status === "halted") {
			continue;
		}
		if (Version === undefined || Item.version === Version) {
			continue;
		}
		Item.status = "halted";
		Item.haltReason = "stale";
		Append(Ledger.Halted(Path, "stale"));
	}
};

/** A new machine id (`mach-<n>`; deterministic counter, never a clock). */
export const NextID = (State: State): string => {
	State.Counter += 1;
	return `mach-${State.Counter}`;
};
