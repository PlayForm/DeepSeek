// Propose - the inbox splice (Function/Propose): record one batch proposal
// on the board. THE SPLICE the plan's exploration item 1 asked for: the
// proposal arrives as an inbox message (the harness agent-team channel), the
// board parses it (Function/Envelope) and projects it into its state, so the
// board, the compiled context and every consumer see the SAME proposal.
//
// THE FENCES:
//   - the id: a payload without one is refused (`proposal rejected`), never
//     invented;
//   - the revision: a proposal already held at the same or a higher revision
//     is ignored (`skipped (revision not newer)`) - a re-delivery of the same
//     batch is the same batch;
//   - the ring: the newest MaxProposals entries survive (the board's memory
//     is bounded like the completions ring).
//
// The write is ledgered, persisted (Function/Persist) and emitted as
// `batch/state-change` kind `proposal` AFTER the state moved - the same
// contract the write API follows.
import Emit from "@Function/Emit.js";
import Persist from "@Function/Persist.js";
import type Entry from "@Interface/Entry.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

/** Read one string field off the untrusted payload. */
const Text = (Raw: Record<string, unknown>, Key: string): string =>
	typeof Raw[Key] === "string" ? (Raw[Key] as string) : "";

/** Read one number field off the untrusted payload. */
const Count = (Raw: Record<string, unknown>, Key: string): number =>
	typeof Raw[Key] === "number" && Number.isFinite(Raw[Key]) ? (Raw[Key] as number) : 0;

/** Normalize the untrusted payload into the board's proposal contract. */
const Shape = (Raw: Record<string, unknown>, Origin: string): Proposal => ({
	id: Text(Raw, "id"),
	intent: Text(Raw, "intent"),
	targets: Array.isArray(Raw["targets"]) ? (Raw["targets"] as Proposal["targets"]) : [],
	operations: Array.isArray(Raw["operations"])
		? (Raw["operations"] as Proposal["operations"])
		: [],
	preview:
		Raw["preview"] !== null && typeof Raw["preview"] === "object"
			? (Raw["preview"] as Proposal["preview"])
			: { entries: [], changes: 0, skipped: [] },
	digest: Text(Raw, "digest"),
	revision: Count(Raw, "revision"),
	expiresAt: Count(Raw, "expiresAt"),
	confidence: typeof Raw["confidence"] === "number" ? (Raw["confidence"] as number) : undefined,
	origin: Origin.length > 0 ? Origin : Text(Raw, "origin") || undefined,
});

export default (State: State, Payload: Record<string, unknown>, Origin: string): void => {
	const Proposal = Shape(Payload, Origin);
	switch (true) {
		case Proposal.id.length === 0:
			State.Factory.Append(State, "proposal rejected (malformed payload)");
			return;
		default:
			break;
	}
	const Existing = State.Proposals.get(Proposal.id);
	switch (true) {
		case Existing !== undefined && Existing.proposal.revision >= Proposal.revision:
			State.Factory.Append(State, `proposal ${Proposal.id} skipped (revision not newer)`);
			return;
		default:
			break;
	}
	const Entry: Entry = { proposal: Proposal, status: "proposed", at: Date.now() };
	State.Proposals.set(Proposal.id, Entry);
	while (State.Proposals.size > State.MaxProposals) {
		const Oldest = State.Proposals.keys().next().value;
		if (Oldest !== undefined) {
			State.Proposals.delete(Oldest);
		}
	}
	State.Factory.Append(
		State,
		`proposal ${Proposal.id} spliced (intent ${Proposal.intent}, targets ${Proposal.targets.length}, rev ${Proposal.revision}, origin ${Proposal.origin ?? "-"})`,
	);
	Persist(State);
	Emit(State, { batch: State.Batch, id: Proposal.id, kind: "proposal" });
};
