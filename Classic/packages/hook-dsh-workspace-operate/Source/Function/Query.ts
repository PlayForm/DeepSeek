// Query - the read side of the proposal table (Function/Query): the
// filtered list (limit defaults to config limitDefault, capped at
// config limitMaximum - the graph's own rule), the single lookup, and the
// honest statistics triple.
import type Filter from "@Interface/Filter.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";

export const List = (State: State, Filter: Filter | undefined): Proposal[] => {
	const LimitRaw = Filter?.limit;
	const Limit =
		typeof LimitRaw === "number" && Number.isInteger(LimitRaw) && LimitRaw >= 1
			? Math.min(LimitRaw, State.LimitMaximum)
			: State.LimitDefault;
	const Match = (Entry: Proposal): boolean => {
		switch (true) {
			case Filter?.kind !== undefined && Entry.kind !== Filter.kind:
				return false;
			case Filter?.path !== undefined && Entry.path !== Filter.path:
				return false;
			case Filter?.status !== undefined && Entry.status !== Filter.status:
				return false;
			default:
				return true;
		}
	};
	const Result: Proposal[] = [];
	for (const Entry of State.Proposals.values()) {
		if (Result.length >= Limit) {
			break;
		}
		if (Match(Entry)) {
			Result.push(Entry);
		}
	}
	return Result;
};

export const One = (State: State, Id: string): Proposal | undefined => State.Proposals.get(Id);

export const Statistics = (State: State): Statistics => {
	const ByKind = { rename: 0, connect: 0, replace: 0 };
	for (const Entry of State.Proposals.values()) {
		if (ByKind[Entry.kind] !== undefined) {
			ByKind[Entry.kind] += 1;
		}
	}
	return {
		proposals: State.Proposals.size,
		refused: State.Refused,
		sequence: State.Sequence,
		byKind: ByKind,
	};
};
