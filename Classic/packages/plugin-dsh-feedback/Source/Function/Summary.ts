// Summary - the council view of one session (plan section 2.2,
// `feedback/summary`): the aggregate signals for the recipient's deliberate
// review. Pure read: no block is force-read, no status is touched. The batch
// outcomes the orchestration layer reported ride along (the apply truth is
// part of the council's knowledge).
import type State from "../Interface/State.js";
import type Summary from "../Interface/Summary.js";

/** Extract simple word tokens for the liked/disliked clusters. */
const Terms = (Text: string, Limit: number): string[] => {
	const Counts = new Map<string, number>();
	for (const Raw of Text.toLowerCase().split(/[^a-z0-9]+/)) {
		if (Raw.length < 4) {
			continue;
		}
		Counts.set(Raw, (Counts.get(Raw) ?? 0) + 1);
	}
	return [...Counts.entries()]
		.sort((A, B) => B[1] - A[1])
		.slice(0, Limit)
		.map(([Term]) => Term);
};

export default (State: State, Session: string): Summary => {
	const Record = State.Sessions.get(Session);
	const Blocks = [...(Record?.blocks.values() ?? [])];
	const Unread = Blocks.filter((Block) => Block.readStatus === "unread").length;
	return {
		session: Session,
		blocks: Blocks.length,
		unread: Unread,
		liked: Terms(Blocks.map((Block) => Block.liked).join(" "), State.Config.summaryTerms),
		disliked: Terms(Blocks.map((Block) => Block.disliked).join(" "), State.Config.summaryTerms),
		entries: Blocks,
		outcomes: [...(State.Outcomes.get(Session) ?? [])],
	};
};
