// Recover - the state-file recovery (Function/Recover): read the well-known
// JSON state file ONCE on mount and repopulate the members and the queue.
// The file is the plugin's OWN store (the plan's file-based fallback, the
// sanctioned channel when the inbox splice is not exposed) - it is read and
// written with a plain fs read/write because the state file is NOT a
// governed file (the same documented exemption the ledger carries: ctx.fs
// has no append, and re-reading + rewriting the plugin's own snapshot
// through a governed write would be both racy and wrong).
//
// The recovered members KEEP their statuses, timestamps and scopes; a
// member that recovered as active is HONESTLY downgraded to interrupted
// (the process it ran in is gone after a restart - the live truth cannot
// be claimed). The queue keeps only ids that still have a member record.
import * as FileSystem from "node:fs";

import type Member from "@Interface/Member.js";
import type State from "@Interface/State.js";

/** The persisted state file's record shape. */
interface File {
	members: Member[];
	queue: string[];
}

export default (State: State): void => {
	try {
		const Raw = FileSystem.readFileSync(State.StateFile, "utf8");
		const Parsed = JSON.parse(Raw) as Partial<File>;
		State.Members.clear();
		for (const Row of Parsed.members ?? []) {
			switch (true) {
				case typeof Row?.id !== "string":
					continue; // malformed row - skipped, never guessed
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
		State.IdleQueue.length = 0;
		for (const Id of Parsed.queue ?? []) {
			if (typeof Id === "string" && State.Members.has(Id)) {
				State.IdleQueue.push(Id);
			}
		}
		State.Factory.Append(
			State,
			`recovered (${State.Members.size} members, queue ${State.IdleQueue.length})`,
		);
	} catch {
		// Missing or corrupt: start empty (never guessed).
		State.Factory.Append(State, "recovered (0 members, queue 0)");
	}
};
