// One-shot generator: the ETS twins of the PLANNED Classic packages.
// The precedent: Maintain/Mirror/Live-Containers/Index.mjs - the mirror under
// the identity substitutions ONLY, the output diff-verified afterwards.
//
// THE LAW: the ETS twin keeps the CLASSIC module identity (the `name` export,
// the loader `id:` and every log-line prefix stay byte-identical); what changes
// is the npm package identity, the ETS dependency names, the relative sibling
// paths and the twin's OWN ledger file name. The generator walks the MANIFEST's
// ets-* entries (tier 2-planned + 3-candidates), finds the Classic source by
// stripping the ets- prefix, and mirrors the tree.
//
// WAVE 5 (the twin-parity pass, 2026-10-23): ten completion waves changed the
// Classic behaviour after the 2026-10-22 PoC, so the twins had drifted. Four
// explicit extensions landed here (and are documented because each one is a
// behavioural decision, not a refactor):
//
//   1. THE NEW-LIBRARY TOKENS: the bare `lib-dsh-trace` -> `ets-lib-dsh-trace`
//      and `lib-dsh-pack` -> `ets-lib-dsh-pack` (the quoted forms were already
//      covered by the `"@playform/lib-dsh-` rule, but the BARE form appears in
//      the relative-path imports and the prose). The bare rules run FIRST,
//      before the quoted rules: `lib-dsh-trace` is a substring of the quoted
//      `@playform/ets-lib-dsh-trace`, so the reverse order would double the
//      prefix.
//   2. THE LEDGER-PATH SUBSTITUTION: the twins own their ledger names
//      (`~/.dsh/playform/ets-<package>.log`), never the Classic ones. The four
//      family prefixes (hook-/plugin-/client-/lib-) are rewritten at the
//      `.dsh/playform/` boundary so a path in a Config default, a Library
//      comment or a smoke expectation stays consistent inside the twin. The
//      rule is inert where the Classic source has no ledger path.
//   3. THE RELATIVE SIBLING PATH (the wave-5 build-breaker): the generated Test
//      harnesses import a sibling package's built Target by a relative path
//      (`../../../plugin-dsh-workspace-graph/Target/Library.js`,
//      `../../../../hook-dsh-doc-suggester/Target/Library.js`). The per-token
//      list above only knew the factory and the two libs, so ten imports kept
//      the Classic directory name and the ETS build failed on a missing module.
//      The rule matches a run of `../` immediately followed by a family token
//      and prefixes it - a repo-root fixture path (`Classic/packages/
//      hook-dsh-x/...`) is NOT preceded by `../` and stays Classic.
//      DELIBERATELY NOT SUBSTITUTED: `export const name`, the cordis `id:` and
//      the log-line prefixes. They are the Classic module identity; the ledger
//      strings stay byte-identical across the two trees.
//   4. THE HAND-PORT PROTECTION (two halves):
//      a. THE EXCLUSION LIST - the hand-ported ETS-only files (the batch-edit
//         clock shield, Source/Function/Shield.ts + ShieldSync.ts) have no
//         Classic counterpart and are NEVER written or deleted here; the
//         in-flight workspace-graph seam is excluded so the generator cannot
//         race another lane's write.
//      b. THE POST-GENERATION PATCHES - the files that REFERENCE the shield
//         (batch-edit Apply.ts / Ops.ts) DO come from Classic (they carry the
//         wave's other changes), so the shield wiring is re-applied after the
//         substitution. Every patch is a literal Find/Replace with a fail-loud
//         assertion (exactly one occurrence, or the run aborts): a Classic
//         change to the anchor is a build-time error here, never a silent loss
//         of the hand-port. The patch table is the ONE home of the hand-port;
//         a manual edit of the generated file would be lost on the next run.
//
// THE CLASSIC-ONLY SERVICE: the regenerated doc-suggester/edit-suggester Test
// harnesses import the REAL `plugin-dsh-pattern` service. That candidate has NO
// ETS twin (POC-LEDGER.md records pattern/batch-decision as Classic-only), and
// the ETS tree must never mix the Classic dependency graph. The adaptation is
// explicit: the two Learning-Loop folders (the service-present path) are
// excluded from the walk, and a patch table drops the import/helper from the
// harness so every ETS folder runs the plugin's documented in-memory fallback.
// A twin that needs an ETS-specific adaptation gets it HERE, never as a hand
// edit the next generation would lose.
//
// THE TWO NEW LIBRARIES: `ets-lib-dsh-trace` and `ets-lib-dsh-pack` are twins
// of the Classic `lib-dsh-trace` / `lib-dsh-pack` (the wave's two new pure
// libraries). They are MANIFEST entries in the 2-planned tier, so the ordinary
// walk generates them - no special case in this script. Their anatomy is the
// Classic one under the substitutions (package.json identity + description,
// Configuration/, Source/, tsconfig.json, README/SCHEME).
//
// Run once from the monorepo root AFTER the Classic smoke pass has landed the
// Test trees (the twins carry the parity smokes). Never hand-edit Target/.
import Twin from "./Function/Twin.mjs";
import Twins from "./Variable/Twins.mjs";

/** `--check`: verify every twin is exactly the generator's output (the
 *  substituted Classic text plus the patch table), write NOTHING, and exit
 *  nonzero on any stale/missing/extra file. This is the wave-5 staleness
 *  arbiter (the brief's per-package diff), kept here so a future lane never
 *  duplicates the substitution in a scratch script. */
const CheckOnly = process.argv.includes("--check");

let Generated = 0;
let Skipped = 0;
let Protected = 0;
let Patched = 0;
const Missing = [];
const Stale = [];

for (const Entry of Twins) {
	const Result = Twin(Entry, CheckOnly);
	Generated += Result.Generated;
	Skipped += Result.Skipped;
	Protected += Result.Protected;
	Patched += Result.Patched;
	Missing.push(...Result.Missing);
	Stale.push(...Result.Stale);
}

if (CheckOnly) {
	console.log(`checked ${Twins.length} twins: ${Stale.length} stale`);
	for (const Line of Stale) {
		console.log(`  ${Line}`);
	}
	if (Missing.length > 0) {
		console.log("MISSING CLASSIC SOURCES:");
		for (const Line of Missing) {
			console.log(" ", Line);
		}
	}
	process.exit(Stale.length > 0 || Missing.length > 0 ? 1 : 0);
}

console.log(
	`generated ${Generated} files across ${Twins.length} twins; ` +
		`${Protected} hand-ported files protected (excluded from the walk); ` +
		`${Patched} patches applied`,
);
if (Missing.length > 0) {
	console.log("MISSING CLASSIC SOURCES:");
	for (const Line of Missing) {
		console.log(" ", Line);
	}
}
