// One-shot generator: the ETS twins of the PLANNED Classic packages.
// The precedent: Maintain/generate-ets-live-containers.mjs - the mirror under
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
import * as FS from "node:fs";
import * as Path from "node:path";

const Manifest = JSON.parse(FS.readFileSync("Temporary/npm-bootstrap/MANIFEST.json", "utf8"));

/** The MANIFEST entry list (tolerate an array or a {packages} object). */
const Entries = Array.isArray(Manifest) ? Manifest : (Manifest.packages ?? Manifest.entries ?? []);

/** The twins to generate: the ets-* entries in the planned/candidate tiers. */
const Twins = Entries.filter(
	(Entry) =>
		typeof Entry.name === "string" &&
		Entry.name.startsWith("@playform/ets-") &&
		["2-planned", "3-candidates"].includes(Entry.tier),
);

/** The text substitutions: the ETS dependency names, the ETS ledger paths and
 *  the ETS sibling paths. THREE SURFACES, THREE RULES, and the module identity
 *  is deliberately OUTSIDE all three:
 *  1. the quoted package names (`"@playform/hook-dsh-x"`) and the bare
 *     dependency tokens (`lib-dsh-core`, `plugin-dsh-factory`, the two new
 *     libraries) - the npm identity;
 *  2. the ledger path at the `.dsh/playform/` boundary - the twin's OWN ledger
 *     file (`~/.dsh/playform/ets-<package>.log`), never the Classic one;
 *  3. the RELATIVE sibling import (`../../../plugin-dsh-workspace-graph/
 *     Target/Library.js`) - the wave-5 defect the per-token list missed. The
 *     rule matches a run of `../` immediately followed by the family token, so
 *     a repo-root fixture path (`Classic/packages/hook-dsh-x/...`) is never
 *     touched.
 *  NOT substituted, on purpose: the `export const name` value, the loader
 *  `id:` in cordis.patch.yml, and every log-line prefix. They are the CLASSIC
 *  module identity (the ledger strings stay byte-identical); only the npm
 *  package identity and the ledger FILE name belong to the twin.
 *  THE ORDER IS LOAD-BEARING: `lib-dsh-core` renames to `ets-base-dsh`, so the
 *  bare token rules run before the relative-path rule could see them. */
const Substitute = (Text) =>
	Text.replaceAll("lib-dsh-core", "ets-base-dsh")
		.replaceAll("plugin-dsh-factory", "ets-plugin-dsh-factory")
		.replaceAll("lib-dsh-trace", "ets-lib-dsh-trace")
		.replaceAll("lib-dsh-pack", "ets-lib-dsh-pack")
		.replaceAll(".dsh/playform/hook-dsh-", ".dsh/playform/ets-hook-dsh-")
		.replaceAll(".dsh/playform/plugin-dsh-", ".dsh/playform/ets-plugin-dsh-")
		.replaceAll(".dsh/playform/client-dsh-", ".dsh/playform/ets-client-dsh-")
		.replaceAll(".dsh/playform/lib-dsh-", ".dsh/playform/ets-lib-dsh-")
		.replaceAll('"@playform/plugin-dsh-', '"@playform/ets-plugin-dsh-')
		.replaceAll('"@playform/hook-dsh-', '"@playform/ets-hook-dsh-')
		.replaceAll('"@playform/client-dsh-', '"@playform/ets-client-dsh-')
		.replaceAll('"@playform/lib-dsh-', '"@playform/ets-lib-dsh-')
		.replaceAll(/((?:\.\.\/)+)(hook|plugin|client|lib)-dsh-/g, "$1ets-$2-dsh-");

/** The relative paths mirrored from the Classic package to the ETS twin. */
const Files = ["package.json", "tsconfig.json", "cordis.patch.yml", "README.md", "SCHEME.md"];

