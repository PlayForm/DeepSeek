// Open - the read-only database effect: the ledger's SQLite file opened with
// `{ readOnly: true }` and returned as `{ Database, Close }`. The analysis
// plugin is a reader over the ledger the cost plugin wrote (section 13): it
// runs no pragma that writes, no migration, and no DDL - if the file does
// not exist or is not a ledger, the open fails loud with ONE actionable
// line naming the path, and the entry records the failure so the mount
// continues without the ledger (the command then says so).
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";

export default (Config: Config): { Database: DatabaseSync; Close(): void } => {
	// The tilde expansion: a config-supplied path is expanded exactly once at
	// its open site - a leading "~/" becomes the home-anchored absolute
	// path, and every other path passes through.
	const Path = Config.databasePath.startsWith("~/")
		? `${homedir()}${Config.databasePath.slice(1)}`
		: Config.databasePath;

	// Fail loud with ONE actionable line naming the path: a missing or
	// unopenable ledger is a setup state, and the reader is told to run the
	// cost plugin first.
	let Database: DatabaseSync;
	try {
		Database = new DatabaseSync(Path, { readOnly: true });
	} catch (Failure) {
		throw new Error(
			`plugin-dsh-cost-analysis: cannot open the ledger at ${Path} read-only - ` +
				"run the @playform/ets-plugin-dsh-cost plugin first so the ledger file exists - " +
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
