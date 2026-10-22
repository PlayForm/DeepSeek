// Apply - the batch's write path (plan section 4): validate the decision,
// then per target, in the proposal's order: resolve, verify the version
// fence (the content sha256 must still match), apply the operations through
// the governed filesystem (fs.editText with the version guard - the
// version-fenced literal edit), journal before and after. A conflict stops
// at that target (when stopOnConflict); the applied targets are reported
// honestly - no invisible intermediate state.
import { createHash as Hash } from "node:crypto";

import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
import JournalFn from "./Journal.js";
import ValidateFn from "./Validate.js";

export default async (State: State, Proposal: Proposal, Decision: Decision): Promise<Result> => {
	const PerTarget: Result["perTarget"] = [];
	let Applied = 0;
	let Conflicts = 0;
	let Recovery = 0;
	const Invalid = ValidateFn(Proposal, Decision, Date.now());
	if (Invalid !== null) {
		// The whole run is rejected before any write: the honest result
		// reports the reason on the journal, every target skipped.
		JournalFn(State, "rejected", Proposal.id, "", Invalid);
		for (const Target of Proposal.targets) {
			PerTarget.push({ path: Target.path, outcome: "skipped" });
		}
		return {
			proposal: Proposal.id,
			perTarget: PerTarget,
			applied: 0,
			conflicts: 0,
			recovery: 0,
		};
	}
	const Fs = State.Fs;
	if (Fs === undefined) {
		JournalFn(State, "rejected", Proposal.id, "", "no filesystem service");
		for (const Target of Proposal.targets) {
			PerTarget.push({ path: Target.path, outcome: "recovery-required" });
		}
		return {
			proposal: Proposal.id,
			perTarget: PerTarget,
			applied: 0,
			conflicts: 0,
			recovery: Proposal.targets.length,
		};
	}
	for (const Target of Proposal.targets.slice(0, Math.max(1, State.Config.maxTargets))) {
		const Ops = Proposal.operations.filter((Op) => Op.path === Target.path);
		try {
			const Resolved = await Fs.resolve(Target.path);
			const Info = await Fs.stat(Resolved);
			if (Info === undefined) {
				Conflicts += 1;
				PerTarget.push({ path: Target.path, outcome: "conflict" });
				JournalFn(State, "conflict", Proposal.id, Target.path, "target absent");
				if (State.Config.stopOnConflict) break;
				continue;
			}
			// The version fence: the content hash must still match the
			// prepare-time snapshot. An edited target is a conflict, not a
			// silent overwrite (plan section 2).
			const Content = await Fs.readText(Resolved);
			const Version = Hash("sha256").update(Content).digest("hex");
			if (Version !== Target.version) {
				Conflicts += 1;
				PerTarget.push({ path: Target.path, outcome: "conflict" });
				JournalFn(
					State,
					"conflict",
					Proposal.id,
					Target.path,
					"content changed since prepare",
				);
				if (State.Config.stopOnConflict) break;
				continue;
			}
			// Every operation must still match the current content; a missing
			// match is a conflict (the honest failure, plan section 4).
			const Missing = Ops.filter((Op) => !Content.includes(Op.find));
			if (Ops.length === 0 || Missing.length > 0) {
				Conflicts += 1;
				PerTarget.push({ path: Target.path, outcome: "conflict" });
				JournalFn(
					State,
					"conflict",
					Proposal.id,
					Target.path,
					Missing.length > 0
						? `${Missing.length} operation(s) no longer match`
						: "no operations for target",
				);
				if (State.Config.stopOnConflict) break;
				continue;
			}
			// The apply: one version-fenced literal edit per operation, in the
			// proposal's order; the version guard is checked inside the fs's
			// critical section, so a racing write between edits fails the
			// next edit (FS_STALE_VERSION) and lands as recovery-required.
			let OutcomeVersion = Info.version;
			for (const Op of Ops) {
				const Edit = await Fs.editText(
					Resolved,
					{ oldString: Op.find, newString: Op.replace, replaceAll: true },
					{ version: OutcomeVersion },
				);
				OutcomeVersion = Edit.version;
			}
			Applied += 1;
			PerTarget.push({
				path: Target.path,
				outcome: "applied",
				version: OutcomeVersion,
			});
			JournalFn(
				State,
				"applied",
				Proposal.id,
				Target.path,
				`version ${String(OutcomeVersion)}`,
			);
		} catch (Error) {
			Recovery += 1;
			PerTarget.push({ path: Target.path, outcome: "recovery-required" });
			JournalFn(State, "recovery-required", Proposal.id, Target.path, String(Error));
			if (State.Config.stopOnConflict) break;
		}
	}
	return {
		proposal: Proposal.id,
		perTarget: PerTarget,
		applied: Applied,
		conflicts: Conflicts,
		recovery: Recovery,
	};
};