/** THE EXCLUSION LIST (the paths this script must never write). Three kinds:
 *  a. the hand-ported ETS-only files (the batch-edit clock shield,
 *     Source/Function/Shield.ts + ShieldSync.ts) have no Classic counterpart;
 *  b. the IN-FLIGHT LANE'S SEAM (the workspace-graph ledger append, which the
 *     concurrent lane is editing in the same working tree) - the generator
 *     must never race another lane's write, and the post-generation diff
 *     treats a diverged excluded file as that lane's, not as staleness;
 *  c. THE CLASSIC-ONLY DEPENDENCY (the two Learning-Loop folders). The
 *     regenerated Test harnesses import the REAL `plugin-dsh-pattern`
 *     service, and that candidate has NO ETS twin (POC-LEDGER.md: the
 *     pattern/batch-decision candidates are Classic-only). The ETS tree
 *     cannot mix the Classic graph, so the service-present folder is not
 *     generated; the twin's harness keeps the plugin's in-memory fallback
 *     path (the post-generation patch below). A folder exclusion ends with
 *     "/" and covers every file under it. */
const Excluded = new Map([
	[
		"ets-plugin-dsh-batch-edit",
		new Set(["Source/Function/Shield.ts", "Source/Function/ShieldSync.ts"]),
	],
	["ets-plugin-dsh-workspace-graph", new Set(["Source/Function/Append.ts"])],
	["ets-hook-dsh-doc-suggester", new Set(["Source/Test/Learning-Loop/"])],
	["ets-hook-dsh-edit-suggester", new Set(["Source/Test/Learning-Loop/"])],
]);

/** Is a relative path excluded - exactly, or under an excluded folder. */
const IsExcluded = (Exclusion, File) =>
	Exclusion.has(File) ||
	[...Exclusion].some((Path) => Path.endsWith("/") && File.startsWith(Path));

/** THE POST-GENERATION PATCHES (the hand-port's REFERENCING half): applied to
 *  the SUBSTITUTED text, after the mirror write. `Find` must occur exactly
 *  once or the run aborts - a moved anchor is a hard error, never a silent
 *  loss. Every entry names its reason so the table stays self-documenting.
 *  The table carries TWO kinds:
 *   a. the shield's referencing half (batch-edit Apply.ts / Ops.ts);
 *   b. the client bundle identity (the wave-5 K1 edge case): the build script
 *      passes the package name as an UNQUOTED shell argument to
 *      Maintain/Build-Client-Bundle.mjs, so the quoted-name rules cannot see
 *      it and the bundle's loader `id:` would stay Classic while the section's
 *      quoted `bundle:` field and the smoke's K1 assertion became ETS. The
 *      loader id must be the twin's package name; the patch is the ONE home of
 *      that identity, so a regeneration keeps it. */
