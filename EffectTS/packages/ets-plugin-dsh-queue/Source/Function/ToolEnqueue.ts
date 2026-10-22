// ToolEnqueue - the `queue_enqueue` tool: the orchestrator's surface for
// queueing a task (the task as data - the spec is stored verbatim, the
// dispatcher only schedules). The definition is built once at apply (the
// registration is readonly after registration); the tool's result is one
// canonical JSON value.
import type State from "@Interface/State.js";

export default (State: State) => ({
	name: "queue_enqueue",
	description:
		"Queue a subagent task as data (no agent context consumed). The dispatcher assigns it to a freed slot in deterministic order (dependencies, then priority, then FIFO).",
	parameters: {
		type: "object",
		properties: {
			spec: { type: "string", description: "The full self-contained task prompt." },
			role: {
				type: "string",
				enum: ["explorer", "coder", "planner"],
				description:
					"The declared task type (optional; the routing infers it when omitted).",
			},
			priority: { type: "number", description: "Higher dispatches first (default 0)." },
			dependsOn: {
				type: "array",
				items: { type: "string" },
				description: "Queue ids that must complete before this task.",
			},
		},
		required: ["spec"],
	},
	exec({
		spec,
		role,
		priority,
		dependsOn,
	}: {
		spec: string;
		role?: "explorer" | "coder" | "planner";
		priority?: number;
		dependsOn?: string[];
	}) {
		try {
			if (!State.On) {
				return { ok: false, error: "queue disabled (enabled=false)" };
			}
			const Task_ = State.DshQueue?.Enqueue({ spec, role, priority, dependsOn });
			return Task_
				? { ok: true, id: Task_.id, state: Task_.state }
				: { ok: false, error: "enqueue failed" };
		} catch (Error) {
			return { ok: false, error: String(Error) };
		}
	},
});
