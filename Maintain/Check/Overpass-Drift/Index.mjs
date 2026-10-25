// Check-Overpass-Drift - the drift guard for the overpass scaffolding (the
// plan's P1, FAMILY-ORGANISATION-ANALYSIS.md section 3.1): for each tree
// (Classic, EffectTS) and each cluster (Command, StepBatch, Overpass), hash
// the six stream flavors' `Source/Function/<cluster>.ts` with comments
// stripped and whitespace collapsed, and fail when a file's normalized hash
// differs from the baseline in Maintain/Check/Overpass-Drift/Baseline.json. The seventh
// normalize flavor - normalize-file - contributes its StepBatch and Overpass
// arms as its OWN recorded hashes (never equality with the stream flavors);
// its Command is a unique files-sweep implementation and stays out of the
// guard.
//
// Why normalized hashes: the six flavors are supposed to differ ONLY in their
// transform table, their config defaults and their comments. A comment-only
// edit must not trip the guard, while any logic edit must. Stripping comments
// and collapsing whitespace gives exactly that: the normalized text of a
// flavor file is its token stream, not its formatting.
//
// The stripping is string-aware: `//` and `/*` inside a quoted string are
// CONTENT, not comments (the ledger lines and the usage strings contain
// them), so a naive regex would corrupt the hash. The scanner tracks single,
// double and template quotes and skips escaped characters. It treats a
// template literal as opaque (the files in scope contain no comment inside a
// `${...}` expression); a false negative is acceptable for a drift guard,
// a false positive is not.
//
// Usage:
//   node Maintain/Check/Overpass-Drift/Index.mjs            check against the baseline
//   node Maintain/Check/Overpass-Drift/Index.mjs --update   rewrite the baseline
//
// The baseline is a deliberate act: regenerate it ONLY after an intended
// change has passed its own behavioral gate (the dash canary is the M3
// example). An unintended drift must be fixed, never re-baselined.
import Baseline from "./Function/Baseline.mjs";
import Collect from "./Function/Collect.mjs";
import Compare from "./Function/Compare.mjs";
import Record from "./Function/Record.mjs";

const Update = process.argv.includes("--update");
const Entries = Collect();
if (Update) process.exit(Record(Entries));
const Code = Compare(Entries, Baseline());
if (Code !== 0) process.exit(Code);