const Patches = [
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Apply.ts",
		Reason: "the shield import (ShieldSync wraps the ledger append seam)",
		Find: 'import * as Machine from "./Machine.js";\nimport Tools from "./Tools.js";',
		Replace:
			'import * as Machine from "./Machine.js";\nimport ShieldSync from "./ShieldSync.js";\nimport Tools from "./Tools.js";',
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Apply.ts",
		Reason: "the shielded ledger sink (the factory's Append tracer samples Date.now)",
		Find: [
			"\t// The ledger sink every module receives (Factory.Append with the State",
			"\t// bound).",
			"\tconst Append = (Message: string): void => {",
			"\t\tFactory.Append(State, Message);",
			"\t};",
		].join("\n"),
		Replace: [
			"\t// The ledger sink every module receives (Factory.Append with the State",
			"\t// bound). The factory's append seam runs a spanned Effect whose tracer",
			"\t// samples the global Date.now internally - ShieldSync keeps those",
			"\t// internal samples out of the caller's deadline budget (Function/",
			"\t// ShieldSync).",
			"\tconst Append = (Message: string): void => {",
			"\t\tShieldSync(() => Factory.Append(State, Message));",
			"\t};",
		].join("\n"),
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Ops.ts",
		Reason: "the shield import for ApplyWrite",
		Find: 'import { Cells } from "./Present.js";',
		Replace: 'import { Cells } from "./Present.js";\nimport Shield from "./Shield.js";',
	},
	{
		Twin: "ets-plugin-dsh-batch-edit",
		File: "Source/Function/Ops.ts",
		Reason: "the shielded write/govern seam (ApplyWrite's awaited Effect spans)",
		Find: [
			"const ApplyWrite = async (",
			"\tState: State,",
			"\tPlan: Plan,",
			"\tExec: ToolRunContext | undefined,",
			"): Promise<string> => {",
			"\tconst Actor = { ...(Exec as object | undefined), govern: true };",
			"\tconst Outcome = await State.Factory.Write(State, Plan.target, Plan.after, {",
			'\t\tintent: { kind: "replaceIfVersion", version: Plan.cell.version ?? "" },',
			"\t\tactor: Actor,",
			"\t\tstash: true,",
			"\t\tsignal: Exec?.signal,",
			"\t});",
			"\tswitch (true) {",
			"\t\tcase GovernedBasenames.includes(Base(Plan.target.displayPath)):",
			"\t\t\tawait State.Factory.Govern(Plan.target, true, Actor, Outcome.version);",
			"\t\t\tbreak;",
			"\t}",
			"\treturn Outcome.version;",
			"};",
		].join("\n"),
		Replace: [
			"const ApplyWrite = async (",
			"\tState: State,",
			"\tPlan: Plan,",
			"\tExec: ToolRunContext | undefined,",
			"): Promise<string> =>",
			"\t// The factory's write/govern seams run spanned Effects whose tracer",
			"\t// samples the global Date.now internally - Shield keeps those internal",
			"\t// samples out of the commit deadline's budget (Function/Shield).",
			"\tShield(async () => {",
			"\t\tconst Actor = { ...(Exec as object | undefined), govern: true };",
			"\t\tconst Outcome = await State.Factory.Write(State, Plan.target, Plan.after, {",
			'\t\t\tintent: { kind: "replaceIfVersion", version: Plan.cell.version ?? "" },',
			"\t\t\tactor: Actor,",
			"\t\t\tstash: true,",
			"\t\t\tsignal: Exec?.signal,",
			"\t\t});",
			"\t\tswitch (true) {",
			"\t\t\tcase GovernedBasenames.includes(Base(Plan.target.displayPath)):",
			"\t\t\t\tawait State.Factory.Govern(Plan.target, true, Actor, Outcome.version);",
			"\t\t\t\tbreak;",
			"\t\t}",
			"\t\treturn Outcome.version;",
			"\t});",
		].join("\n"),
	},
	{
		Twin: "ets-client-dsh-workspace-live",
		File: "Source/prepublishOnly.sh",
		Reason: "the client bundle's loader id (the unquoted Build-Client-Bundle argument the quoted package rules cannot see)",
		Find: "node ../../../Maintain/Build-Client-Bundle.mjs . Source/Client.ts @playform/client-dsh-workspace-live",
		Replace:
			"node ../../../Maintain/Build-Client-Bundle.mjs . Source/Client.ts @playform/ets-client-dsh-workspace-live",
	},
];

/** THE CLASSIC-ONLY-SERVICE ADAPTATION (exclusion list kind c): the two
 *  suggester harnesses mirror the Classic harness minus the REAL pattern
 *  service, which has no ETS twin. The plugin probes `ctx.get("pattern")`
 *  optionally, so dropping the import and its helper leaves every ETS folder
 *  on the documented in-memory fallback - the plugin's own neutral path, not
 *  a fake. The Learning-Loop folder (the service-present path) is excluded
 *  above; the shared literals live here ONCE and patch both twins. */
