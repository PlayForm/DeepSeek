// Recover - the JSON FALLBACK recovery (Function/Recover): read the
// well-known JSON state file ONCE on mount and repopulate the members, the
// queue, the spliced proposals and the arbiter gates (Function/Restore).
//
// THE SPLIT (the completion spec's wave 3 storage migration): the PRIMARY
// store is the storage-domain KV domain (Function/Storage); this file is the
// DEGRADED FALLBACK, engaged ONLY when the harness provides no storage
// facility (Function/Apply's probe) or when the domain's open fails. The file
// is the plugin's OWN store (the plan's file-based fallback) - it is read and
// written with a plain fs read/write because the state file is NOT a governed
// file (the same documented exemption the ledger carries: ctx.fs has no
// append, and re-reading + rewriting the plugin's own snapshot through a
// governed write would be both racy and wrong). The tilde is expanded once at
// the read site (the config default is `~/.dsh/batch-state.json`).
//
// A missing or corrupt file starts the batch EMPTY - never guessed.
import { readFileSync as Read } from "node:fs";

import type File from "@Interface/File.js";
import type State from "@Interface/State.js";
import { Expand } from "@playform/ets-base-dsh";

import Restore from "./Restore.js";

export default (State: State): void => {
	try {
		const Parsed = JSON.parse(Read(Expand(State.StateFile), "utf8")) as Partial<File>;
		Restore(State, {
			members: Parsed.members ?? [],
			queue: Parsed.queue ?? [],
			proposals: Parsed.proposals ?? [],
			gates: Parsed.gates ?? [],
		});
	} catch {
		// Missing or corrupt: start empty (never guessed).
		Restore(State, { members: [], queue: [], proposals: [], gates: [] });
	}
};
