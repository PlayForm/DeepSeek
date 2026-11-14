import { createHash as Hash } from "node:crypto";
import { readFileSync as Read } from "node:fs";

import type Intent from "../Interface/Intent.js";
import type Operation from "../Interface/Operation.js";
import type Preview from "../Interface/Preview.js";
import type Proposal from "../Interface/Proposal.js";
import type State from "../Interface/State.js";
import type Target from "../Interface/Target.js";
import Digest from "./Digest.js";
import Operate from "./Operate.js";
import PreviewFn from "./Preview.js";
import ResolveFn from "./Resolve.js";

/**
 * @module Prepare
 *
 * The pass-on's orchestration (plan section 3): resolve the targets,
 * synthesize the operations, render the preview, compute the digest.
 *
 * @remarks
 *
 * READ-ONLY: nothing is written. If the proposal is empty or ambiguous
 * (unknown kind, no effective operations), the pass-on returns no batch - not
 * an empty one. The proposal map is bounded: before an insert, entries whose
 * expiresAt has passed (the same clock that stamped them) are swept, and the
 * map is held under the 256-entry cap by evicting the oldest insertion first
 * (a Map preserves insertion order, so the first key is the oldest).
 */
export default (State: State, Intent: Intent): Proposal | null => {
	const Config_ = State.Config;
	switch (true) {
		case !Config_.enabled:
			return null;
		case typeof Intent?.kind !== "string" || Intent.kind.length === 0:
			return null;
		case !(Intent.kind in Config_.kinds):
			// Unknown kind: ambiguous, no batch.
			return null;
		default:
			break;
	}
	const Params = Intent.params ?? {};
	const Paths = ResolveFn(Config_.root, Config_, Intent.kind, Intent.targets);
	if (Paths.length === 0) {
		return null;
	}
	const Targets: Target[] = [];
	const Operations: Operation[] = [];
	const Previews: Preview[] = [];
	for (const Path of Paths) {
		let Content: string;
		try {
			Content = Read(Path, "utf8");
		} catch {
			continue;
		}
		const Version = Hash("sha256").update(Content).digest("hex");
		const Op = Operate(Intent.kind, Path, Content, Params);
		if (Op === null) {
			// No change for this target: skipped, not an operation.
			continue;
		}
		Targets.push({ path: Path, version: Version, why: Op.why });
		Operations.push({ path: Path, ...Op });
		// The matched region, before/after - not the whole files.
		const At = Content.indexOf(Op.find);
		const Region = At < 0 ? "" : Content.slice(Math.max(0, At - 80), At + Op.find.length + 80);
		Previews.push(
			PreviewFn(Path, Region, Region.replace(Op.find, Op.replace), Config_.maxPreviewBytes),
		);
	}
	if (Targets.length === 0) {
		// Empty: no batch, not an empty batch.
		return null;
	}
	const Digest_ = Digest(
		Targets,
		Operations.map(({ path, ...rest }) => rest),
	);
	const Proposal_: Proposal = {
		id: Digest_.slice(0, 12),
		intent: { kind: Intent.kind, params: Params },
		targets: Targets,
		operations: Operations,
		preview: Previews,
		digest: Digest_,
		revision: 1,
		expiresAt: Date.now() + Config_.expiresSeconds * 1000,
		createdAt: Date.now(),
	};
	// The bounded ledger map: sweep what has expired on the same clock that
	// stamped expiresAt, then evict the oldest insertions until below the cap.
	const Now = Date.now();
	for (const [Id, Stored] of State.Proposals) {
		if (Stored.expiresAt <= Now) {
			State.Proposals.delete(Id);
		}
	}
	while (State.Proposals.size >= 256) {
		const Oldest = State.Proposals.keys().next().value;
		if (Oldest === undefined) {
			break;
		}
		State.Proposals.delete(Oldest);
	}
	State.Proposals.set(Proposal_.id, Proposal_);
	return Proposal_;
};
