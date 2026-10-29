// Inbox - the decision handoff into the harness agent-team inbox
// (Function/Inbox): THE HANDOFF. The board and the other consumers listen on
// the inbox channel, so a recorded decision is written there too - not only
// emitted on the bus - and the batch's state survives whichever consumer is
// mounted.
//
// THE CHANNEL: `agent.inject(message)` - the harness's model-facing context
// splice for the next pre-step, which does NOT wake the driver
// (packages/core/agent/src/runtime-types.ts:241) and commits the durable
// `agent/inbox/spliced` event the board listens on
// (packages/core/agent-loop/src/inbox.ts:227-241).
//
// THE TARGET (the decision's return address), in order:
//   1. the proposal's `origin` - the agent whose inbox carried the proposal;
//   2. the harness's initiator - the agent whose driver chain is deciding
//      (packages/core/agent/src/index.ts:297 `currentInitiator`);
//   3. the first live agent (packages/core/agent/src/index.ts:588 `list`).
// No live agent at all (a cold harness, a smoke) is an honest ledger line -
// the bus emission still carries the decision, so nothing is lost.
import { randomUUID as Identifier } from "node:crypto";

import Envelope from "@Function/Envelope.js";
import { Resolve } from "@Function/Handoff.js";
import type { BatchDecision } from "@Interface/Batch.js";

/** The slice of the harness Agent the delivery uses (structural). */
interface Agent {
	id?: string | undefined;
	inject?: (Message: unknown) => void;
}

/** The slice of the harness agent registry the resolution uses. */
interface Registry {
	get?: (Id: string) => Agent | undefined;
	list?: () => Agent[];
	currentInitiator?: () => Agent | undefined;
}

/** Resolve the decision's inbox target (origin -> initiator -> first live). */
const Target = (Registry: Registry | undefined, Origin: string | undefined): Agent | undefined => {
	switch (true) {
		case Registry === undefined:
			return undefined;
		default:
			break;
	}
	const Explicit =
		typeof Origin === "string" && Origin.length > 0 ? Registry.get?.(Origin) : undefined;
	switch (true) {
		case Explicit !== undefined:
			return Explicit;
		default: {
			const Initiator = Registry.currentInitiator?.();
			switch (true) {
				case Initiator !== undefined:
					return Initiator;
				default:
					return Registry.list?.()[0];
			}
		}
	}
};

export default (
	Context_: unknown,
	Decision: BatchDecision,
	Origin: string | undefined,
	Append: (Message: string) => void,
): void => {
	const Registry = Resolve(Context_ as never, "agents") as Registry | undefined;
	const Agent = Target(Registry, Origin);
	switch (true) {
		case typeof Agent?.inject !== "function":
			Append(`inbox ${Decision.proposal}: no live agent`);
			return;
		default: {
			Agent.inject({
				id: Identifier(),
				role: "user",
				content: [{ type: "text", text: Envelope(Decision) }],
				source: { kind: "user" },
			});
			Append(`inbox ${Decision.proposal}: delivered to ${Agent.id ?? "-"}`);
		}
	}
};
