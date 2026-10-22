// Find - the find body: filter every mirror node by name (exact), pattern
// (case-insensitive substring over the id and the name) and kind, then stop
// at the limit. The limit defaults to Config.limitDefault and is capped at
// Config.limitMaximum.
import type Node from "@Interface/Node.js";
import type Query from "@Interface/Query.js";
import type State from "@Interface/State.js";

export default (StateRef: State, Query: Query = {}): Node[] => {
	const Limit = Math.min(
		Math.max(Query.limit ?? StateRef.Config.limitDefault, 0),
		StateRef.Config.limitMaximum,
	);
	const Pattern = Query.pattern === undefined ? undefined : Query.pattern.toLowerCase();
	const Found: Node[] = [];
	for (const Record of StateRef.Records.values()) {
		for (const NodeItem of Record.nodes) {
			const MatchesKind = Query.kind === undefined || NodeItem.kind === Query.kind;
			const MatchesName = Query.name === undefined || NodeItem.name === Query.name;
			const MatchesPattern =
				Pattern === undefined ||
				NodeItem.id.toLowerCase().includes(Pattern) ||
				(NodeItem.name ?? "").toLowerCase().includes(Pattern);
			if (MatchesKind && MatchesName && MatchesPattern) {
				Found.push(NodeItem);
				if (Found.length >= Limit) {
					return Found;
				}
			}
		}
	}
	return Found;
};