const LearningSeams =
	"// THE LEARNING SEAMS (the D8 layer): `Home` is a fresh OS temp directory\n" +
	"// assigned to $HOME BEFORE any construction, so the optional pattern\n" +
	"// service's JSON fallback path (`~/.dsh/pattern/registry.json`) can never\n" +
	"// read or write the user's real home; `Pattern` builds the REAL\n" +
	"// PatternService from its built Target over a fake storage facility\n" +
	"// (`FakeStorage`, the authority/evidence fake-storage pattern: the open\n" +
	"// capture, the map-backed tables, the version fence), so the learning smokes\n" +
	"// exercise the service's real Record/Get/Put/Save semantics over a real KV\n" +
	'// domain, and a "reopen" is a second service over the same tables. A folder\n' +
	"// that never attaches a service gets the plugin's in-memory fallback - the\n" +
	"// neutral path every pre-learning folder runs on.";

const LearningSeamsEts =
	"// THE LEARNING SEAMS (the D8 layer): `Home` is a fresh OS temp directory\n" +
	"// assigned to $HOME BEFORE any construction, so the optional pattern\n" +
	"// service's JSON fallback path (`~/.dsh/pattern/registry.json`) can never\n" +
	"// read or write the user's real home. THE SERVICE ITSELF IS CLASSIC-ONLY:\n" +
	"// `plugin-dsh-pattern` is a Classic candidate with no ETS twin, so the ETS\n" +
	"// tree cannot mix that graph and NO ETS folder attaches it - every folder\n" +
	"// runs the plugin's in-memory fallback, the neutral path. `FakeStorage`\n" +
	"// stays as the shared fake-storage fixture (the Classic service-present\n" +
	"// folder uses it); the Learning-Loop folder is not generated (see the\n" +
	"// exclusion list), so the ETS harness is the mirror minus one import.";

const PatternHelper =
	"/**\n" +
	" * The REAL pattern service over a fake storage facility - the optional\n" +
	' * service the plugin probes with `ctx.get("pattern")`. Its own ledger is\n' +
	" * discarded (the learning assertions read Get/List, never the service's\n" +
	" * lines). Attach it to a Run with `Run.Context.pattern = Pattern(Store)`.\n" +
	" */\n" +
	"export const Pattern = (Store: any): any => {\n" +
	"\tconst Context: any = {\n" +
	"\t\tlogger: { info: () => undefined, warn: () => undefined },\n" +
	"\t\tget: (Name: string) => Context[Name],\n" +
	"\t\teffect: () => () => true,\n" +
	"\t\treflect: { provide: () => () => true },\n" +
	"\t};\n" +
	"\tContext.storageDomain = Store.facility;\n" +
	"\treturn new PatternService(Context, {});\n" +
	"};\n\n";

const SuggesterTwins = ["ets-hook-dsh-doc-suggester", "ets-hook-dsh-edit-suggester"];

const HarnessPatches = SuggesterTwins.flatMap((Twin) => [
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the Classic-only pattern-service import",
		Find: 'import PatternService from "../../../ets-plugin-dsh-pattern/Target/Library.js";\n',
		Replace: "",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the pattern service from the harness's exports",
		Find: "export { Plugin, Exports, PatternService };",
		Replace: "export { Plugin, Exports };",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "drop the Pattern helper (the service has no ETS twin)",
		Find: PatternHelper,
		Replace: "",
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "record the Classic-only service in the learning-seams comment",
		Find: LearningSeams,
		Replace: LearningSeamsEts,
	},
	{
		Twin,
		File: "Source/Test/Harness.ts",
		Reason: "record the Classic-only service in the fake-storage fixture comment",
		Find:
			" * the open capture, the map-backed tables, the version fence. The REAL\n" +
			" * PatternService opens a domain through it, so the learning smokes exercise\n" +
			' * the service\'s own Record/Put/Save and the real KV round-trip; a "reopen" is\n' +
			" * a second service over the SAME tables.",
		Replace:
			" * the open capture, the map-backed tables, the version fence. The Classic\n" +
			" * PatternService opens a domain through it; the ETS twin keeps the fixture\n" +
			" * (the harness stays a mirror) but has no service to attach, so no ETS\n" +
			" * folder uses it.",
	},
]);

