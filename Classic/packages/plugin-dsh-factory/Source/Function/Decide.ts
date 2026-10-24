// Decide - the policy verdict lookup: `Decide(policy, action)` returns
// "auto" or "approve" for one action class. The action names ARE the block's
// keys (read, index, record, suggest, write, commit, spawn, message), so a
// consumer's gate reads
//
//   Decide(State.Allow, "spawn") === "auto"
//
// before it acts. The block a consumer holds is the schema-defaulted object
// (or a pack-overridden one), so every key is present; a HAND-BUILT or
// partial block still decides honestly - a missing key falls back to that
// action's D6 default from Variable/Policy (the same table the schema fills),
// never to a blanket "auto".
//
// The helper never throws: a malformed verdict value (neither "auto" nor
// "approve") is treated as missing and takes the default, so a bad config
// can only be MORE conservative than the D6 posture for writes, commits and
// spawns and never silently widens an automatic action.
import type Allowlist from "@Interface/Allowlist.js";
import Default from "@Variable/Policy.js";

export default (Policy: Allowlist, Action: keyof Allowlist): "auto" | "approve" => {
	const Verdict = Policy?.[Action];
	switch (Verdict) {
		case "auto":
		case "approve":
			return Verdict;
		default:
			return Default[Action];
	}
};
