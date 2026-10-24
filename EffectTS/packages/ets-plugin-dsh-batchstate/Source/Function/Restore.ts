// Restore - the shared recovery (Function/Restore): repopulate the members,
// the queue, the spliced proposals and the arbiter gates from ONE
// state-shaped source - the KV domain's four tables OR the JSON fallback file
// (Interface/File) - and ledger the byte-exact
// `recovered (<n> members, queue <n>)` line.
//
// THE MERGE (not a replace): at mount the live collections are empty, so a
// merge and a replace are the same thing - EXCEPT in the storage domain's
// open window, where a splice or a write API call can land before the
// detached open resolves. The live record always WINS (it is the newer
// truth), so an early activation or an early gate report is never clobbered
// by the store's older copy.
//
// THE RULES (unchanged from the file-only recovery):
//   - a member KEEPS its status, timestamps and scope;
//   - a member that recovered as active is HONESTLY downgraded to interrupted
//     (the process it ran in is gone after a restart - the live truth cannot
//     be claimed; a LIVE member is not downgraded - its process exists);
//   - the queue keeps only ids that still have a member record;
//   - a malformed row is skipped, never guessed;
//   - the proposals and the gates come back verbatim - the board's proposal
//     memory and the arbiter truth survive the restart.
import type Entry from "@Interface/Entry.js";
import type File from "@Interface/File.js";
import type State from "@Interface/State.js";

export default (State: State, Source: File): void => {
	for (const Row of Source.members) {
		switch (true) {
			case typeof Row?.id !== "string":
				continue; // malformed row - skipped, never guessed
			case State.Members.has(Row.id):
				continue; // the live record wins (the open window)
			case Row.status === "active":
				// The owning process is gone after a restart: the member is
				// honestly downgraded to interrupted.
				Row.status = "interrupted";
				Row.finishedAt = Row.finishedAt || Date.now();
				break;
			default:
		}
		State.Members.set(Row.id, Row);
	}
	for (const Id of Source.queue) {
		switch (true) {
			case typeof Id !== "string" || !State.Members.has(Id) || State.IdleQueue.includes(Id):
				continue;
			default:
				State.IdleQueue.push(Id);
		}
	}
	for (const Row of Source.proposals as Entry[]) {
		switch (true) {
			case typeof Row?.proposal?.id !== "string":
				continue; // malformed row - skipped, never guessed
			case State.Proposals.has(Row.proposal.id):
				continue; // the live splice wins (the open window)
			default:
				State.Proposals.set(Row.proposal.id, Row);
		}
	}
	for (const Row of Source.gates) {
		switch (true) {
			case typeof Row?.name !== "string":
				continue; // malformed row - skipped, never guessed
			case State.Gates.has(Row.name):
				continue; // the live gate wins (the open window)
			default:
				State.Gates.set(Row.name, Row);
		}
	}
	State.Factory.Append(
		State,
		`recovered (${State.Members.size} members, queue ${State.IdleQueue.length})`,
	);
};
