// Analysis - the MOCKUP of the five metric families (Documentation/Plans/
// COST-TRACK-PLUGIN.md sections 11, 12 and 16.2-16.4): the shape is real and
// every method returns no rows; the arithmetic arrives in the next pass.
// Each method's comment names the query it will run against the ledger
// tables (Call, Touch, Edit, Allocation, Verdict, File, FileVersion, Rollup,
// ContextMass) and the formula it will apply, so the next pass fills the
// bodies without touching the surface.
import type { DatabaseSync } from "node:sqlite";

import type Config from "../Interface/Config.js";
import type Reading from "../Interface/Reading.js";

// The shared mockup path: the gates the real queries will hang on - an open
// database, a named scope, a non-empty optional key filter and the metric's
// config switch - and no rows yet.
const Rows = (
	Database: DatabaseSync,
	Scope: string,
	Key: string | undefined,
	On: boolean,
): readonly Reading[] => {
	switch (true) {
		case !Database.isOpen:
			return [];
		case Scope.length === 0:
			return [];
		case Key !== undefined && Key.length === 0:
			return [];
		case !On:
			return [];
		// The mockup: every gate that opens still yields no rows - the
		// arithmetic arrives in the next pass.
		default:
			return [];
	}
};

export default (
	Database: DatabaseSync,
	Config: Config,
): {
	Credit(Scope: string, Key?: string): readonly Reading[];
	Effectiveness(Scope: string, Key?: string): readonly Reading[];
	Lines(Scope: string, Key?: string): readonly Reading[];
	Overhead(Scope: string, Key?: string): readonly Reading[];
	Cache(Scope: string, Key?: string): readonly Reading[];
} => ({
	// Credit - the read credit of Ring C (section 11.12): the query walks a
	// file's read-kind Touch rows and joins every later Call whose surface
	// carried the file (ContextMass), then sums
	// CacheReadTokens * (InputRate - CacheReadRate) / 1e6 from the Price row
	// in force, minus any cache-write premium - a negative cost credited to
	// the file that was read.
	Credit: (Scope: string, Key?: string): readonly Reading[] =>
		Rows(Database, Scope, Key, Config.metrics.credit),
	// Effectiveness - the read-before-edit delta (sections 11.13 and 16.4):
	// the query prices the edits of files with Touch.ReadBeforeEdit = 1
	// against the edits of files without, and for Verdict.State = 'changed'
	// rows divides sum(direct + amortized) by the surviving lines the
	// verdict records - the cost per surviving line of an edit that was
	// prepared by a read against one that was not.
	Effectiveness: (Scope: string, Key?: string): readonly Reading[] =>
		Rows(Database, Scope, Key, Config.metrics.effectiveness),
	// Lines - the edit grain (section 17.3): the query joins Edit through
	// Touch to File and sums LinesAdded and LinesRemoved per hunk per file,
	// so a 40-line refactor is visible next to a one-line fix.
	Lines: (Scope: string, Key?: string): readonly Reading[] =>
		Rows(Database, Scope, Key, Config.metrics.lines),
	// Overhead - the exploration overhead (section 12): the query sums
	// DirectCost + AmortizedCost over the Allocation rows with FileId IS
	// NULL - the money a call spent that no file paid for (retries,
	// compaction, the shared context that belongs to no file).
	Overhead: (Scope: string, Key?: string): readonly Reading[] =>
		Rows(Database, Scope, Key, Config.metrics.overhead),
	// Cache - the cache efficiency (section 16.4): the query joins
	// ContextMass to Call per file and divides the file's cached mass by its
	// total mass - the share of the file's surface tokens that the prompt
	// cache served, the measurable half of "did reading this file make the
	// later edit cheaper".
	Cache: (Scope: string, Key?: string): readonly Reading[] =>
		Rows(Database, Scope, Key, Config.metrics.cache),
});
