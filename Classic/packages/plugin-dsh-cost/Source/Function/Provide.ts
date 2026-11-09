// Provide - the engine service: `cost.session(SessionId, Rows)` answers one
// session's CostResponse from the ledger, and `cost.contributions(Path)`
// answers the conversations that contributed to one file's cost, both
// READ-ONLY. The ledger path is this package's own config default
// (Variable/Config's `Home(["cost", "ledger.db"])`), never a caller's: the
// contribution read's argument is a FILE path, not a ledger path, so it is
// handed to the read and never opened. Each call opens the ledger read-only
// once and closes it in a finally, so a failed read never leaks a handle. The
// package's own Function/Open is the WRITE path (mkdir, the WAL pragmas, the
// schema ladder), so it is not reused here: the local open expands a leading
// "~/" once and throws one actionable line. The provider returns the disposer
// `ctx.reflect.provide` hands back, so the service is removed with the fiber.
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";
import type CostContributionRow from "@Interface/ContributionRow.js";
import type CostResponse from "@Interface/Response.js";
import type CostService from "@Interface/Service.js";
import { Home } from "@playform/lib-dsh-core";

import Contributions from "./Contributions.js";
import Reader from "./Reader.js";

// The read-only open: a leading "~/" is expanded to the home-anchored
// absolute path exactly once at the open site, the file is opened with
// `{ readOnly: true }`, and a failure throws one actionable line that starts
// with the package prefix and ends with the underlying message. No pragma
// writes, no migration and no DDL - the reader runs no statement that mutates.
const Open = (Path: string): { Database: DatabaseSync; Close(): void } => {
	const Resolved = Path.startsWith("~/") ? `${homedir()}${Path.slice(1)}` : Path;
	let Database: DatabaseSync;
	try {
		Database = new DatabaseSync(Resolved, { readOnly: true });
	} catch (Failure) {
		throw new Error(
			`plugin-dsh-cost: cannot open the ledger at ${Resolved} - ` +
				`${Failure instanceof Error ? Failure.message : String(Failure)}`,
		);
	}
	return {
		Database,
		Close: () => {
			Database.close();
		},
	};
};

export default function Provide(Context: Context): () => void {
	// The ledger path: this package's own config default, resolved through the
	// harness home precedence - never a path from the caller.
	const Path = Home(["cost", "ledger.db"]);
	const Service: CostService = {
		session: (SessionId: string, Rows: number): CostResponse => {
			const Ledger = Open(Path);
			try {
				// The reader sees only the handle, so the service stamps the
				// resolved ledger path the envelope's `path` field names.
				return { ...Reader(Ledger.Database, SessionId, Rows), path: Path };
			} finally {
				Ledger.Close();
			}
		},
		contributions: (FilePath: string): readonly CostContributionRow[] => {
			// The argument is the file the caller asks about, so the ledger
			// stays the package's own default and only the read sees the path.
			const Ledger = Open(Path);
			try {
				return Contributions(Ledger.Database, FilePath);
			} finally {
				Ledger.Close();
			}
		},
	};
	// A fake context without the reflection service (the smoke harness) gets
	// the same silent posture as every optional service in this tree: the
	// provider is absent, and nothing throws into apply.
	switch (true) {
		case typeof Context.reflect?.provide !== "function":
			return () => undefined;
		default:
			return Context.reflect.provide("cost", Service);
	}
}
