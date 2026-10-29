// Proposals - the pending-proposal store (Function/Proposals): record,
// expire, decide, list. Pure in-memory state on the State object - the
// durable record is the ledger file. Expiry is evaluated lazily at every
// read/decision (no timers in the plugin): a proposal past expiresAt
// becomes an "expired" decision by "policy" the first time it is touched.
import type { BatchDecision, BatchProposal } from "@Interface/Batch.js";
import type { PendingProposal } from "@Interface/State.js";
import type State from "@Interface/State.js";

export const Now = (State_: State): number => (State_.Now ? State_.Now() : Date.now());

/** Record a proposal; returns false when the id is a duplicate (ignored -
 *  the id is content-derived and a re-proposal of the same content is the
 *  same batch, possibly at a new revision: a revision bump replaces in
 *  place). */
export const Record = (State_: State, Proposal: BatchProposal, At: number): boolean => {
	const Existing = State_.Pending.get(Proposal.id);
	if (Existing !== undefined && Existing.proposal.revision >= Proposal.revision) {
		return false;
	}
	State_.Pending.set(Proposal.id, { proposal: Proposal, proposedAt: At });
	return true;
};

/** The lazily-expired decision for a proposal, or undefined when pending. */
export const ExpiredDecision = (
	State_: State,
	Entry: PendingProposal,
): BatchDecision | undefined =>
	Entry.proposal.expiresAt <= Now(State_)
		? { proposal: Entry.proposal.id, outcome: "expired", by: "policy", at: Now(State_) }
		: undefined;

/** Apply a decision to a pending entry; counts user approvals for the
 *  first-batch rule. Returns the entry or undefined when unknown. */
export const Decide = (State_: State, Decision: BatchDecision): PendingProposal | undefined => {
	const Entry = State_.Pending.get(Decision.proposal);
	if (Entry === undefined) {
		return undefined;
	}
	Entry.decided = Decision;
	if (Decision.outcome === "approved" && Decision.by === "user") {
		State_.SeenIntents.set(
			Entry.proposal.intent,
			(State_.SeenIntents.get(Entry.proposal.intent) ?? 0) + 1,
		);
	}
	// Bounded memory: a decided entry stays until its TTL sweep drops it.
	return Entry;
};

/** Sweep the pending map: drop entries older than PendingTtlMs. */
export const Sweep = (State_: State): number => {
	const At = Now(State_);
	let Dropped = 0;
	for (const [Id, Entry] of State_.Pending) {
		if (At - Entry.proposedAt > State_.PendingTtlMs) {
			State_.Pending.delete(Id);
			Dropped += 1;
		}
	}
	return Dropped;
};

/** The pending (undecided, unexpired) proposals, oldest first. */
export const Pending = (State_: State): PendingProposal[] => {
	const At = Now(State_);
	return [...State_.Pending.values()]
		.filter((Entry) => Entry.decided === undefined && Entry.proposal.expiresAt > At)
		.sort((Left, Right) => Left.proposedAt - Right.proposedAt);
};
