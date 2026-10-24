// Launch - the LAUNCH SEAM's second half: the `agent/pre-step` waterfall
// listener that puts the routing hint INTO the child's prompt.
//
// WHY A SECOND SEAM: `tools/pre-execute` covers the model-facing `subagent`
// tool (Function/Inject), but a child started straight through the harness
// service (`ctx.subagents.startActivation` - the queue's spawn, any host
// integration) never passes through a tool. The harness dispatches
// `agent/pre-step` for EVERY agent (payload: `{ agent, messages, turn, step,
// signal }`, decision: `{ kind: "enter", messages }`), and an untagged
// listener receives every agent's event, so this listener sees the spawned
// child at its first step and hands it the hint.
//
// THE CHILD TEST: `agent.options.subagentDepth` / `session.header.
// delegationDepth` (the harness's own depth accounting) - depth 0 is the
// main conversation, which the plugin never touches; a child is depth >= 1.
//
// THE ROUTE THE HINT REPORTS: the child's OWN effective triple
// (`agent.options.provider/model/reasoningEffort`, which the launch already
// resolved) with the task type classified from the prompt text - the hint
// states the lane the child actually runs on, never a route it is not using.
//
// IDEMPOTENCE: each delegated child receives its hint ONCE (the State's
// `Hinted` set is keyed by the exact live agent), and a prompt that already
// carries a hint (the tool path annotated it at launch) is left alone - so a
// routed prompt carries exactly one hint, at the child's first offered
// prompt.
//
// FAIL-OPEN: any error logs the byte-stable warning and returns the decision
// UNCHANGED - a hint can never block or alter a step.
import ClassifyFn from "@Function/Classify.js";
import HintFn, { PREFIX } from "@Function/Hint.js";
import type { Role } from "@Interface/Policy.js";
import type State from "@Interface/State.js";

/** One model-facing content block (the fields the hint reads). */
interface Block {
	type?: string | undefined;
	text?: string | undefined;
}

/** One step message (the harness's UserMessage, read structurally). */
interface Message {
	id?: string | undefined;
	role?: string | undefined;
	content?: readonly Block[] | undefined;
	source?: unknown;
}

/** The child agent, read structurally (no harness import). */
interface Child {
	options?:
		| {
				provider?: string | undefined;
				model?: string | undefined;
				reasoningEffort?: string | undefined;
				subagentDepth?: number | undefined;
		  }
		| undefined;
	session?: { header?: { delegationDepth?: number | null } | undefined } | undefined;
}

/** The `agent/pre-step` payload. */
interface Payload {
	agent: Child;
	messages: readonly Message[];
	turn: number;
	step: number;
	signal?: AbortSignal | undefined;
}

/** The `agent/pre-step` decision. */
type Decision =
	{ kind: "reject" } | { kind: "enter"; messages: Message[]; startsRequestSeries?: true };

/** The delegation depth of the agent (0 = the main conversation). */
const Depth = (Agent: Child): number =>
	Math.max(Agent.options?.subagentDepth ?? 0, Agent.session?.header?.delegationDepth ?? 0);

/** The text of the step's admitted messages (the inference's input). */
const Text = (Messages: readonly Message[]): string =>
	Messages.map((Message) =>
		(Message.content ?? [])
			.filter((Block_) => Block_.type === "text")
			.map((Block_) => Block_.text ?? "")
			.join(" "),
	).join(" ");

export default async (
	State: State,
	Payload_: Payload,
	Next: () => Promise<Decision>,
	Append: (Message: string) => void,
): Promise<Decision> => {
	// next() FIRST: the downstream listeners settle before any decision.
	const Downstream = await Next();
	try {
		switch (true) {
			case !State.On:
			case Downstream.kind !== "enter":
			case Depth(Payload_.agent) <= 0:
			case State.Hinted.has(Payload_.agent):
				return Downstream;
		}
		const Spec = Text(Downstream.messages) || Text(Payload_.messages);
		if (Spec.length === 0 || Spec.includes(PREFIX)) {
			return Downstream;
		}
		const TaskType: Role = ClassifyFn(Spec, State.Keywords) ?? State.DefaultRole;
		const Row = State.RoutePolicy[TaskType];
		const Options = Payload_.agent.options ?? {};
		const Route_ = {
			taskType: TaskType,
			provider: Options.provider ?? Row.provider,
			model: Options.model ?? Row.model,
			reasoningEffort: Options.reasoningEffort ?? Row.reasoningEffort,
		};
		State.Seq += 1;
		State.Hinted.add(Payload_.agent);
		Append(`hint ${TaskType} ${Route_.provider} ${Route_.model} ${Route_.reasoningEffort}`);
		return {
			...Downstream,
			messages: [
				...Downstream.messages,
				{
					id: `route-hint-${State.Seq}`,
					role: "user",
					content: [{ type: "text", text: HintFn(Route_) }],
					source: { kind: "user" },
				},
			],
		};
	} catch (Cause) {
		// Fail-open: the hint never breaks a step (the silence contract).
		try {
			State.Context?.logger?.warn(
				`plugin-dsh-route: ${String(Cause)}; the step continues unhinted`,
			);
		} catch {
			/* logger optional */
		}
		return Downstream;
	}
};
