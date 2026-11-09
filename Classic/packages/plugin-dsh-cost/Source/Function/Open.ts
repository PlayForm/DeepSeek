// Open - the database effect: the ledger's SQLite file opened, migrated and
// returned as `{ Database, Close }`. The durability postures are the design
// document's (section 3): journal_mode=WAL, foreign_keys=ON,
// synchronous=NORMAL, every table STRICT. The schema runs exactly once per
// file - a fresh file (user_version 0) takes every DDL statement AND its
// version stamp inside ONE transaction, so a crash can never leave a complete
// schema stamped version zero; a v1 ledger runs the v2,
// v3 and v4 rungs of the ladder (sections 14, 17.6, 17.3 and 17.4), a v2
// ledger runs the v3 and v4 rungs, a v3 ledger runs the v4 rung alone, and
// version 4 opens as-is. A file stamped ABOVE this build's version is
// rejected with one actionable line instead of being opened as though it
// were compatible (section 1.7). The
// import is the static `node:sqlite` core module (DatabaseSync), which needs
// no native build.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { Expand } from "@playform/lib-dsh-core";

import type Config from "../Interface/Config.js";
import Ddl, { Migration, MigrationFactor, MigrationTelemetry } from "./Schema.js";

// The schema version this build writes and understands: the ladder's top
// rung. A fresh file is stamped with it inside the transaction that creates
// its tables, and a file stamped above it belongs to a newer build.
const Supported = 4;
const Stamp = "PRAGMA user_version = 4;";

export default (Config: Config): { Database: DatabaseSync; Close(): void } => {
	// The tilde expansion (lib-dsh-core's Expand): a config-supplied path is
	// expanded exactly once at its open site ("~/.dsh/cost/ledger.db" becomes
	// the home-anchored absolute path; every other path passes through).
	const Path = Expand(Config.databasePath);
	mkdirSync(dirname(Path), { recursive: true });

	// Fail loud with ONE actionable line naming the path - a runtime without
	// node:sqlite or an unopenable file must never crash the loader silently.
	let Database: DatabaseSync;
	try {
		Database = new DatabaseSync(Path);
	} catch (Failure) {
		throw new Error(
			`plugin-dsh-cost: cannot open the ledger database at ${Path} - ${
				Failure instanceof Error ? Failure.message : String(Failure)
			}`,
		);
	}

	// The durability postures (section 3), one exec, every pragma.
	Database.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA synchronous=NORMAL;");

	// The schema, guarded by user_version (sections 3, 14, 17.6, 17.3, 17.4
	// and 1.7): a fresh file takes the whole DDL and its version stamp inside
	// ONE transaction; a v1 ledger runs the three migration rungs in order
	// (v1 to v2, then v2 to v3, then v3 to v4), a v2 ledger runs the v3 and
	// v4 rungs, a v3 ledger runs only the v4 rung - each rung inside its own
	// transaction, whose last statement is the rung's stamp itself. A failed
	// statement rolls the whole rung back - the ledger never opens
	// half-built, and the ladder never skips a rung. A file stamped above
	// this build's version is refused, never opened as compatible.
	const Row = Database.prepare("PRAGMA user_version").get() as { user_version: number };
	const Rung = (Statements: readonly string[]): void => {
		Database.exec("BEGIN TRANSACTION");
		try {
			for (const Statement of Statements) {
				Database.exec(Statement);
			}
			Database.exec("COMMIT");
		} catch (Failure) {
			Database.exec("ROLLBACK");
			throw Failure;
		}
	};
	switch (true) {
		case Row.user_version > Supported: {
			// One actionable line naming the path and both versions: the file
			// is newer than this build, so running old code over it would be a
			// guess. The handle closes first, so a refused open leaks nothing.
			Database.close();
			throw new Error(
				`plugin-dsh-cost: the ledger database at ${Path} carries schema version ${Row.user_version}, ` +
					`but this build supports at most ${Supported} - update the plugin, or point databasePath at another ledger file`,
			);
		}
		case Row.user_version === 0:
			// the fresh file: the DDL and its version stamp ride ONE transaction
			Rung([...Ddl, Stamp]);
			break;
		case Row.user_version === 1:
			Rung(Migration);
			Rung(MigrationFactor);
			Rung(MigrationTelemetry);
			break;
		case Row.user_version === 2:
			Rung(MigrationFactor);
			Rung(MigrationTelemetry);
			break;
		case Row.user_version === 3:
			Rung(MigrationTelemetry);
			break;
		default:
	}

	return {
		Database,
		Close: () => {
			Database.close();
		},
	};
};
