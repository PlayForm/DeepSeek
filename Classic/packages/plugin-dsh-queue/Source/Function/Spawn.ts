// Spawn - the queue's LAUNCH: start a subagent through the HARNESS subagent
// service (the completion spec's re-spec: "use the harness subagent service,
// never a private spawn"; SUBAGENT-QUEUE-PLUGIN.md section 4.4). The
// dispatcher calls this after the seat is taken and the state flipped; the
// spec goes to the child VERBATIM (the queue never alters a task's spec) and
// the resolved route goes as the child's `agentOptions`.
//
// The probes (never injection dependencies - the queue ships disabled
// independently of the agent loop and the subagent backends):
//   ctx.subagents - the harness subagent service (startActivation)
//   ctx.agents    - the live-agent registry (currentInitiator = the exact
//                   live parent the harness identity-compares)
//
// Every refusal is ONE byte-stable ledger line and no spawn:
//   `spawn skipped <id> (no subagents service)` - the backend is absent
//   `spawn skipped <id> (no live parent)`      - no initiating agent
//   `spawn failed <id> (<error>)`              - a probe or the start threw
// and the success line is `spawned <id> -> <child>`.
//
// THE SETTLEMENT: the queue owns the task's terminal arm, so the child's own
// result settles it - `completed` when the child stopped with `completed`,
// `failed` otherwise (the honest arm: a partial or errored child is not a
// completed task). The settlement runs through the Settle callback the
// dispatcher supplies, which also pulls the next queued task into the freed
// seat (the idle-slot automation).
import type { AgentsService } from "@Interface/Agent.js";
import type State from "@Interface/State.js";
import type SubagentsService from "@Interface/Subagent.js";
import type Task from "@Interface/Task.js";

/** The settle callback: `true` = completed, `false` = failed. */
export type Settle = (Id: string, Completed: boolean) => void;

/** One contained error string (the ledger's `spawn failed` detail). */
const Reason = (Cause: unknown): string => (Cause instanceof Error ? Cause.message : String(Cause));

/** The contained settle: the queue's own terminal arm never breaks the spawn
 * (a throw here would become an unhandled rejection in the detached child
 * lifecycle). */
const Finish = (Settle: Settle | undefined, Id: string, Completed: boolean): void => {
	try {
		Settle?.(Id, Completed);
	} catch {
		/* the spawn's own containment */
	}
};

export default async (
	State: State,
	Task_: Task,
	Append: (Message: string) => void,
	Settle?: Settle,
): Promise<void> => {
	try {
		const Subagents = State.Context?.get?.("subagents") as SubagentsService | undefined;
		if (Subagents === undefined || typeof Subagents.startActivation !== "function") {
			Append(`spawn skipped ${Task_.id} (no subagents service)`);
			return;
		}
		const Agents = State.Context?.get?.("agents") as AgentsService | undefined;
		const Parent = Agents?.currentInitiator?.();
		if (Parent === undefined) {
			Append(`spawn skipped ${Task_.id} (no live parent)`);
			return;
		}
		const Controller = new AbortController();
		State.Controllers.set(Task_.id, Controller);
		const Activation = await Subagents.startActivation({
			provider: State.SpawnProvider,
			label: Task_.id,
			request: {
				// The spec VERBATIM - the one text block the child receives.
				prompt: [{ type: "text", text: Task_.spec }],
				parent: Parent,
				...(Task_.agentOptions === undefined ? {} : { agentOptions: Task_.agentOptions }),
			},
			signal: Controller.signal,
			delivery: "caller",
		});
		Task_.childId = String(Activation.childId);
		State.Factory?.Journal(State, "task spawned", Task_.id, Task_.childId);
		Append(`spawned ${Task_.id} -> ${Task_.childId}`);
		// The settlement is the child's own lifecycle, not the spawn's: it is
		// contained so a failed child can never surface as an unhandled
		// rejection, and it is NOT joined by Flush (a live child keeps its
		// own task pending, which is the truth).
		void Activation.result.then(
			(Result) => {
				State.Controllers.delete(Task_.id);
				Finish(Settle, Task_.id, Result?.stopReason === "completed");
			},
			() => {
				State.Controllers.delete(Task_.id);
				Finish(Settle, Task_.id, false);
			},
		);
	} catch (Cause) {
		State.Controllers.delete(Task_.id);
		Append(`spawn failed ${Task_.id} (${Reason(Cause)})`);
		// An honest terminal arm: a task whose launch was rejected cannot run.
		Finish(Settle, Task_.id, false);
	}
};
