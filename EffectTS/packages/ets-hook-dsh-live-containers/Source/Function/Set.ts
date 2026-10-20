// Set - the `live_container_set` tool (the template host's per-agent state
// writer; Requirements/03 section 2 + the wave-2 verbs). Mutates per-agent
// state ONLY - never the config file. The wave-2 verbs (I6 section 5):
//   accept=<sid>    - instantiate the stored, clamped configuration verbatim
//   dismiss=<sid>   - withdraw the suggestion (or the dormant block)
//   plant=<id>      - instantiate a catalog preset into the per-agent state
//   prune=<plantId>/<agentId> - drop a stale member from the board's expect
//   expect=<n>      - the plant's expected member count (with plant=)
//   <key>=<value>   - a per-agent template variable
// Unknown targets log and no-op. Any other action while a suggestion is open
// also dismisses it (the model moved on - I6 5.2).
import { defineTool } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
import { Entry } from "@Variable/Catalog.js";
import * as Board from "@Function/Board.js";
import * as Suggester from "@Function/Suggester.js";
import type { Log } from "@Function/Render.js";

/** Build the tool definition (the ccr Retrieve.ts idiom: this file only
 * BUILDS it; the registration call lives in Apply). */
export default (Agent: State, Append: Log) => {
	const ParseArgs = (Args: unknown): Record<string, string> => {
		const Result: Record<string, string> = {};
		if (Args !== null && typeof Args === "object" && !Array.isArray(Args)) {
			for (const [Key, Value] of Object.entries(Args as Record<string, unknown>)) {
				if (typeof Value === "string") {
					Result[Key] = Value;
				}
			}
		}
		return Result;
	};
	return defineTool({
		name: "live_container_set",
		description:
			"Set a per-agent variable for the live-containers template blocks, or act on a live suggestion: accept=<sid> instantiates a suggested block with its stored configuration, dismiss=<sid> withdraws a suggestion, plant=<templateId> opens a planted board (with expect=<n>), prune=<plantId>/<agentId> drops a stale board member, and <key>=<value> sets a template variable. Mutates this agent's own state only - never the config file.",
		parameters: {
			key: {
				type: "string",
				description:
					"The variable name to set (when using this tool as a variable writer). Either key+value or one action verb is required.",
			},
			value: { type: "string", description: "The value to store for key." },
			accept: {
				type: "string",
				description:
					"The suggestion id (sug-<4 hex>) to accept and instantiate with its stored configuration.",
			},
			dismiss: { type: "string", description: "The suggestion id to dismiss." },
			plant: {
				type: "string",
				description: "A catalog template id to instantiate as a planted board.",
			},
			prune: {
				type: "string",
				description: '"<plantId>/<agentId>" - drop a stale member from a planted board.',
			},
			expect: {
				type: "string",
				description:
					"The expected member count when opening a planted board (1..8, default 3).",
			},
			id: {
				type: "string",
				description: "A stable label for a planted board (required with plant=).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					set: { type: "boolean", required: true },
					kind: { type: "string", required: true },
					detail: { type: "string", required: true },
				},
			},
			render: (_args, value) => [{ type: "text", text: value.detail }],
		},
		async execute(args, exec) {
			const Parsed = ParseArgs(args as unknown);
			const AgentId =
				(exec as { agent?: { id?: string } | undefined } | undefined)?.agent?.id ?? "";
			// I6 5.2: any OTHER action while a suggestion is open also dismisses
			// it - the model moved on.
			const Supersede = (Action: string): void => {
				const PerAgent = Agent.Suggestions.get(AgentId);
				for (const [Id, Suggestion_] of PerAgent ?? []) {
					if (!Suggestion_.withdrawn && Suggestion_.renderedTurn !== undefined) {
						Suggester.Dismiss(Agent, AgentId, Id, "superseded", Append);
						void Action;
					}
				}
			};
			if (typeof Parsed["accept"] === "string") {
				const Line = Suggester.Accept(Agent, AgentId, Parsed["accept"], Append);
				Append(Line);
				return { set: !Line.startsWith("accept failed"), kind: "accept", detail: Line };
			}
			if (typeof Parsed["dismiss"] === "string") {
				const Line = Suggester.Dismiss(
					Agent,
					AgentId,
					Parsed["dismiss"],
					undefined,
					Append,
				);
				return { set: true, kind: "dismiss", detail: Line };
			}
			if (typeof Parsed["prune"] === "string") {
				const [PlantId, MemberId] = Parsed["prune"].split("/");
				const Boards = Agent.Boards.get(AgentId);
				const Board_ = PlantId === undefined ? undefined : Boards?.get(PlantId);
				if (Board_ === undefined || MemberId === undefined) {
					Append(`set unknown prune ${Parsed["prune"] ?? ""}`);
					return {
						set: false,
						kind: "prune",
						detail: `no planted board matches ${Parsed["prune"] ?? ""}`,
					};
				}
				Board_.members = Board_.members.filter((Member) => Member.agentId !== MemberId);
				Board_.lease.reporters.delete(MemberId);
				Board_.pruned += 1;
				Append(`member dropped ${Board_.id} ${MemberId} (pruned)`);
				return {
					set: true,
					kind: "prune",
					detail: `member ${MemberId} dropped from ${Board_.id}`,
				};
			}
			if (typeof Parsed["plant"] === "string") {
				const TemplateId = Parsed["plant"];
				const Catalog = Entry(TemplateId);
				if (Catalog === undefined) {
					Append(`set unknown plant ${TemplateId}`);
					return { set: false, kind: "plant", detail: `unknown template: ${TemplateId}` };
				}
				const Expect = Math.min(8, Math.max(1, Number(Parsed["expect"] ?? 3) || 3));
				const BoardId = Parsed["id"] ?? `planted-${TemplateId}`;
				const PlantType =
					Catalog.shape === "board"
						? "agent-board"
						: Catalog.shape === "list"
							? "todo-fill"
							: "custom";
				Board.Open(
					Agent,
					AgentId,
					BoardId,
					PlantType,
					Expect,
					undefined,
					undefined,
					Append,
				);
				Supersede("plant");
				return {
					set: true,
					kind: "plant",
					detail: `planted ${BoardId} (${TemplateId}; expect ${Expect})`,
				};
			}
			if (typeof Parsed["key"] === "string" && Parsed["key"].length > 0) {
				const Key = Parsed["key"];
				const Value = Parsed["value"] ?? "";
				const Vars = Agent.Variables.get(AgentId) ?? new Map<string, string>();
				Vars.set(Key, Value);
				Agent.Variables.set(AgentId, Vars);
				Append(`set ${Key}`);
				Supersede("set");
				return { set: true, kind: "set", detail: `${Key} = ${Value}` };
			}
			Append("set unknown (no key)");
			return {
				set: false,
				kind: "unknown",
				detail: "nothing to set: provide key+value or an action verb (accept/dismiss/plant/prune)",
			};
		},
	});
};
