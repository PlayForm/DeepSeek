// Inbox - the harness inbox listener (Function/Inbox): THE SPLICE. The
// batch packages talk to each other through the harness agent-team inbox -
// the same channel the harness itself delivers agent messages on - so the
// board registers on the inbox events and projects every batch block it sees
// into its state.
//
// THE CHANNELS (verified in the harness checkout):
//   - `session/event` with `type === "agent/inbox/spliced"` - the DURABLE
//     splice the agent-loop appends
//     (packages/core/agent-loop/src/inbox.ts:227-241; the event map
//     packages/core/agent/src/types.ts:96);
//   - `agent/inbox/inserted` - the LIVE per-agent notification emitted right
//     after that commit (packages/core/agent/src/runtime-types.ts:288).
// Both fire for one inserted message, so the listener de-duplicates on the
// message id (the live emit and the durable splice are one delivery).
//
// The names are registered STRUCTURALLY (a loose `on` cast): the events are
// declared by the harness's agent/session packages, which this package does
// not depend on (the self-contained PoC rule). An ordinary message without a
// batch block is ignored - silence is the default.
import Decide from "@Function/Decide.js";
import Envelope from "@Function/Envelope.js";
import Propose from "@Function/Propose.js";
import type State from "@Interface/State.js";

/** The message shape both inbox channels carry (structurally narrowed). */
interface Message {
	id?: string | undefined;
	content?: { type?: string; text?: string }[] | undefined;
}

/** The listener signature the loose cast exposes. */
type Listen = (Name: string, Listener: (...Args: never[]) => void) => unknown;

/** The text a message carries (the batch blocks ride text parts). */
const Text = (Message: Message | undefined): string =>
	(Message?.content ?? [])
		.filter((Part) => Part?.type === "text")
		.map((Part) => Part?.text ?? "")
		.join("");

/** Project one inbox message onto the board (the one splice path). */
const Handle = (State: State, Message: Message | undefined, Origin: string): void => {
	const Body = Text(Message);
	switch (true) {
		case Body.length === 0:
			return;
		default:
			break;
	}
	const Block = Envelope(Body);
	switch (true) {
		case Block === null:
			return;
		default:
			break;
	}
	const Id = typeof Message?.id === "string" ? Message.id : "";
	switch (true) {
		case Id.length > 0 && State.Seen.includes(Id):
			// The live emit and the durable splice are the same delivery.
			return;
		default:
			break;
	}
	if (Id.length > 0) {
		State.Seen.push(Id);
		while (State.Seen.length > State.MaxProposals * 2) {
			State.Seen.shift();
		}
	}
	switch (true) {
		case Block.payload === undefined:
			State.Factory.Append(State, `${Block.kind} ${Block.id} rejected (malformed payload)`);
			return;
		default:
			break;
	}
	switch (Block.kind) {
		case "proposal":
			Propose(State, Block.payload, Origin);
			break;
		default:
			Decide(State, Block.payload);
	}
};

export default (State: State): void => {
	const On = State.Context.on as unknown as Listen;
	On(
		"session/event",
		(
			Session: { id?: string } | undefined,
			Event: { type?: string; data?: { inserted?: Message[] } } | undefined,
		) => {
			try {
				switch (true) {
					case Event?.type !== "agent/inbox/spliced":
						return;
					default:
						break;
				}
				for (const Message of Event?.data?.inserted ?? []) {
					Handle(State, Message, Session?.id ?? "");
				}
			} catch {
				/* fail-open: a dead listener can never break the session */
			}
		},
	);
	On(
		"agent/inbox/inserted",
		(Payload: { agent?: { id?: string }; message?: Message } | undefined) => {
			try {
				Handle(State, Payload?.message, Payload?.agent?.id ?? "");
			} catch {
				/* fail-open */
			}
		},
	);
};
