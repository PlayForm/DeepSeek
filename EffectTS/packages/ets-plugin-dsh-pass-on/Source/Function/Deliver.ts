// Deliver - the inbox delivery (Function/Deliver): the prepared proposal is
// delivered into the harness agent-team inbox so the board splices it and
// the decision hook can return the decision to the same place.
//
// THE CHANNEL: `agent.inject(message)` - the harness's model-facing context
// splice for the next pre-step, which does NOT wake the driver
// (packages/core/agent/src/runtime-types.ts:241) and commits the durable
// `agent/inbox/spliced` event the board listens on
// (packages/core/agent-loop/src/inbox.ts:227-241). That is exactly the
// plan's read-only injected block: the agent reads the batch, the delivery
// never becomes the agent's own content and never starts a turn.
//
// The agent is resolved from the harness registry by the proposal's origin
// (packages/core/agent/src/index.ts:568 `AgentRegistry.get`). No live agent
// (a cold harness, a smoke) is an honest `inbox none` journal line - the bus
// emission still carries the proposal, so nothing is lost.
import { randomUUID as Identifier } from "node:crypto";

import type Batch from "../Interface/Batch.js";
import type State from "../Interface/State.js";
import Envelope from "./Envelope.js";
import Journal from "./Journal.js";

/** The slice of the harness Agent the delivery uses (structural). */
interface Agent {
	id?: string | undefined;
	inject?: (Message: unknown) => void;
}

export default (State: State, Batch: Batch): void => {
	const Holder = State.Context as unknown as { get?: (Name: string) => unknown };
	const Agents = Holder?.get?.("agents") as
		{ get?: (Id: string) => Agent | undefined } | undefined;
	const Agent = typeof Agents?.get === "function" ? Agents.get(Batch.origin ?? "") : undefined;
	switch (true) {
		case typeof Agent?.inject !== "function":
			Journal(State, Batch, "inbox none", "delivered");
			return;
		default: {
			Agent.inject({
				id: Identifier(),
				role: "user",
				content: [{ type: "text", text: Envelope(Batch) }],
				source: { kind: "user" },
			});
			Journal(State, Batch, `inbox ${Agent.id ?? Batch.origin ?? "-"}`, "delivered");
		}
	}
};
