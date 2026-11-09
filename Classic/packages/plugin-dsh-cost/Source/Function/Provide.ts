// Provide - the engine services: `cost.session(SessionId, Rows)` answers one
// session's CostResponse from the ledger, `cost.contributions(Path)` answers
// the conversations that contributed to one file's cost, and `costPricing`
// (Interface/PricingService.ts, Function/Pricing.ts) answers the versioned
// catalog surface over the v5 tables - catalogs, revisions and rate rows as
// reads, `publish` as the one write, and `preview` as the re-pricing that
// persists nothing. The ledger path is this package's own config default
// (Variable/Config's `Home(["cost", "ledger.db"])`), never a caller's: the
// contribution read's argument is a FILE path, not a ledger path, so it is
// handed to the read and never opened.
//
// THE READ SERVICE opens the ledger read-only once per call and closes it in a
// finally, so a failed read never leaks a handle. The package's own
// Function/Open is the WRITE path (mkdir, the WAL pragmas, the schema ladder),
// so it is not reused here: the local open expands a leading "~/" once and
// throws one actionable line.
//
// THE PRICING SERVICE is the one service that writes, so it rides the ledger
// effect's own handle (passed in by Function/Apply): the WAL pragmas and the
// foreign keys already in force there are the ones `publish`'s transaction
// uses, and no second write handle is opened for a rare insert. A handle that
// is absent (the ledger effect never ran) leaves the pricing service
// unprovided rather than opening a path of its own.
//
// Both services are returned as one disposer, so they are removed with the
// fiber: the pricing service first, then the read service.
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";

import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
import type CostContributionRow from "@Interface/ContributionRow.js";
import type PricingService from "@Interface/PricingService.js";
import type CostResponse from "@Interface/Response.js";
import type CostService from "@Interface/Service.js";
import { Home } from "@playform/lib-dsh-core";

import Contributions from "./Contributions.js";
import Pricing from "./Pricing.js";
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

export default function Provide(
	Context: Context,
	Config: Config,
	Database?: DatabaseSync,
): () => void {
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
	// providers are absent, and nothing throws into apply. Both providers
	// share the probe, so the pricing service can never be provided into a
	// context that refused the read service.
	switch (true) {
		case typeof Context.reflect?.provide !== "function":
			return () => undefined;
		default: {
			const OffCost = Context.reflect.provide("cost", Service);
			// The pricing service needs the ledger's write handle; without it
			// there is nothing to publish into, so the read service stands
			// alone rather than the provider inventing an open of its own.
			if (Database === undefined) {
				return OffCost;
			}
			const Catalog: PricingService = Pricing(Database, Config);
			const OffPricing = Context.reflect.provide("costPricing", Catalog);
			return () => {
				OffPricing();
				OffCost();
			};
		}
	}
}
