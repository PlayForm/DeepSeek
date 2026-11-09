// Open - the database effect: the ledger's SQLite file opened, migrated and
// returned as `{ Database, Close }`. The durability postures are the design
// document's (section 3): journal_mode=WAL, foreign_keys=ON,
// synchronous=NORMAL, every table STRICT. The schema runs exactly once per
// file - a fresh file (user_version 0) takes every DDL statement AND its
// version stamp inside ONE transaction; a v1 ledger runs the v2, v3, v4, v6
// and v7 rungs of the ladder (sections 14, 17.6, 17.3, 17.4, the version
// grain and the valuation model), a v2 ledger runs the v3, v4, v6 and v7
// rungs, a v3 ledger runs the v4, v6 and v7 rungs, a v4 or v5 ledger runs the
// v6 and v7 rungs, a v6 ledger runs the v7 rung alone, and version 7 opens
// as-is. The v6 rung is the compatibility rung: FileVersion and
// Touch.VersionId live in the fresh DDL but in none of the earlier rungs, so
// a ledger upgraded from v1-v5 gains the table and the column its drain now
// writes, each added only when the file's own table info says it is absent.
// The v7 rung is the valuation model: the six pricing tables plus the
// bootstrap catalog seeded from the file's own Price rows, all inside the
// transaction whose last statement is the version stamp, so an upgraded
// ledger never shows half a catalog.
// A file stamped ABOVE this build's version is refused with one actionable
// line instead of being opened as though it were compatible (section 1.7).
// The import is the static `node:sqlite` core module (DatabaseSync), which
// needs no native build.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { Expand } from "@playform/ets-base-dsh";

import type Config from "../Interface/Config.js";
import Ddl, {
	Migration,
	MigrationFactor,
	MigrationPricing,
	MigrationTelemetry,
	MigrationVersioning,
} from "./Schema.js";

// The schema version this build writes and understands: the ladder's top
// rung. A fresh file is stamped with it inside the transaction that creates
// its tables, and a file stamped above it belongs to a newer build.
const Supported = 7;
const Stamp = "PRAGMA user_version = 7;";

// The v6 rung's own stamp: the versioning rung lands before the pricing rung
// runs, and each rung stamps itself, so a failure leaves the file at the rung
// it completed rather than at the top of the ladder.
const VersioningStamp = "PRAGMA user_version = 6;";

export default (Config: Config): { Database: DatabaseSync; Close(): void } => {
	// The tilde expansion (ets-base-dsh's Expand): a config-supplied path is
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
	// ONE transaction; a v1 ledger runs the five migration rungs in order
	// (v1 to v2, then v2 to v3, then v3 to v4, then v4 to v6, then v6 to v7),
	// a v2 ledger runs the v3, v4, v6 and v7 rungs, a v3 ledger runs the v4,
	// v6 and v7 rungs, a v4 or v5 ledger runs the v6 and v7 rungs, and a v6
	// ledger runs the v7 rung alone - each rung inside its own transaction,
	// whose last statement is the rung's stamp itself. A failed statement
	// rolls the whole rung back - the ledger never opens half-built, and the
	// ladder never skips a rung. A file stamped above this build's version is
	// refused, never opened as compatible.
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

	// The v6 rung's two probes: FileVersion and Touch.VersionId exist only
	// from v6, and PRAGMA table_info answers an absent table with zero rows,
	// so the table check is its row count and the column check is its name
	// list. The rung then adds only the piece a file is missing - a ledger
	// this build created, or one hand-built with either piece already in
	// place, never takes a second CREATE or ALTER.
	const Columns = (Table: string): readonly string[] =>
		(Database.prepare(`PRAGMA table_info(${Table})`).all() as { name: string }[]).map(
			(One) => One.name,
		);
	const Versioning = MigrationVersioning(
		Columns("FileVersion").length > 0,
		Columns("Touch").includes("VersionId"),
	);
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
			Rung([...Versioning, VersioningStamp]);
			Rung(MigrationPricing);
			break;
		case Row.user_version === 2:
			Rung(MigrationFactor);
			Rung(MigrationTelemetry);
			Rung([...Versioning, VersioningStamp]);
			Rung(MigrationPricing);
			break;
		case Row.user_version === 3:
			Rung(MigrationTelemetry);
			Rung([...Versioning, VersioningStamp]);
			Rung(MigrationPricing);
			break;
		case Row.user_version === 4:
		case Row.user_version === 5:
			// the v4 and v5 ledgers: every table above the version grain is
			// already in place, so the v6 and v7 rungs are the ones left
			Rung([...Versioning, VersioningStamp]);
			Rung(MigrationPricing);
			break;
		case Row.user_version === 6:
			// the v6 ledger: the pricing tables and their seed are the only
			// rung it lacks
			Rung(MigrationPricing);
			break;
		default:
		// version 7 itself: the ladder is at its top rung, so it opens as-is
	}

	return {
		Database,
		Close: () => {
			Database.close();
		},
	};
};