Patches.push(...HarnessPatches);

/** Every file under a directory, recursively, relative to it. */
const Walk = (Root, Prefix = "") =>
	FS.readdirSync(Path.join(Root, Prefix), { withFileTypes: true }).flatMap((Dirent) => {
		const Relative = Path.join(Prefix, Dirent.name);
		return Dirent.isDirectory() ? Walk(Root, Relative) : [Relative];
	});

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

for (const Twin of Twins) {
	const TwinName = Twin.name.replace("@playform/", "");
	const ClassicName = TwinName.replace(/^ets-/, "");
	const From = Path.join("Classic/packages", ClassicName);
	const To = Path.join("EffectTS/packages", TwinName);

	if (!FS.existsSync(From)) {
		Missing.push(`${Twin.name} <- ${From}`);
		continue;
	}

	const Paths = [
		...Files.filter((File) => FS.existsSync(Path.join(From, File))),
		...Walk(From, "Configuration"),
		...Walk(From, "Source"),
	];

	const Exclusion = Excluded.get(TwinName) ?? new Set();

	// The expected twin: the substituted Classic text, then the patch table
	// applied IN MEMORY (so --check compares the same bytes the write emits).
	const Expected = new Map();
	for (const File of Paths) {
		if (IsExcluded(Exclusion, File)) {
			Skipped += 1;
			continue;
		}
		Expected.set(File, Substitute(FS.readFileSync(Path.join(From, File), "utf8")));
	}

	for (const Patch of Patches.filter((Entry) => Entry.Twin === TwinName)) {
		if (!Expected.has(Patch.File)) {
			throw new Error(`PATCH TARGET MISSING: ${TwinName}/${Patch.File} (${Patch.Reason})`);
		}
		const Text = Expected.get(Patch.File);
		const Occurrences = Text.split(Patch.Find).length - 1;
		if (Occurrences !== 1) {
			throw new Error(
				`PATCH ANCHOR FAILED: ${TwinName}/${Patch.File} (${Patch.Reason}) - ` +
					`expected 1 occurrence, found ${Occurrences}. Update the patch table.`,
			);
		}
		Expected.set(Patch.File, Text.replace(Patch.Find, Patch.Replace));
		Patched += 1;
	}

	// THE PROTECTION PROOF (both modes): every excluded FILE must still be
	// there (the walk never writes them, and nothing deletes them) - a missing
	// one means the hand-port was lost. An excluded FOLDER is the opposite
	// proof: it must be ABSENT (a stale copy would ship the Classic-only
	// dependency the exclusion exists to keep out).
	for (const File of Exclusion) {
		if (File.endsWith("/")) {
			if (FS.existsSync(Path.join(To, File))) {
				throw new Error(
					`EXCLUDED FOLDER PRESENT: ${TwinName}/${File} - remove the stale copy.`,
				);
			}
			continue;
		}
		if (!FS.existsSync(Path.join(To, File))) {
			throw new Error(`HAND-PORT LOST: ${TwinName}/${File} is missing after the run.`);
		}
		Protected += 1;
	}

	for (const [File, Text] of Expected) {
		const Target = Path.join(To, File);
		if (CheckOnly) {
			const Actual = FS.existsSync(Target) ? FS.readFileSync(Target, "utf8") : null;
			if (Actual !== Text) {
				Stale.push(`${TwinName}/${File} (${Actual === null ? "missing" : "diff"})`);
			}
			continue;
		}
		FS.mkdirSync(Path.dirname(Target), { recursive: true });
		FS.writeFileSync(Target, Text);
		Generated += 1;
	}

	if (CheckOnly) {
		const Extra = [...Walk(To, "Configuration"), ...Walk(To, "Source")].filter(
			(File) => !Expected.has(File) && !IsExcluded(Exclusion, File),
		);
		for (const File of Extra) {
			Stale.push(`${TwinName}/${File} (extra)`);
		}
	}
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
