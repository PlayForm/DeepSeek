// Plant - the `live_plant` tool (CAN-2; Requirements/02 section 4; the design
// section 3.4): opens a planted board in the calling agent's per-agent state,
// enrolls the pinned members, and starts expecting reports. The I5 3.3 prune
// twin lives on live_container_set's prune verb; the lease is never
// model-chosen (the config's plant.leaseTurns is the only window source).
import { defineTool } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
import * as Board from "@Function/Board.js";
import type { Log } from "@Function/Render.js";

/** Build the tool definition (the ccr Retrieve.ts idiom). */
export default (Agent: State, Append: Log) => {
	const Text = (Args: unknown, Key: string): string | undefined => {
		if (Args === null || typeof Args !== "object" || Array.isArray(Args)) {
			return undefined;
		}
		const Value = (Args as Record<string, unknown>)[Key];
		return typeof Value === "string" ? Value : undefined;
	};
	const Number_ = (Args: unknown, Key: string): number | undefined => {
		if (Args === null || typeof Args !== "object" || Array.isArray(Args)) {
			return undefined;
		}
		const Value = (Args as Record<string, unknown>)[Key];
		return typeof Value === "number" && Number.isFinite(Value) ? Value : undefined;
	};
	const StrArray = (Args: unknown, Key: string): string[] | undefined => {
		if (Args === null || typeof Args !== "object" || Array.isArray(Args)) {
			return undefined;
		}
		const Value = (Args as Record<string, unknown>)[Key];
		return Array.isArray(Value)
			? Value.filter((Item): Item is string => typeof Item === "string")
			: undefined;
	};
	return defineTool({
		name: "live_plant",
		description:
			"Open a planted live block in this agent's conversation: a board that subagents report progress into without you awaiting them. plantType agent-board tracks member agents (expect=<n> slots, memberIds pins them); todo-fill tracks a shared todo list; aggregate folds one computed line from all members; custom renders your template; monitors tracks the members' live file monitors (the rows are the monitored files, fed by the members' monitor checks and [live-report] monitored reports). The board lives in your own section, recomputed per request, and closes when all expected members settle. A member silent for leaseTurns parent turns is declared stale; prune it with live_container_set prune=<plantId>/<agentId>.",
		parameters: {
			id: {
				type: "string",
				required: true,
				description:
					"A stable label for the board (its key; ids are per-agent so two agents may use the same id).",
			},
			plantType: {
				type: "string",
				required: true,
				description:
					'The board type: "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors".',
			},
			template: {
				type: "string",
				description:
					"For plantType custom: the rendered body; {{set:NAME}} tokens resolve from this agent's live_container_set variables.",
			},
			expectAgents: {
				type: "number",
				description:
					"How many members the board expects (default 3, max 8). Empty slots render [none] until enrolled or until closeMs drops them.",
			},
			memberIds: {
				type: "array",
				description:
					"Optional explicit agent ids to enroll; more than expectAgents overflow as [unboarded].",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					id: { type: "string", required: true },
					plantType: { type: "string", required: true },
					expect: { type: "integer", required: true },
				},
			},
			render: (_args, value) => [
				{
					type: "text",
					text: `planted ${value.id} (${value.plantType}; expect ${value.expect}) - reports land in your live section.`,
				},
			],
		},
		async execute(args, exec) {
			const Id = Text(args, "id") ?? "";
			const PlantType = Text(args, "plantType") ?? "";
			if (Id.length === 0) {
				throw new Error("invalid id: expected a non-empty string");
			}
			if (
				!["agent-board", "todo-fill", "aggregate", "custom", "monitors"].includes(PlantType)
			) {
				throw new Error(
					`invalid plantType: expected one of "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors", got ${JSON.stringify(PlantType)}`,
				);
			}
			const AgentId =
				(exec as { agent?: { id?: string } | undefined } | undefined)?.agent?.id ?? "";
			const Boards = Board.For(Agent, AgentId);
			if (Boards.size >= Agent.Plant.boardsPerAgent) {
				throw new Error(
					`planted board limit reached for this agent (limit: ${Agent.Plant.boardsPerAgent}); close or prune an existing board first`,
				);
			}
			const Expect = Math.min(8, Math.max(1, Math.round(Number_(args, "expectAgents") ?? 3)));
			const Board_ = Board.Open(
				Agent,
				AgentId,
				Id,
				PlantType as "agent-board" | "todo-fill" | "aggregate" | "custom" | "monitors",
				Expect,
				StrArray(args, "memberIds"),
				Text(args, "template"),
				Append,
			);
			return { id: Board_.id, plantType: Board_.plantType, expect: Board_.expect };
		},
	});
};
