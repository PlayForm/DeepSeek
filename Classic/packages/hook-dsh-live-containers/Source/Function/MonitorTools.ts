// MonitorTools - the two monitor tool surfaces (the FILE-MONITOR design
// section 9; the Plant.ts defineTool idiom). Read-only semantics, never a
// write path: the tools enroll, list, opt out and dispatch checks - they
// never gate or deny an edit and never touch file content.
//
//   live_monitor        - enroll a path (the effective classification), the
//                         per-glob opt-out, the list of enrolled files, and
//                         the parent-into-child target agent;
//   live_monitor_check  - the deep check: the full check set once, bypassing
//                         the debounce, admission-guarded; the model reads
//                         the full ring via job_output (the job id is in the
//                         output text).
import { defineTool } from "@deepseek-ai/dsh-tools";
import * as Band from "@Function/Band.js";
import Clock from "@Function/Clock.js";
import * as Monitors from "@Function/Monitors.js";
import type { Log } from "@Function/Render.js";
import * as Storage from "@Function/Storage.js";
import * as Watchlist from "@Function/Watchlist.js";
import type State from "@Interface/State.js";

/** The caller's agent id from the exec. */
const CallerOf = (Exec: unknown): string => {
	const ID = (Exec as { agent?: { id?: unknown } | undefined } | undefined)?.agent?.id;
	return typeof ID === "string" && ID.length > 0 ? ID : "";
};

/** Build the live_monitor tool definition. */
export const Monitor = (Agent: State, Append: Log) =>
	defineTool({
		name: "live_monitor",
		description:
			"Live file monitors: enroll a file so its check status renders in your live section (recomputed per request from checks that run between turns - you never type tsc to find out). path=enroll, off=<glob> opt out, list=show enrolled files, agent=<sessionId> target another session (e.g. plant a monitor into a child's scope). Monitors add information; they never gate an edit. Your own inline checks always work.",
		parameters: {
			path: {
				type: "string",
				description:
					"Enroll this file: its effective check set (watchlist match, else the shipped catalog globs) renders a monitor band.",
			},
			off: {
				type: "string",
				description:
					"Opt out: retire every enrolled file matching this glob and stop re-enrolling it.",
			},
			list: {
				type: "boolean",
				description: "List the enrolled files with their primary outcomes.",
			},
			agent: {
				type: "string",
				description: "Target session id (default: yours).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: { type: "string", required: true },
					path: { type: "string" },
					glob: { type: "string" },
					count: { type: "integer" },
					lines: { type: "array" },
				},
			},
			render: (_args, value) => {
				const V = value as {
					action: string;
					path?: string;
					glob?: string;
					count?: number;
					lines?: string[];
				};
				switch (V.action) {
					case "enrolled":
						return [
							{
								type: "text",
								text: `monitored ${V.path} (${V.count} checks) - the band renders in the live section.`,
							},
						];
					case "off":
						return [
							{
								type: "text",
								text: `monitor off ${V.glob} - ${V.count} file(s) retired.`,
							},
						];
					default:
						return [
							{
								type: "text",
								text: (V.lines ?? []).join("\n") || "no files enrolled.",
							},
						];
				}
			},
		},
		async execute(args, exec) {
			const Read = (Key: string): string | undefined => {
				if (args === null || typeof args !== "object") {
					return undefined;
				}
				const Value = (args as Record<string, unknown>)[Key];
				return typeof Value === "string" && Value.length > 0 ? Value : undefined;
			};
			const Target = Read("agent") || CallerOf(exec);
			// The per-glob opt-out.
			const Off = Read("off");
			if (Off !== undefined) {
				const Entries = Agent.Monitors.get(Target);
				let Retired = 0;
				for (const [, Entry] of Entries ?? []) {
					if (!Watchlist.Matches(Off, Entry.path)) {
						continue;
					}
					// The closing line renders at the next assembly, then the
					// entry withdraws (the retirement path).
					Entry.closingRendered = true;
					Retired += 1;
					Append(`monitor retired ${Entry.path}`);
					Storage.Record(Agent, {
						event: "monitor-retired",
						path: Entry.path,
						agent: Entry.agentId,
						version: Entry.lastVersion ?? "",
						writer: "",
						checkSetId: "",
						ranAt: Clock(Agent),
						exit: null,
						infra: null,
						tail: "",
						provenance: "live",
					});
				}
				const Outs = Agent.MonitorOptOuts.get(Target) ?? [];
				if (!Outs.includes(Off)) {
					Outs.push(Off);
				}
				Agent.MonitorOptOuts.set(Target, Outs);
				Append(`monitor off ${Off}`);
				return { action: "off", glob: Off, count: Retired };
			}
			// The list.
			if ((args as Record<string, unknown> | null)?.["list"] === true) {
				const Entries = [...(Agent.Monitors.get(Target)?.values() ?? [])];
				const Lines = Entries.map(
					(Entry) => `${Entry.path} - ${Band.PrimaryText(Agent, Entry, Clock(Agent))}`,
				);
				return { action: "list", lines: Lines };
			}
			// The enrollment.
			const Path = Read("path");
			if (Path !== undefined) {
				const Sets = Watchlist.ExplicitSets(Agent, Path);
				Monitors.Enroll(Agent, Target, Path, Path, CallerOf(exec), Sets, "", Append);
				return { action: "enrolled", path: Path, count: Sets.length };
			}
			throw new Error("invalid arguments: expected one of path | off | list");
		},
	});

