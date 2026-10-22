// Tools - the `batch_edit` defineTool (the flat schema, SCHEMA.md section
// 2.1; the tool name is the research's suggestion, pending the user's
// confirmation - RESIDUALS item 1). Flat parameters, grouped by prefix; the
// canonical output value is ONE JSON object; output.render turns it into the
// model-facing prose (Function/Present); presentationMeta carries the diffs
// for the UI's diff card (the cookbook path - no client half in v1).
//
// THE ACTIONS (the machine):
//   open    - declare the scope, insert files, return the state presentation
//   insert  - add files to an open machine (the dynamic insertion)
//   remove  - drop files from an open machine
//   commit  - run the transition table in one go (Ops.Commit)
//   state   - re-present the current state of every held file
//   close   - close the machine (halted processes settle to done-able; the
//             settle-first rule runs in Machine.Close)
import { defineTool, type ToolRunContext } from "@deepseek-ai/dsh-tools";
import type { JobsHub } from "@Interface/Events.js";
import type Output from "@Interface/Output.js";
import type { MachineRecord } from "@Interface/Process.js";
import type State from "@Interface/State.js";

import * as Machine from "./Machine.js";
import * as Ops from "./Ops.js";
import { Cells, Prose } from "./Present.js";

/** Find a machine by id: the calling agent's scope first, then every scope
 *  (the multi-agent sharing residual - the session/event fold is later
 *  work; the id lookup stays honest). */
const Find = (State: State, ID: string): { machine: MachineRecord; agent: string } | undefined => {
	for (const [Agent, Scope] of State.Machines) {
		const Found = Scope.get(ID);
		if (Found !== undefined) {
			return { machine: Found, agent: Agent };
		}
	}
	return undefined;
};

/** The machine lookup that fails loud with the contract phrasing. */
const Require = (State: State, ID: string | undefined): MachineRecord => {
	if (typeof ID !== "string" || ID.length === 0) {
		throw new Error("plugin-dsh-batch-edit: machine=<id> is required for this action");
	}
	const Found = Find(State, ID);
	if (Found === undefined) {
		throw new Error(`plugin-dsh-batch-edit: unknown machine "${ID}"`);
	}
	return Found.machine;
};

/** The optional jobs hub, probed at use time (the Seam pattern). */
const JobsOf = (State: State): JobsHub | undefined =>
	(State.Context.get?.("jobs") as JobsHub | undefined) ?? undefined;

/** The state-action output: a re-presentation, with the counts derived from
 *  the cells themselves (honest numbers, not zeroes). */
const StateOutput = (Found: MachineRecord): Output => {
	const CellsList = Cells(Found);
	return {
		machine: Found.id,
		state: CellsList,
		applied: CellsList.filter((Cell) => Cell.status === "done").length,
		failed: CellsList.filter((Cell) => Cell.status === "errored").length,
		halted: CellsList.filter((Cell) => Cell.status === "halted").length,
	};
};

