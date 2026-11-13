import Persist from "@Function/Persist.js";
import Rules from "@Function/Rules.js";
import type Outcome from "@Interface/Outcome.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

/**
 * @module Propose
 *
 * The propose path: it runs the resolution rules and, on a pass, assigns the
 * id and sequence, stores and persists the proposal, and ledgers the line.
 *
 * @remarks
 *
 * On a pass the byte-stable `proposed <id> <kind> <path>` line is written. On
 * a refusal the Refused counter increments, the meta record persists, and the
 * line is `refused <kind> <path> (<reason>)`.
 *
 * The live-table bound (config maxProposals) is enforced here: a pass when
 * the table is full is refused `full` - never silently dropped, never an
 * oldest-evicted guess.
 *
 * The CALL-TIME master switch: a disabled hook refuses with the typed
 * `disabled` refusal and ZERO ledger lines, ZERO counter moves and no
 * persistence (the live-flip law - State.On is read at the moment of the
 * call, never captured at mount).
 */
export default async (State: State, Kind: Proposal["kind"], Input: unknown): Promise<Outcome> => {
	switch (true) {
		case State.On === false:
			return {
				status: "refused",
				refusal: {
					kind: Kind,
					reason: "disabled",
					detail: "enabled=false",
				},
			};
		default:
	}
	const Outcome = await Rules(State, Kind, Input);
	switch (true) {
		case Outcome.status === "refused": {
			State.Refused += 1;
			Persist(State, undefined);
			const Refusal = Outcome.refusal as NonNullable<typeof Outcome.refusal>;
			State.Factory.Append(State, `refused ${Refusal.kind} ${Refusal.reason}`);
			return Outcome;
		}
		default: {
			const Live = [...State.Proposals.values()].filter(
				(Entry) => Entry.status === "proposed",
			).length;
			if (Live >= State.MaxProposals) {
				State.Refused += 1;
				Persist(State, undefined);
				State.Factory.Append(State, `refused full (${Live} live proposals)`);
				return {
					status: "refused",
					refusal: {
						kind: Kind,
						reason: "full",
						detail: `the proposal table is at maxProposals (${State.MaxProposals})`,
					},
				};
			}
			const Proposal = Outcome.proposal as Proposal;
			State.Sequence += 1;
			Proposal.id = `${Proposal.kind}-${State.Sequence}`;
			Proposal.sequence = State.Sequence;
			State.Proposals.set(Proposal.id, Proposal);
			Persist(State, Proposal);
			State.Factory.Append(
				State,
				`proposed ${Proposal.id} ${Proposal.kind} ${Proposal.path}`,
			);
			return Outcome;
		}
	}
};