/** Build the live_monitor_check tool definition. */
export const Check = (Agent: State, Append: Log) =>
	defineTool({
		name: "live_monitor_check",
		description:
			"Deep-check a monitored file: run its full check set once, bypassing the debounce, as background jobs. The monitor band updates when they settle; read the full output of a job with job_output <job-id>. Admission-guarded: when the monitor jobs are at capacity the checks are coalesced and run at the next checkpoint.",
		parameters: {
			path: {
				type: "string",
				required: true,
				description: "The file to deep-check (enrolled if not already).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					started: { type: "boolean", required: true },
					path: { type: "string", required: true },
					count: { type: "integer", required: true },
					jobs: { type: "array" },
				},
			},
			render: (_args, value) => {
				const V = value as {
					started: boolean;
					path: string;
					count: number;
					jobs?: string[];
				};
				if (V.started) {
					return [
						{
							type: "text",
							text: `[monitor] deep check started ${V.path} (${V.count} checks) - job_output ${(V.jobs ?? []).join(", ")} for the full tail.`,
						},
					];
				}
				return [
					{
						type: "text",
						text: `[monitor] deep check pending ${V.path} (${V.count} checks) - admission full; the band updates when it runs.`,
					},
				];
			},
		},
		async execute(args, exec) {
			const Path =
				args !== null && typeof args === "object"
					? (args as Record<string, unknown>)["path"]
					: undefined;
			if (typeof Path !== "string" || Path.length === 0) {
				throw new Error("invalid path: expected a non-empty string");
			}
			const AgentID = CallerOf(exec);
			const PerAgent = Agent.Monitors.get(AgentID);
			const Existing =
				PerAgent?.get(Path) ??
				[...(PerAgent?.values() ?? [])].find((Entry) => Entry.path === Path);
			const Entry =
				Existing ??
				Monitors.Enroll(
					Agent,
					AgentID,
					Path,
					Path,
					AgentID,
					Watchlist.ExplicitSets(Agent, Path),
					"",
					Append,
				);
			// The full check set once, bypassing the debounce (fast + slow;
			// the linked sets never run - they render the linked form).
			const Started: string[] = [];
			let Pending = 0;
			for (const SetID of Entry.sets) {
				const Specification = Agent.CheckSets[SetID];
				if (Specification === undefined) {
					Append(`monitor check unknown ${SetID}`);
					continue;
				}
				if (Specification.link !== undefined) {
					continue;
				}
				if (Agent.MonitorJobs.size >= Agent.Monitor.maxMonitorJobs) {
					Entry.pending.set(SetID, { since: Clock(Agent) });
					Pending += 1;
					continue;
				}
				const JobID = await Monitors.Dispatch(
					Agent,
					AgentID,
					Entry,
					SetID,
					Specification,
					Append,
				);
				if (JobID !== undefined) {
					Started.push(JobID);
				}
			}
			if (Started.length > 0) {
				return { started: true, path: Entry.path, count: Started.length, jobs: Started };
			}
			return { started: false, path: Entry.path, count: Pending };
		},
	});