export default (State: State, Append: (Message: string) => void) =>
	defineTool({
		name: "batch_edit",
		description:
			"Batch edit engine: open a machine, insert files into it as PROCESSES, and run a transition table (replace / insert-after / insert-before / remove-line / append / prepend) across every held file in one go. Every write goes through the factory's write executor (the fresh-stat version guard, the governed path exactly once); a held file touched externally HALTS its process (resume with action=commit); the atomic gate means the batch completes or the batch does not exist. Open declares the scope and validates your prepared schema (searches + ops) fail-loud; misses are listed, never guessed.",
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ["open", "insert", "remove", "commit", "state", "close"],
				description:
					"The machine action: open declares the scope and inserts files; insert adds files to an open machine; remove drops files; commit runs the transition table in one go; state re-presents every held file; close closes the machine.",
			},
			machine: {
				type: "string",
				description: "The machine id ('open' returns it; every other action requires it).",
			},
			files: {
				type: "array",
				items: { type: "string" },
				description:
					"The file paths (globs allowed on open/insert); the machine resolves and records each as a process. Misses are listed, never guessed.",
			},
			searches: {
				type: "array",
				items: { type: "string" },
				description:
					"Named search patterns: name=pattern (literal) or name=re:/pattern/flags (simple regex). Declared at open; ops reference them by name.",
			},
			ops: {
				type: "array",
				items: { type: "string" },
				description:
					"The transition table, one line per op: file=<selector> search=<name> op=<MODE> [with=<TEXT>] [mode=first|all|<count>] where MODE is replace | insert-after | insert-before | remove-line | append | prepend.",
			},
			opfile: {
				type: "string",
				description:
					"Optional: ops as a prepared file path (the large-batch escape hatch; the machine ingests it - no schema limit).",
			},
			preview: {
				type: "boolean",
				description:
					"Default true: commit returns the per-file diffs in the canonical value; preview=false applies without the diff payloads.",
			},
			monitors: {
				type: "array",
				items: { type: "string" },
				description:
					"Per-file check-set names (the live containers' monitor vocabulary, reused as labels in v1).",
			},
			persistent: {
				type: "boolean",
				description:
					"Default false (one-shot: the machine closes after commit); true keeps the machine open across turns.",
			},
			deadlineMs: {
				type: "number",
				description:
					"The commit's in-line deadline, capped at 120000; overflow continues as a background job with a typed jobId handle.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					machine: { type: "string", required: true },
					state: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								file: { type: "string", required: true },
								status: { type: "string", required: true },
								version: { type: "string" },
								diff: { type: "string" },
								error: { type: "string" },
								haltReason: { type: "string" },
							},
						},
						required: true,
					},
					applied: { type: "number", required: true },
					failed: { type: "number", required: true },
					halted: { type: "number", required: true },
					jobId: { type: "string" },
					misses: { type: "array", items: { type: "string" } },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: Prose(value as Output, Find(State, (value as Output).machine)?.machine),
				},
			],
			presentationMeta: (_args, value) => {
				const Output = value as Output;
				return {
					machine: Output.machine,
					files: Output.state
						.filter((Cell) => Cell.diff !== undefined)
						.map((Cell) => ({ path: Cell.file, diff: Cell.diff ?? "" })),
				};
			},
		},
		presentResult(_args, result) {
			if (result.isError) {
				return undefined;
			}
			// The diff card is built from the presentationMeta projection (the
			// same files the canonical value's diffs carry - the tool-private
			// meta is the only read-back surface the presenter gets).
			const Projection = result.meta as
				{ machine?: string; files?: { path: string; diff: string }[] } | undefined;
			if (!Projection || !Array.isArray(Projection.files) || Projection.files.length === 0) {
				return undefined;
			}
			return {
				card: "diff" as const,
				title: `Batch edit ${Projection.machine ?? ""}`,
				diffs: Projection.files.map((Cell) => ({
					path: Cell.path,
					oldText: null,
					newText: Cell.diff ?? "",
				})),
			};
		},
		async execute(args, exec: ToolRunContext) {
			if (!State.On) {
				throw new Error("plugin-dsh-batch-edit is disabled (enabled=false)");
			}
			const Agent = Machine.AgentOf(exec);
			switch (args.action) {
				case "open": {
					const Scope = State.Machines.get(Agent) ?? Machine.ScopeOf(State, Agent);
					if (Scope.size >= State.MachinesPerAgent) {
						throw new Error(
							`plugin-dsh-batch-edit: ${Scope.size} open machines reach machinesPerAgent ${State.MachinesPerAgent} - close one first`,
						);
					}
					const { cells, misses } = await Machine.Hold(State, args.files, exec.signal);
					const Searches = Machine.ParseSearches(args.searches);
					const Lines =
						args.opfile !== undefined
							? await Ingest(State, args.opfile, exec)
							: (args.ops ?? []);
					const Ops_ = Machine.ParseOps(Lines, State.OpsPerCommit);
					const ID = Machine.NextID(State);
					const Record = Machine.Open(
						State,
						ID,
						args.files?.join(", ") ?? "",
						Searches,
						Ops_,
						args.persistent === true,
						cells,
						misses,
						Append,
					);
					Scope.set(ID, Record);
					return StateOutput(Record);
				}
				case "insert": {
					const Found = Require(State, args.machine);
					if (Found.closed) {
						throw new Error(`plugin-dsh-batch-edit: machine "${Found.id}" is closed`);
					}
					const { cells, misses } = await Machine.Hold(State, args.files, exec.signal);
					Machine.Insert(Found, cells, misses, Append);
					return StateOutput(Found);
				}
				case "remove": {
					const Found = Require(State, args.machine);
					Machine.Remove(Found, args.files ?? [], Append);
					return StateOutput(Found);
				}
				case "commit": {
					const Found = Require(State, args.machine);
					return Ops.Commit(
						State,
						Found,
						{
							preview: args.preview,
							deadlineMs: args.deadlineMs,
							monitors: args.monitors,
						},
						exec,
						Append,
						JobsOf(State),
					);
				}
				case "state": {
					const Found = Require(State, args.machine);
					return StateOutput(Found);
				}
				case "close": {
					const Found = Require(State, args.machine);
					Machine.Close(Found, Append);
					const Scope = State.Machines.get(Agent);
					Scope?.delete(Found.id);
					return StateOutput(Found);
				}
				default:
					throw new Error(
						`plugin-dsh-batch-edit: unknown action "${String(args.action)}"`,
					);
			}
		},
	});

/** The opfile ingest (the [live-report] precedent): read the prepared file
 *  through the fs backend and split the lines into op lines. */
const Ingest = async (State: State, Path: string, exec: ToolRunContext): Promise<string[]> => {
	const FS = State.Context.fs as unknown as {
		resolve: (
			P: string,
			O?: { signal?: AbortSignal | undefined },
		) => Promise<{ displayPath: string }>;
		readText: (T: unknown, S?: AbortSignal) => Promise<string>;
	};
	const Target = await FS.resolve(Path, { signal: exec.signal });
	const Text = await FS.readText(Target, exec.signal);
	return Text.split("\n").filter(
		(Line) => Line.trim().length > 0 && !Line.trim().startsWith("#"),
	);
};
