// Open - the database effect: the ledger's SQLite file opened, migrated and
// returned as `{ Database, Close }`. The durability postures are the design
// document's (section 3): journal_mode=WAL, foreign_keys=ON,
// synchronous=NORMAL, every table STRICT. The schema runs exactly once per
// file - a fresh file (user_version 0) takes every DDL statement inside one
// transaction and is stamped version 1; an existing ledger opens as-is and
// the version ladder carries the later migrations. The import is the static
// `node:sqlite` core module (DatabaseSync), which needs no native build.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { Expand } from "@playform/lib-dsh-core";

import type Config from "../Interface/Config.js";
import Ddl from "./Schema.js";

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

	// The schema, guarded by user_version (section 3): every statement of the
	// DDL inside one transaction, then the version stamp. A failed statement
	// rolls the whole transaction back - the ledger never opens half-built.
	const Row = Database.prepare("PRAGMA user_version").get() as { user_version: number };
	if (Row.user_version === 0) {
		Database.exec("BEGIN TRANSACTION");
		try {
			for (const Statement of Ddl) {
				Database.exec(Statement);
			}
			Database.exec("COMMIT");
		} catch (Failure) {
			Database.exec("ROLLBACK");
			throw Failure;
		}
		Database.exec("PRAGMA user_version = 1");
	}

	return {
		Database,
		Close: () => {
			Database.close();
		},
	};
};
