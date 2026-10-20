// Catalog - the suggester-facing projection of the 14-entry template catalog
// (Requirements/03 section 3; the design's section 2.6 + I6 section 2). ONE
// source, THREE consumers: the default block table (Variable/DefaultBlocks),
// this catalog (the suggester's compressed input) and the docs' block table.
//
// I6 1.2 + R2: the compressed catalog is built AT PROCESS START and cached -
// it never changes within a process; a user-edited catalog mid-process is
// picked up only on restart (the catalog is config data, not live state).
//
// The I6 R1 token grammar is FROZEN for v1 to `expectAgents` + `steps`:
// templates whose opening variables are richer (countdown targetAt, validator
// thresholds) are NOT suggestable-configured - they fall back to the
// "section" tier's plain note even in "plant" mode.
import type { BlockSpec } from "../Interface/Execution.js";

/** One catalog entry: the block spec plus the suggester's projection fields. */
export interface CatalogEntry {
	id: string;
	kind: string;
	/** One-line use case (03 section 3). */
	use: string;
	/** The template's token names (the docs' variable list). */
	tokens: string[];
	/** Whether the kind is suggestable-configured in v1 (the frozen grammar). */
	configurable: boolean;
	/** The shape class: board-shaped (expectAgents) or list-shaped (steps). */
	shape: "board" | "list" | "none";
}

/** The 14 catalog entries in the default table's order (03 section 3). */
export const CATALOG: CatalogEntry[] = [
	{
		id: "todo-list",
		kind: "todo-list",
		use: "a shared TODO list that fills as steps finish",
		tokens: ["set:items"],
		configurable: true,
		shape: "list",
	},
	{
		id: "agent-progress-board",
		kind: "agent-progress-board",
		use: "a planted board several subagents report progress into",
		tokens: ["set:board"],
		configurable: true,
		shape: "board",
	},
	{
		id: "task-failsafe-guard",
		kind: "task-failsafe-guard",
		use: "an automatic guard line when a task exceeds its budget",
		tokens: ["set:guard"],
		configurable: false,
		shape: "none",
	},
	{
		id: "command-runner",
		kind: "command-runner",
		use: "the running-commands frame for detached background commands",
		tokens: ["liveJobs"],
		configurable: false,
		shape: "none",
	},
	{
		id: "countdown-expiry",
		kind: "countdown-expiry",
		use: "a countdown to a deadline or a goal-round budget",
		tokens: ["set:label", "set:remaining"],
		configurable: false,
		shape: "none",
	},
	{
		id: "session-stats",
		kind: "session-stats",
		use: "conversation meters (messages, turns, since last tool)",
		tokens: ["messageCount", "turnCount", "sinceLastTool"],
		configurable: false,
		shape: "none",
	},
	{
		id: "diff-summary",
		kind: "diff-summary",
		use: "a rolling touched-files summary over a long edit session",
		tokens: ["set:diff"],
		configurable: false,
		shape: "none",
	},
	{
		id: "constraint-reminder",
		kind: "constraint-reminder",
		use: "standing rules rendered at ask-time",
		tokens: ["rules"],
		configurable: false,
		shape: "none",
	},
	{
		id: "scoreboard",
		kind: "scoreboard",
		use: "progress through a scored loop (done / current / next)",
		tokens: ["set:done", "set:current", "set:next"],
		configurable: false,
		shape: "list",
	},
	{
		id: "live-manifest",
		kind: "live-manifest",
		use: "the plugin stack's own state in-conversation",
		tokens: ["cwd", "sessionId"],
		configurable: false,
		shape: "none",
	},
	{
		id: "memory-block",
		kind: "memory-block",
		use: "pinned notes re-injected every request",
		tokens: ["set:memory"],
		configurable: false,
		shape: "none",
	},
	{
		id: "validator",
		kind: "validator",
		use: "a declarative threshold guard on the conversation shape",
		tokens: ["set:verdict"],
		configurable: false,
		shape: "none",
	},
	{
		id: "environment-drift",
		kind: "environment-drift",
		use: "cwd and environment awareness",
		tokens: ["cwd"],
		configurable: false,
		shape: "none",
	},
	{
		id: "delegation-inbox",
		kind: "delegation-inbox",
		use: "the children's report inbox for review",
		tokens: ["set:reports"],
		configurable: false,
		shape: "board",
	},
];

/** The compressed catalog text the suggester prompt embeds (I6 section 2:
 * one line per template - `<id>: <one-line use>. vars: <variable list>` -
 * capped at 2000 bytes, built once). */
export const Compressed = (At: number, Max = 2000): string => {
	const Lines = CATALOG.map(
		(Entry) =>
			`${Entry.id}: ${Entry.use}. vars: ${Entry.tokens.length > 0 ? Entry.tokens.join(", ") : "(none)"}`,
	);
	const Text = Lines.join("\n");
	const Bytes = (Value: string): number => Buffer.byteLength(Value, "utf8");
	if (Bytes(Text) <= Max) {
		return Text;
	}
	const Kept: string[] = [];
	let Used = 0;
	for (const Line of Lines) {
		const Cost = Bytes(Line) + 1;
		if (Used + Cost > Max) {
			break;
		}
		Kept.push(Line);
		Used += Cost;
	}
	void At;
	return Kept.join("\n");
};

/** Whether a catalog id exists (the suggestion parser's unknown-template check). */
export const Known = (Id: string): boolean => CATALOG.some((Entry) => Entry.id === Id);

/** The catalog entry for one id (undefined when unknown). */
export const Entry = (Id: string): CatalogEntry | undefined =>
	CATALOG.find((Item) => Item.id === Id);

/** The default table's specs for one kind (the accept path instantiates from
 * the default table's template). */
export const Specs = (DefaultBlocks: BlockSpec[]): BlockSpec[] => DefaultBlocks;
