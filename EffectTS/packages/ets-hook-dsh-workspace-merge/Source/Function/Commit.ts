// Commit - the batch merge orchestrator (Function/Commit): the atomic
// gates first (Function/Gate), then the per-file commits through the
// factory's write executor, ONE FILE AT A TIME (the sequential fold - the
// version-guarded writes can never race). The atomicity semantics:
//
//   * all-or-nothing (default) - a gate failure rejects the whole batch
//     (every reply says `rejected` with the gate reason); a mid-batch
//     failure stops the batch and marks the REMAINING files
//     `recovery-required` (recoverable partial states, never an invisible
//     intermediate state - the journal domain completes or compensates);
//   * survivors - gate-level conflicts and per-file failures are per-file
//     replies; the batch continues and reports what survived.
//
// Every per-file reply is ledgered with its frozen line; the batch gets
// `merge: batch <id> started ...` and `merge: batch <id> complete ...`.
// The record is persisted after the batch (the journal the recovery
// domain reads later).
//
// THE POLICY GATE (D6): the commit is the hook's gated action. An `approve`
// verdict for `commit` (the shipped default) holds the WHOLE batch before
// the gates and before any write, with the documented
// `merge held (<n> files) (policy commit=approve)` line; the reply is the
// `rejected` commit shape and nothing is persisted. `auto` proceeds.
import CommitOne from "@Function/CommitOne.js";
import Gate from "@Function/Gate.js";
import Persist from "@Function/Persist.js";
import type Batch from "@Interface/Batch.js";
import type Commit from "@Interface/Commit.js";
import type Operation from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";
import { Decide } from "@playform/ets-plugin-dsh-factory";

export default async (State: State, Request: Batch): Promise<Commit> => {
	State.Sequence += 1;
	const Id =
		typeof Request.id === "string" && Request.id.length > 0
			? Request.id
			: `batch-${State.Sequence}`;
	const Operations = Array.isArray(Request.operations) ? Request.operations : [];
	const TotalBytes = Operations.reduce((Sum, Op) => Sum + (Op?.content?.length ?? 0), 0);
	// THE POLICY GATE (D6): the OUTER gate, in front of the atomic gates and
	// every write. An `approve` verdict refuses the whole merge with the
	// documented line and ZERO writes - the batch never starts, nothing is
	// persisted, and every operation is replied `rejected` with the reason.
	// `auto` (or a pack override to `auto`) proceeds to the gates.
	switch (Decide(State.Allow, "commit")) {
		case "auto":
			break;
		default: {
			const Reason = "the policy holds the commit (commit=approve)";
			State.Factory.Append(
				State,
				`merge held (${Operations.length} files) (policy commit=approve)`,
			);
			const Replies: Reply[] = Operations.map((Op) => ({
				path: Op.path,
				status: "rejected",
				reason: Reason,
			}));
			return { id: Id, status: "rejected", replies: Replies, reason: Reason };
		}
	}
	State.Factory.Append(
		State,
		`batch ${Id} started (${Operations.length} files, ${TotalBytes} bytes)`,
	);
	const Checked = await Gate(State, Operations);
	switch (true) {
		case !Checked.ok: {
			const Reason = Checked.reason ?? "the gates failed";
			State.Factory.Append(State, `batch ${Id} rejected (${Reason})`);
			const Replies: Reply[] = Operations.map((Op) => ({
				path: Op.path,
				status: "rejected",
				reason: Reason,
			}));
			Persist(State, {
				id: Id,
				status: "rejected",
				sequence: State.Sequence,
				replies: Replies,
			});
			return { id: Id, status: "rejected", replies: Replies, reason: Reason };
		}
		default:
	}
	const Replies: Reply[] = [];
	let Interrupted = false;
	for (const [Index, File] of Checked.files.entries()) {
		const Op = Operations[Index] as Operation;
		switch (true) {
			case Interrupted && State.Mode === "all-or-nothing":
				Replies.push({ path: Op.path, status: "recovery-required" });
				State.Factory.Append(State, `recovery-required ${Op.path} (batch ${Id})`);
				break;
			case File.conflict && State.Mode === "survivors":
				Replies.push({
					path: Op.path,
					status: "conflict",
					expected: File.expected,
					observed: File.observed,
					reason: "the fence contradicts the file version",
				});
				State.Factory.Append(
					State,
					`conflict ${Op.path} (expected ${File.expected}, observed ${File.observed})`,
				);
				break;
			default: {
				const Reply = await CommitOne(State, Op, File);
				Replies.push(Reply);
				switch (Reply.status) {
					case "applied":
						State.Factory.Append(
							State,
							`applied ${Reply.path} version ${Reply.version} (batch ${Id})`,
						);
						break;
					case "conflict":
						State.Factory.Append(
							State,
							`conflict ${Reply.path} (expected ${Reply.expected}, observed ${Reply.observed})`,
						);
						break;
					case "denied":
						State.Factory.Append(State, `denied ${Reply.path} (${Reply.reason})`);
						break;
					case "outcome-unknown":
						State.Factory.Append(State, `outcome-unknown ${Reply.path} (batch ${Id})`);
						break;
					default:
				}
				switch (true) {
					case Reply.status !== "applied" && State.Mode === "all-or-nothing":
						Interrupted = true;
						break;
					default:
				}
			}
		}
	}
	const Applied = Replies.filter((Reply) => Reply.status === "applied").length;
	const Conflicts = Replies.filter((Reply) => Reply.status === "conflict").length;
	const Denied = Replies.filter((Reply) => Reply.status === "denied").length;
	const Recovery = Replies.filter((Reply) => Reply.status === "recovery-required").length;
	const Unknown = Replies.filter((Reply) => Reply.status === "outcome-unknown").length;
	const Status = Interrupted ? "partial" : "applied";
	State.Factory.Append(
		State,
		`batch ${Id} complete (applied ${Applied}, conflict ${Conflicts}, denied ${Denied}, recovery ${Recovery}, unknown ${Unknown})`,
	);
	Persist(State, { id: Id, status: Status, sequence: State.Sequence, replies: Replies });
	return { id: Id, status: Status, replies: Replies };
};
