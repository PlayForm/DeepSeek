// Decide - the classifier (Function/Decide): one terminal command -> the
// verdict. The guard chain (ORCHESTRATION-PLUGINS.md section 3):
//
//   1. the guard is disabled -> allow (the cold mount passes everything);
//   2. NO segment of the command is a git command -> allow (the guard
//      only ever judges git);
//   3. strict mode -> deny (EVERY git command, allow-list included - the
//      plan's "deny ALL git commands" posture; strict is the tighter
//      override);
//   4. a segment's subcommand is allow-listed -> allow (the read-only
//      checks + fetch; the allow-list wins over the deny-list, so a user
//      can re-allow a denied subcommand explicitly);
//   5. a segment's subcommand is deny-listed -> deny;
//   6. otherwise -> allow (not deny-listed).
//
// A compound command is judged by its WORST segment: any denied segment
// denies the whole command ("cd repo && git add -A" is denied). The
// verdict carries the first denied subcommand for the ledger/refusal.
import Segments from "@Function/Segments.js";
import Subcommand from "@Function/Subcommand.js";
import type Decision from "@Interface/Decision.js";
import type State from "@Interface/State.js";

export default (State: State, Command: string): Decision => {
	switch (true) {
		case !State.On:
			return { verdict: "allow", reason: "guard disabled" };
	}
	const Parts = Segments(Command);
	const Found: { subcommand: string; segment: string }[] = [];
	for (const Segment of Parts) {
		const Sub = Subcommand(Segment);
		switch (true) {
			case Sub === undefined:
				continue; // not a git command - not judged
		}
		Found.push({ subcommand: Sub, segment: Segment });
	}
	switch (true) {
		case Found.length === 0:
			return { verdict: "allow", reason: "not a git command" };
	}
	for (const One of Found) {
		switch (true) {
			case State.Strict:
				// Strict is the tighter override: EVERY git command, allow-list
				// included (the plan's "deny ALL git commands" posture).
				return {
					verdict: "deny",
					reason: `strict mode denies every git command (${One.subcommand || "bare"})`,
					subcommand: One.subcommand,
				};
			case State.Allow.includes(One.subcommand):
				continue; // allow-listed - passes this segment
			case State.Deny.includes(One.subcommand):
				return {
					verdict: "deny",
					reason: `deny-list: git ${One.subcommand}`,
					subcommand: One.subcommand,
				};
			default:
			// not deny-listed - passes this segment
		}
	}
	return { verdict: "allow", reason: "not deny-listed" };
};
