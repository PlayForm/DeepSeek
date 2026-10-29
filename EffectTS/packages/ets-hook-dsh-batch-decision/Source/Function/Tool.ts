// Tool - the `batch_decision` tool (Function/Tool): the one entry point the
// user interacts with (PASS-ON-AND-INGESTER.md section 5). This file only
// BUILDS the definition (the CCR Retrieve.ts idiom); the registration call
// lives in Apply. Verbs:
//   (no args)          - list pending proposals (id, intent, targets, expiry)
//   id + approve=true  - approve by user; hand off to the ingester seam
//   id + approve=false - deny by user
// Unknown or already-decided ids log and no-op. The tool result is one
// canonical JSON object; the renderer is pure.
import type { Context } from "@deepseek-ai/cordis";
import { defineTool } from "@deepseek-ai/dsh-tools";
import Gate from "@Function/Gate.js";
import { ToIngester } from "@Function/Handoff.js";
import Inbox from "@Function/Inbox.js";
import Policy, { type PolicyOutcome } from "@Function/Policy.js";
import { Decide, ExpiredDecision, Pending } from "@Function/Proposals.js";
import type { BatchDecision } from "@Interface/Batch.js";
import type State from "@Interface/State.js";

export default (Context_: Context, State_: State, Append: (Message: string) => void) => {
	const Summarize = (Proposal: {
		id: string;
		intent: string;
		targets: { path: string }[];
		revision: number;
	}): string =>
		`${Proposal.id} intent=${Proposal.intent} targets=${Proposal.targets.length} rev=${Proposal.revision}`;

	return defineTool({
		name: "batch_decision",
		description:
			"List pending batch proposals or approve/deny one. With no arguments, lists the pending proposals (id, intent, target count, revision). With id and approve=true/false, records the user's decision; an approved batch is handed to the ingester service when one is present. The first batch of any intent class always requires this user decision; the policy can only auto-approve later, allowlisted, bounded, confident batches.",
		parameters: {
			id: { type: "string", description: "The proposal id to decide." },
			approve: {
				type: "boolean",
				description: "True to approve, false to deny. Required with id.",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					decided: { type: "boolean", required: true },
					kind: { type: "string", required: true },
					detail: { type: "string", required: true },
				},
			},
			render: (_args, value) => [{ type: "text", text: value.detail }],
		},
		async execute(args) {
			// List path (also the expired-sweep entry point). The sweep scans
			// every UNDECIDED entry - Pending() already filters expired ones
			// out of the listing, so iterating it would never touch them.
			const Undecided = [...State_.Pending.values()].filter(
				(Entry) => Entry.decided === undefined,
			);
			for (const Entry of Undecided) {
				const Expired = ExpiredDecision(State_, Entry);
				if (Expired !== undefined) {
					Decide(State_, Expired);
					Append(`decision expired ${Expired.proposal} (by policy)`);
				}
			}
			const Id = (args as { id?: unknown } | null)?.id;
			if (typeof Id !== "string" || Id.length === 0) {
				const Lines = Pending(State_).map((Entry) => Summarize(Entry.proposal));
				return {
					decided: false,
					kind: "list",
					detail: Lines.length > 0 ? Lines.join("\n") : "no pending batch proposals",
				};
			}
			const Entry = State_.Pending.get(Id);
			if (Entry === undefined) {
				return { decided: false, kind: "unknown", detail: `no proposal ${Id}` };
			}
			if (Entry.decided !== undefined) {
				return {
					decided: false,
					kind: "already-decided",
					detail: `proposal ${Id} already ${Entry.decided.outcome} (by ${Entry.decided.by})`,
				};
			}
			const Approve = (args as { approve?: unknown } | null)?.approve;
			if (typeof Approve !== "boolean") {
				return {
					decided: false,
					kind: "missing-approve",
					detail: "approve=true|false is required with id",
				};
			}
			// The policy read (advisory here, decisive in the listener): it
			// confirms the require-user path the tool exists for.
			const PolicyRead: PolicyOutcome = Policy(State_, Entry.proposal);
			void PolicyRead;
			const Decision: BatchDecision | undefined = Gate(
				State_,
				Entry.proposal,
				Approve ? "approved" : "denied",
				"user",
			);
			if (Decision === undefined) {
				return { decided: false, kind: "unknown", detail: `no proposal ${Id}` };
			}
			Append(`decision ${Decision.outcome} ${Id} (by user)`);
			// THE HANDOFF: every recorded decision goes into the inbox the
			// board consumes (approved, denied and expired alike) - the board
			// must stop showing a decided batch as pending.
			Inbox(Context_, Decision, Entry.proposal.origin, Append);
			// ... and on the bus, where the ingester's decision consumer and
			// the live view listen (the policy path already emits).
			Context_.emit?.("batch/decision", Decision);
			if (Decision.outcome === "approved") {
				const Result = await ToIngester(Context_, Decision, Entry.proposal);
				Append(
					Result === null
						? `handoff ${Id}: no ingester service present (the batch stays approved)`
						: `handoff ${Id}: applied ${Result.applied}, conflicts ${Result.conflicts}, recovery ${Result.recovery}`,
				);
				return {
					decided: true,
					kind: "approved",
					detail: `approved ${Id}; ${
						Result === null
							? "no ingester service present"
							: `applied ${Result.applied}, conflicts ${Result.conflicts}, recovery ${Result.recovery}`
					}`,
				};
			}
			return { decided: true, kind: "denied", detail: `denied ${Id}` };
		},
	});
};
