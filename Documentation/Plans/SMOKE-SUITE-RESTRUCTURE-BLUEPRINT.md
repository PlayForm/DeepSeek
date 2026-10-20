# SMOKE-SUITE-RESTRUCTURE-BLUEPRINT

Status: BLUEPRINT (explorer output, 2026-10-19). Implementing coder lanes execute this
verbatim. Spec: Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-NOTE.md (read in full).
Reference studied: /Users/nikola/Developer/Application/CodeEditorLand/Land/Element/Output
(Source/prepublishOnly.sh, Source/Run.sh, Source/ESBuild.ts, Source/ESBuild/Output.ts,
package.json scripts). No code was changed by this exploration; no tests were run.

Conventions for this document: tabs for indentation, ASCII only. The coder lanes copy
the templates byte-for-byte, then substitute the marked placeholders (`<Bundle>`,
`<TestName>`, tree imports).

---

## 1. THE INVENTORY

### 1.1 Packages (28 total, all at 0.0.1 under @playform)

Classic tree (14, in `Classic/packages/`):

| # | Package | Has smoke? |
|---|---|---|
| 1 | hook-dsh-core | yes (`core-smoke.mjs`) |
| 2 | plugin-dsh-factory | yes (`factory-smoke.mjs`) |
| 3 | hook-dsh-cargo-governor | yes (`cargo-smoke.mjs`) |
| 4 | hook-dsh-package-governor | yes (`governor-smoke.mjs`) |
| 5 | hook-dsh-package-pinner | yes (`pinner-smoke.mjs`) |
| 6 | hook-dsh-normalize-dash | yes (`normalize-dash-smoke.mjs`) |
| 7 | hook-dsh-normalize-quotes | yes (`quotes-smoke.mjs`) |
| 8 | hook-dsh-normalize-ellipsis | yes (`ellipsis-smoke.mjs`) |
| 9 | hook-dsh-normalize-spaces | yes (`spaces-smoke.mjs`) |
| 10 | hook-dsh-normalize-invisible | yes (`invisible-smoke.mjs`) |
| 11 | hook-dsh-normalize-fullwidth | yes (`fullwidth-smoke.mjs`) |
| 12 | hook-dsh-normalize-file | yes (`normalize-file-smoke.mjs`) |
| 13 | hook-dsh-ccr | yes (`ccr-smoke.mjs`) |
| 14 | hook-dsh-tool-coach | yes (`tool-coach-smoke.mjs`) |

EffectTS tree (14, in `EffectTS/packages/`): the exact ets- twins of all 14 above
(`ets-hook-dsh-core`, `ets-plugin-dsh-factory`, `ets-hook-dsh-cargo-governor`,
`ets-hook-dsh-package-governor`, `ets-hook-dsh-package-pinner`, the 7
`ets-hook-dsh-normalize-*`, `ets-hook-dsh-ccr`, `ets-hook-dsh-tool-coach`), all with a
smoke, PLUS:

| 15th | ets-base-dsh | NO smoke of its own. Its exports (Activate/Update/Block/Chunk/
StreamGate, the Effect services/layers) are exercised from the ets core smoke's additive
sections via `../packages/ets-base-dsh/Target/Library.js`. The restructure gives it a
`Source/Test/` tree that tests ITS OWN surface directly (the R1 additive sections move
home): 2 test folders minimum (`Stream-Gate/`, `Update-Envelope/`), re-homed from the
ets core smoke, plus the shared Effect parity assertions. This is the one package where
the ETS test tree is NOT a byte-twin of a Classic tree - the blueprint marks its lane
accordingly (lane L6).

### 1.2 Suites (42 total: 21 per tree, mechanically 14 + wiring 7)

Per-tree suite list (`Classic/smokes/` and `EffectTS/smokes/` are name-identical).
Baseline printed counts (README + note; the coder lanes re-read each suite's final
`PASS`/`checks` line and record it as the lane baseline before splitting):

| Suite | Baseline | Harness pattern | Natural decomposition (folders) |
|---|---|---|---|
| core-smoke | 14 `ok` checks | pure unit: NO fake ctx, NO factory; real built Target only; one tmpdir fs fixture for Policy | 8 Classic / 10 ETS (ETS adds Stream-Gate + Update-Envelope) |
| factory-smoke | 34 checks | real FactoryClass instantiated against stub ctx; State builder; registers one loader/volatile-update listener (line ~1051) | 6 |
| governor-smoke | 78 | fake ctx + real factory + real governor Target; ledger byte-strings; policy files | 7 |
| pinner-smoke | 32 | fake ctx + real factory; REAL-token fs (the version guards exercised with actual tokens - the pinning writes go through the capturing fs with real version objects) | 6 |
| cargo-smoke | 62 | fake ctx + real factory; journal file fixtures in /tmp; ledger strings | 6 |
| normalize-dash-smoke | 184 PASS (fresh 2026-10-19 - the blueprint's 132 was STALE; the +52 is the raw-write TOOL surface: Run 8 tool registration+exec 23, Run 9 per-call flavor selection 10, Run 10+addendum govern path 19) | fake ctx (on/get/logger/tools/fs/waterfall/emit capture) + REAL factory + real dash apply; live-volatile flips (loader/volatile-update dispatches: Run V, S5, O2, O10) | 8 (the 7 exact names of 1.4 + ONE new `Raw-Write-Tool/` folder for the post-blueprint tool surface; sums == 184 exactly) |
| quotes-smoke | 62 | fake ctx + real factory; byte-twin of fullwidth/ellipsis/spaces/invisible | 5 |
| ellipsis-smoke | 62 | same pattern | 5 |
| spaces-smoke | 62 | same pattern | 5 |
| invisible-smoke | 62 | same pattern | 5 |
| fullwidth-smoke | 62 | same pattern | 5 |
| normalize-file-smoke | 112 PASS (fresh 2026-10-19 - the blueprint's 71 was STALE; the +41 = Run V volatile flip 9 + Run F files scope gate 3 + Run O overpass 29) | fake ctx + real factory; real-token fs for the file rewriting (the tool writes actual bytes through the fs seam) | 7 (Config-And-Registration 18, Read-Write-Pipeline 24, No-Op-Rule 11, Error-Paths 10, Presenters 8, Volatile-Live-Flip 12, Overpass 29; sums == 112 exactly) |
| ccr-smoke | 146 | fake ctx + real factory; live-volatile dispatches (P10 loader/volatile-update refresh); journal compaction fixtures; strict marker parsing | 7 (split in 1.4) |
| tool-coach-smoke | 129 | fake ctx + real factory; tool registry seam; coach lines | 6 |
| scratch-profile-smoke | wiring | SELF-SKIPS without DSH_TEST_SCRATCH (env-gated at top) | 2 |
| profile-assembly-smoke | wiring | self-skip; DSH_TEST_SCRATCH home | 2 |
| patch-layer-smoke | wiring | self-skip | 2 |
| live-ledger-smoke | wiring | self-skip | 2 |
| governed-write-smoke | wiring | self-skip | 2 |
| refusal-path-smoke | wiring | self-skip | 2 |
| introspection-smoke | wiring | self-skip | 2 |

Wiring totals: the 7 wiring suites x 2 trees = 14 folders-pairs; they run under
Maintain/Run-Wiring.mjs (the live ~/.dsh battery), and self-skip inside Run-Smokes.
Their per-folder split stays shallow (2 folders each: "skip-guard + harness" and "the
live assertions") - they are env-gated and must NOT be forced green in the aggregate.

Total proposed test folders: 2 x (8+10+6+7+6+6+7+5x4+6+7+6+2x7) = 2 x 124 = 248 folders
(124 per tree), each with one singular TS test file + one README.md. Coder lanes may
adjust +/-1 folder per suite as the assertion groups fall out; the floor is 3, the
ceiling 8 per suite (per the spec).

### 1.3 The parity discipline, confirmed by diff

- `quotes/fullwidth/ellipsis/spaces/invisible/pinner/normalize-file` smokes are
  BYTE-EQUAL between the trees except the import lines: `hook-dsh-*` -> `ets-hook-dsh-*`,
  `plugin-dsh-factory` -> `ets-plugin-dsh-factory` (verified: fullwidth diff = 2 lines,
  quotes diff = 3 lines, pinner diff = 18 lines, cargo diff = 12 lines - all import/
  comment-path lines only).
- The larger suites (core, factory, governor, ccr, tool-coach, cargo) are byte-equal in
  the Classic-arbiter sections PLUS additive ETS-only sections (the Stream pipeline, the
  typed envelope, the parallel marker). The ETS core smoke additionally imports from
  `ets-base-dsh/Target/Library.js` and from `effect`.
- The restructure preserves this exactly: each ETS test file is the Classic test file
  with ONLY the tree-identity substitutions applied. The lane law: generate the ETS file
  from the Classic file mechanically, then append the additive ETS sections where the
  suite has them.

### 1.4 Exact folder splits for the three suites read in full

**core-smoke (Classic; 700 lines, 14 `ok` groups).** Folder -> assertion groups:

1. `Data-Lists/` - Section deepEqual (the 4 npm dependency sections); Default deepEqual
   (the 6 exclusion segments). 2 checks.
2. `Suppress/` - the three suppression-line shapes (continuation error, listener string
   cause, empty-message error composes the line). 1 ok group.
3. `Policy/` - absent file -> Defaults + the two byte-identical lines; readable file ->
   its policy + silence; unreadable file -> Defaults + the unreadable diagnostic; the
   Quiet form skips every diagnostic. 4 ok groups. (Uses the tmpdir fixture; the folder
   README documents the two exact ledger strings.)
4. `Refusal/` - sections-only change allowed + no line; non-dependency change refused +
   the byte-identical refusal line. 1 ok group.
5. `Tables/` - the four character-class regex sources verbatim (Dashes, Ellipsis,
   Spaces, Invisible) + the flags; the Quotes map exact contents; the Fullwidth
   computed-94-entry table. 2 ok groups.
6. `Replace/` - class->string replacer: match+count, count 0, literal `$&` insertion,
   lastIndex untouched. 1 ok group.
7. `Replace-Map/` - char->char map: Quotes flavor, Fullwidth flavor, literal values,
   count 0. 1 ok group.
8. `Chunk/` - the entire dispatch section (lines 252-522): text-delta rewrite + identity
   passthrough; tool-call-delta passthrough; tool-args gate ON/OFF; the edit exemption;
   the raw-write exemption; the normalize-file exemption; the per-call raw marker
   (strip, empty-object, whitespace variant, subsequent-delta anchored, flag-OFF still
   strips); reasoning gate; block-start/usage/finish passthroughs; block-end
   text/reasoning/thinking; the second-flavor injection.
9. `Block/` - the block normalizer (lines 524-697): text/reasoning/thinking; tool-call
   gate ON/OFF; the three exemptions; the raw marker (empty, flag-OFF, Raw-ignored for
   text); image passthrough.
10. ETS-only additions: `Stream-Gate/` (the real Stream transformer equivalence) and
    `Update-Envelope/` (the typed Dispatch/Settle effects) - re-homed from the ets core
    smoke's R1 sections.

**normalize-dash-smoke (1547 lines, 132 PASS).** Folder -> assertion groups:

1. `Config-And-State/` - config defaults (normalizeReasoning=true,
   normalizeToolArguments=false); llm/stream listener registered; state carries the REAL
   factory instance; volatile unwrap (log cell -> State.Enabled=true).
2. `Stream-Contract/` - next() called once synchronously before any upstream iteration;
   options deep-frozen; chunk order/count preserved; the passthrough identities
   (block-start, usage, finish); the rewrite groups (text-delta -> the count line,
   reasoning, block-end fields); the exact ledger strings for each rewrite.
3. `Scopes/` - scopes.conversation off -> text-delta by identity; scopes.reasoning off;
   toolInput both off -> identity; the S5 volatile scope flip -> the NEXT stream's gate
   changes without remount.
4. `Tool-Args-Exemptions/` - plain fields ToolArgs=true when normalizeToolArguments=on;
   the edit/raw-write/normalize-file exemptions; the raw-marker strip variants.
5. `Overpass/` - the two overpass arms (post-execute prepended, pre-step default order);
   N=0 -> no ledger line (no-op rule); the batch arms; the O2/O10 volatile flips
   (toolResults/batch scope ON -> normalization + exact ledger).
6. `Journal-And-Custom/` - the custom-replacement run adds its 'normalized' journal
   record; the journaling mechanics; transport boom (the error path).
7. `Volatile-Live-Flip/` - the P10 group: exactly one activation line after the mount;
   State object identity preserved (no rebuild); still exactly one activation line (NO
   remount, no re-apply); the flipped stream added NO activation line; the flipped
   stream still writes its normal count line. (Run V: `Listeners["loader/volatile-update"]
   ([["replacement"]])` dispatch shape.)

**ccr-smoke (1114 lines, 146 PASS).** Folder -> assertion groups:

1. `Config-And-Activation/` - the volatile-cell shape (log/logFile/multipliers/
   thresholdBytes/previewMaxChars arrive as `{ get }`); every config default
   (thresholdBytes=2048, inlineThresholdBytes=1024, autoExpand=true, autoExpandLimitBytes
   =102400, compressFailures=false, previewMaxChars=240, ttlSeconds=3600,
   storeBudgetBytes=268435456, journalPath='', contextEngine=false,
   contextEngineThresholdPct=30, protectFirstTurns=2, protectLastTurns=4); the
   activation posture (bundle 0.0.1 line; the listeners set).
2. `Run-One-State/` - exactly one tool registered; the tool shape; State.Factory ===
   Furnace; the volatile unwraps (Enabled=true, Threshold=2048); State.Module === 'ccr';
   the store memory-only by default; State.Targets.length === 8; the listener set
   includes tools/post-execute + the State builder's P10 loader/volatile-update refresh.
3. `Engine-Flag-Off/` - Run 10: EngineRuntime undefined; NO agent/pre-step listener (the
   extra listener is P10); post-execute traffic leaves no engine traces.
4. `Engine-Flag-On/` - the agent/pre-step + tools/post-execute posture; the engine
   runtime built; the protective zones (protectFirstTurns/protectLastTurns).
5. `Retrieve-And-Marker/` - ccr_retrieve registration; the marker parses strictly
   (24-hex hash, type, size); out-of-range start clamps to an empty slice; auto-expand:
   the entry still retrievable by hash; the exact retrieved text/ledger strings.
6. `Journal-Compaction/` - the journal boot compaction edges, including Edge 3: a
   MISSING journal file is not created on boot (memory-only).
7. `Volatile-Refresh/` - the P10 volatile-update dispatch behavior on the ccr State
   (the config-flip applied to the NEXT call without remount), plus the engine-ON
   variant of the refresh line.

---

## 2. THE TEMPLATES (byte-ready)

Location law: each plugin package gets `Source/Test/<TestName>/Test.ts` +
`Source/Test/<TestName>/README.md`. Shared harness code lives in
`Source/Test/Harness.ts` (NOT a test folder; no README needed beyond a header comment)
so the fake-ctx builder is written ONCE per package and imported by every test folder.
The ETS tree's Harness.ts is the Classic Harness.ts with the same tree-identity
substitutions.

### 2.1 The TS test file skeleton

```ts
// Source/Test/<TestName>/Test.ts - one singular test: <one-line intent>.
// Runs standalone (`node Target/Test/<TestName>/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` imports runTest).
import assert from "node:assert/strict";
import { Check, MakeContext, Furnace } from "../Harness.js";
// The REAL built entry of THIS bundle. This same relative specifier is valid
// at type-check time (Source/Test/<Name>/ -> ../../Target) and at runtime
// (Target/Test/<Name>/ -> ../../Target): esbuild keeps imports external
// (bundle: false), so the depth is preserved by the mirrored outbase.
import Plugin from "../../Target/Library.js";
// Cross-bundle imports use the same rule, e.g. from
// Source/Test/<Name>/ and Target/Test/<Name>/ both resolve to the factory:
// import FactoryClass from "../../../plugin-dsh-factory/Target/Library.js";
// [ETS tree substitution: the import paths become
//  "../../Target/Library.js" unchanged for the OWN bundle, and
//  "../../../ets-plugin-dsh-factory/Target/Library.js" for the factory;
//  every OTHER cross-bundle path gains the `ets-` prefix.]

export const runTest = async (): Promise<number> => {
	let Pass = 0;
	let Fail = 0;
	// The nested assertion hierarchy: the scenario tree encoded as nested
	// blocks, each leaf a byte-identical assertion from the source suite.
	const Group = "<top-level scenario>";
	{
		const Sub = "<sub-scenario>";
		{
			Check(Pass, Fail, () =>
				assert.equal(/* byte-identical ledger string assertion */),
			);
		}
	}
	// ... every leaf MUST be exercised (the vacuously-green guard: the
	// runner asserts the PASS count equals the expected count below).
	if (Fail !== 0) {
		throw new Error(`<TestName>: ${Fail} failed assertions`);
	}
	return Pass;
};

// Standalone entry: `node Target/Test/<TestName>/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - <TestName>`);
}
```

The aggregate-run contract: the main Smoke file imports `{ runTest }` from the compiled
module and awaits it; the returned number is the folder's PASS count; a throw is a
failure. The per-folder README records the folder's EXPECTED PASS count so the runner
(and the lane acceptance check) can compare counts, never fewer.

Harness.ts exports (the capture seams from the current smokes, verbatim):

```ts
// Source/Test/Harness.ts - the fake ctx + the real factory, ONCE per package.
export const Check = (Pass: { n: number }, Fail: { n: number }, Assert: () => void) => {
	// increment + print PASS/FAIL exactly like the current smokes
};
export const MakeContext = (Raw: unknown) => {
	// the fake ctx: on() captures listeners + options (returns () => true),
	// get() serves the REAL factory for "pluginFactory" and throws otherwise,
	// logger captures info/warn, tools/fs/waterfall/emit capture their seams.
};
export const Furnace = /* the real FactoryClass instance, constructed once */;
```

Note: objects must be passed by reference for the counter (`{ n: number }`) or the
helpers return a counter object; the coder lane picks one shape and uses it uniformly.
The printed line format stays `PASS - <message>` / `FAIL - <message>` (byte-compatible
with today's output).

### 2.2 The per-test-folder README.md template

```md
# <TestName>

What this test verifies.

## Intent

<One paragraph: the behavior under test and why it is its own folder.>

## Scenario

<The nested assertion hierarchy, as a tree: the groups and the leaves, in order.>

## Fixtures

<The fake-ctx seams used, the tmp/journal fixtures created and their paths, the
config objects passed to apply().>

## Expected ledger strings (byte-exact)

<Every ledger/log line the test asserts, quoted exactly, one per line. These
are the contract - they may change ONLY when the module's identity changes.>

## Edge cases

<The boundaries: count-0 passthroughs, flag-OFF variants, clamps, absent files.>

## Expected count

<PASS count> PASS.
```

### 2.3 prepublishOnly.sh (per package, at the package root)

```sh
#!/usr/bin/env bash
# Two-step build, mirroring Land/Element/Output/Source/prepublishOnly.sh:
# multiple Build invocations in one script, one per source tree.
# ORDER IS MANDATORY: the plugin build FIRST, the test build SECOND.
# The plugin ESBuild config's Target plugin WIPES outdir "Target" recursively
# on start; running the test build first would have its output destroyed.
# The test config wipes only Target/Test, so it is safe last.
# THE NEGATION IS MANDATORY (trap 11): 'Source/**/*.ts' matches the Test tree
# (fast-glob); the second positional pattern excludes it (verified 2026-10-19:
# 28 -> 19 files on the core package). Without it the plugin build fails on
# test-only syntax and would ship Test output inside Target.

Build "Source/**/*.ts" "!Source/Test/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--TypeScript Configuration/TypeScript.noemit.json

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts

node Target/Test/Harness.js --selfcheck || exit 1
```

(The `--selfcheck` line is optional-but-recommended: Harness.ts gets a tiny standalone
guard that exits 0 if imported as a library, 1 if run directly with a broken seam; the
coder lane may drop the line. The `--TypeScript` flag matches the family's noemit
type-check convention; if the current package script does not pass it, keep parity with
what the package does today and add the flag in the same lane as the tsconfig change -
never silently.)

### 2.4 Run.sh (--Watch dev twin)

```sh
#!/usr/bin/env bash
# Dev twin: watch both trees. The plugin build watches Source, the test build
# watches Source/Test. Run a single test: node Target/Test/<TestName>/Test.js
Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild.ts \
	--Watch

Build "Source/Test/**/*.ts" \
	--ESBuild Configuration/Test-ESBuild.ts \
	--Watch
```

Note: with `--Watch` the two Builds run sequentially in one shell; if the family's
Build tool blocks on watch, split into two backgrounded invocations (`... --Watch &` /
`wait`) - the coder lane verifies the tool's watch semantics once and keeps the script
shape. (Land/Element's Run.sh passes `--Watch` on the LAST Build only; mirror that if
the tool supports one watcher per process: first Build without --Watch, second with.)

### 2.5 The Test ESBuild config (Configuration/Test-ESBuild.ts)

```ts
import type { BuildOptions, Plugin } from "esbuild";

/**
 * Test ESBuild config: compiles Source/Test/**/*.ts to Target/Test/,
 * one output file per source file (bundle: false, imports external), so
 * each test folder runs standalone and the aggregate imports the modules.
 * Wipes ONLY Target/Test (never the whole Target - the plugin build owns
 * that and runs BEFORE this step). Not minified; sourcemaps on for the
 * standalone runs.
 */
export default {
	color: true,
	format: "esm",
	logLevel: "debug",
	metafile: false,
	minify: false,
	outdir: "Target/Test",
	outbase: "Source/Test",
	platform: "node",
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: true,
	sourcemap: true,
	plugins: [
		{
			name: "Target-Test",
			setup({ onStart, initialOptions: { outdir } }) {
				onStart(async () => {
					try {
						outdir
							? await (await import("node:fs/promises")).rm(outdir, {
									recursive: true,
								})
							: {};
					} catch (_Error) {
						console.log(_Error);
					}
				});
			},
		} as Plugin,
	],
} satisfies BuildOptions as BuildOptions;
```

If the twin-file convention applies here too (the build loader swaps
Configuration/ESBuild.ts -> ESBuild.js), the lane adds the compiled
`Configuration/Test-ESBuild.js` twin the same way the plugin configs carry one - check
one existing package's Configuration/ESBuild.js and mirror its header.

### 2.6 .npmignore (belt-and-braces; the `files` field is the primary gate)

Every package already ships `.npmignore` (verified in all sampled packages) excluding
`Source/`, `Configuration/`, docs, etc. ADD two lines to the existing file (do not
replace it):

```
Source/Test/
Target/Test/
```

The `files` field (`["Target", "README.md", ...]`) already excludes Source/Test; the
Target/Test exclusion is REQUIRED because `files: ["Target", ...]` would ship the
compiled tests inside Target. Acceptance proves it with a packed-install check
(`npm pack` + list the tarball; zero Test paths).

### 2.7 package.json script wiring

```json
"scripts": {
	"prepublishOnly": "sh prepublishOnly.sh",
	"Run": "sh Run.sh"
}
```

(The existing `prepublishOnly` value `Build 'Source/**/*.ts' --ESBuild
Configuration/ESBuild.ts` is REPLACED by the sh script, which contains that same Build
plus the test step - mirroring Land/Element's `"prepublishOnly": "sh
Source/prepublishOnly.sh"`.) The monorepo `pnpm run build:classic` /
`build:effect-ts` scripts keep working unchanged (they run the packages'
prepublishOnly with `--workspace-concurrency=1` - keep serialized; concurrent builds
race the shared Targets AND now also the per-package Target/Test wipes).

---

## 3. THE AGGREGATE-RUNNER INTEGRATION

`Maintain/Run-Smokes.mjs` changes:

1. Keep the CURRENT pass (the `.mjs` suites) during the migration: glob
   `Classic/smokes/*-smoke.mjs` + `EffectTS/smokes/*-smoke.mjs`, spawn each, exit
   non-zero on first failure - unchanged semantics, streaming output preserved.
2. Add the NEW pass: for each package with a `Target/Test/` directory, enumerate
   `Target/Test/*/Test.js` (sorted), spawn `node <file>` per test with stdio inherit,
   collect the printed `N PASS - <TestName>` line, and compare N against the folder
   README's expected count (a mismatch is a failure even if exit 0 - the vacuously-green
   guard). Then import-based aggregation is possible (`await import(...); await
   runTest()`), but SPAWNING is the recommended default: it preserves today's
   isolation (a crashing test does not kill the runner), the streaming output, and the
   exit-code semantics of the current loop. Import-based (`runTest`) is the fallback
   for lanes that need shared in-process state; do not mix the two modes for one tree.
3. The final line keeps the same shape: `All <n> smoke suites passed (...)` where n
   counts the per-test folders (plus any remaining `.mjs` suites). The baseline to
   compare: today's runner prints "All 42 smoke suites passed" (the note's "41" is
   stale - recount at implementation time; `ls */smokes/*-smoke.mjs | wc -l` = 21 per
   tree). The arbiter law: the SUM of per-folder PASS counts per suite must equal the
   suite's recorded baseline (e.g. normalize-dash 132, ccr 146) - never fewer, and any
   growth is additive coverage recorded in the lane handoff.
4. `Maintain/Run-Wiring.mjs` keeps its own explicit suite list; if the wiring suites are
   split into folders, update its `WiringSuites` array to the new folder paths in the
   same lane - the wiring counts (never the 733/746 mechanics numbers) remain its
   arbiter.
5. Fallback for incremental migration: keep the old `.mjs` suite as a THIN AGGREGATOR
   that imports the migrated folders' `runTest` exports and asserts the sum equals the
   baseline; the runner's current glob keeps passing unchanged while the folders
   accrete. Remove the thin aggregator only when the LAST folder of that suite lands.

---

## 4. THE PILOT RECOMMENDATION

Convert **`hook-dsh-core` + `ets-hook-dsh-core`** end-to-end first.

Justification: the core smoke is the only suite with NO harness wiring (pure unit
imports from one built Target), so the pilot exercises the entire mechanical surface -
folder creation, the Test ESBuild config, the two-step sh scripts, the standalone/aggregate
run contract, .npmignore, package.json rewiring, the parity substitution - with ZERO
fake-ctx risk and the smallest blast radius; yet it still spans the hard cases (a
tmpdir-fs folder in Policy, the deeply nested Chunk/Block exemption tree, and the ETS
tree's additive Stream/Envelope sections that prove the ETS-only-folder rule and the
ets-base-dsh import path). Once the pilot is green under both `node
Target/Test/<Name>/Test.js` and the aggregate runner, every other lane repeats the same
mechanics with only the assertion-content work differing.

---

## 5. THE FAN-OUT CLUSTERING (the remaining 13 pairs -> 6 lanes)

Order law: the factory + core BEFORE the consumers (the consumers' tests instantiate the
REAL factory from its built Target; the family builds serialized
`--workspace-concurrency=1` for the same reason). Within a lane, build/convert in the
listed order.

- **L1 - normalize flavors A (mechanical, byte-twins):** normalize-quotes,
  normalize-ellipsis, normalize-spaces, normalize-invisible, normalize-fullwidth
  (5 pairs). All five suites are byte-equal twins with the same 5-folder split shape;
  one lane, one pass, the highest confidence.
- **L2 - normalize flavors B:** normalize-dash (the 132-PASS suite, 7 folders, live
  volatile flips) and normalize-file (71, real-token fs, 6 folders). Dash after File or
  dash first - they share the raw-marker/exemption assertion families; keep them in one
  lane so the exemption READMEs stay consistent.
- **L3 - governance trio:** package-governor (78), package-pinner (32, real-token fs),
  cargo-governor (62). Governor first, then pinner, then cargo (the cargo suite's
  journal fixtures lean on the governor's step vocabulary).
- **L4 - factory + ccr:** plugin-dsh-factory (34; the volatile-update State-builder
  listener lives here) then hook-dsh-ccr (146; its P10 refresh depends on the factory's
  volatile dispatch). Factory first - ccr's tests import the factory's Target.
- **L5 - tool-coach + wiring suites:** tool-coach (129) plus the 7 wiring suite pairs
  (2 shallow folders each) and the Run-Wiring.mjs list update. The wiring lane is last:
  env-gated, self-skipping, and its runner list changes the aggregate counts.
- **L6 - ets-base-dsh (the non-twin lane):** the ETS-only package. Re-home the Stream
  Gate and Update Envelope sections from the ets core smoke into its own
  `Source/Test/Stream-Gate/` + `Update-Envelope/` folders; no Classic twin exists. Run
  AFTER L1 so the ets core folders already reference the re-homed sections cleanly (do
  this in the same PR series as the ets core pilot follow-up to avoid a window where
  the sections are asserted twice).

Dependency edges to respect: L4-factory before L4-ccr and before L3 (all consumers
instantiate the factory); the pilot (core) before everything; L6 after the ets-core
folders exist.

---

## 6. THE TRAPS + GUARDS

1. **The vacuously-green trap.** A folder whose fixture wiring is wrong passes with the
   right count printed. Guard: every folder's runner step compares the printed PASS
   count against the README's expected count; a fixture that never reaches the code
   prints fewer. ALSO: at least one assertion per folder must be a NEGATIVE control
   (assert the mechanism actually fired - e.g. the captured listener map is non-empty)
   where the source suite had one.
2. **Byte-identical ledger strings.** The split must not reword, re-prefix, or reorder
   any asserted string. The README quotes them; the coder lane diffs each moved
   assertion against the source suite line (same bytes, same order within the folder).
   Only the identity-driven strings (`<module>: ` prefixes, logFile defaults) change BY
   DESIGN, and only when the module's identity changes.
3. **The parity discipline.** ETS test files are generated from the Classic files under
   the tree-identity substitutions (`hook-dsh-` -> `ets-hook-dsh-`,
   `plugin-dsh-factory` -> `ets-plugin-dsh-factory`, base imports -> `ets-base-dsh`
   where the source suite did), then the additive ETS sections appended. A lane that
   hand-writes the ETS file breaks parity - generate, never retype.
4. **The Target rebuild order.** The plugin Build wipes `Target/` recursively (its
   config's Target plugin). The test build MUST run AFTER it and wipe only
   `Target/Test`. Also: consumers type-check against the factory's BUILT Target - the
   serialized workspace build order already handles this; do not parallelize.
5. **The smoke/live fidelity gap.** The smokes prove the MECHANICS; the wiring suites
   prove the WIRING. Do not promote a wiring folder into the mechanics count or vice
   versa; the split folders keep the same env gates (`DSH_TEST_SCRATCH`) and self-skip
   behavior.
6. **The tsconfig paths aliases.** `@Function/*`, `@Interface/*`, `@Variable/*` map to
   `./Source/...` and the build rewrites them to relative output paths; `tsc-alias`
   runs over the plugin build. The TEST files must NOT use the aliases (they import
   built Target paths relatively); if a test ever imports a Source alias, the
   Test-ESBuild step has no alias rewriter and the compiled file breaks at runtime.
   Guard: lint/grep the Test tree for `@Function/|@Interface/|@Variable/` and fail the
   lane. `tsc -p Configuration/TypeScript.noemit.json` type-checks Source/Test
   automatically (`include: ["Source"]` already covers it) against the built `.d.ts` in
   Target.
7. **The tabs formatting law.** `.prettierrc`: useTabs true, tabWidth 4, printWidth 100,
   proseWrap always. TS test files and the sh scripts are prettier-formatted
   (prettier-plugin-sh); the markdown READMEs are EXCLUDED from prettier via
   .prettierignore (the family prose is byte-integrity-protected) - keep it that way,
   and write the READMEs ASCII. YAML stays spaces (no YAML in this restructure except
   cordis.patch.yml, untouched). Run `pnpm format:check` in every lane's acceptance.
8. **The content-write law.** The normalize hooks are active on streamed writes: write
   test files ASCII-safe; the suites contain unicode test data (em/en dashes,
   curly quotes) - use escapes (`\u2014`) exactly as the current sources already do;
   if a byte-faithful glyph is unavoidable, use raw-write/identity-exempt edit.
9. **The import-depth invariant.** Relative Target imports must resolve from BOTH
   `Source/Test/<Name>/` and `Target/Test/<Name>/` - with `outbase: "Source/Test"` the
   mirrored structure guarantees it, but a lane that changes outbase silently breaks
   the standalone runs. Verify once per lane: run one compiled test directly.
10. **The baseline recording.** Before splitting, each lane records the suite's printed
    total from a fresh run of the CURRENT suite (never from this document) - the note's
    counts and the README's counts may both be stale by the time a lane starts.
11. **The plugin build glob swallows Source/Test (found by the pilot, 2026-10-19).**
    `Build 'Source/**/*.ts'` matches the Test tree (the CLI globs with fast-glob), so
    the plugin build compiles the tests with the PLUGIN config and fails on test-only
    syntax (a top-level `await` or an `await` in a non-async callback) and would ship
    the compiled tests inside `Target`. The plugin-build step MUST pass the negation as
    a SECOND positional pattern - `Build "Source/**/*.ts" "!Source/Test/**/*.ts"` -
    which fast-glob honors within the pattern array (verified: 28 -> 19 files on the
    core package; zero `Source/Test/` leaks). The Test build globs only
    `Source/Test/**/*.ts`, so it needs no negation. Also: every test file must be
    syntax-swept for `await` outside `async` callbacks before the first build; the
    standalone guard's top-level `await` is fine under the Test config (esm, esnext).
    ERRATUM (2026-10-20, the L5A lane): in @playform/build 0.3.4 the negation
    positional is a NO-OP (the CLI globs each pattern separately and concatenates;
    lone negative patterns match nothing - verified) - the plugin build DOES compile
    the Test tree with the plugin config. The end-state is harmless (the test build
    wipes + regenerates Target/Test with the right config; the tarball clean), so the
    scripts KEEP the negation for future CLI versions, but the "28 -> 19 files" claim
    does not hold for 0.3.4. ADDITIONAL FINDING (the declaration-hygiene rule): the
    Build CLI's tsc + tsc-alias spawns are FIRE-AND-FORGET (never awaited) - the
    background raw-tsc emit can land AFTER its tsc-alias, leaving @Interface aliases
    in the TRACKED Target/*.d.ts. Every converted prepublishOnly.sh gains a FOURTH
    awaited step `pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p
    tsconfig.json` after the Build children exit (the L5A precedent), so the shipped
    declarations are deterministic.

---

## 7. THE ACCEPTANCE-CHECKLIST (per lane)

For each converted package pair (Classic + ETS):

1. `ls <pkg>/Source/Test/*/` - every folder has exactly one `Test.ts` + one
   `README.md`; the shared `Source/Test/Harness.ts` exists; no test folder is empty.
2. `sh <pkg>/prepublishOnly.sh` - both Build steps green; `Target/` contains the plugin
   output AND `Target/Test/<Name>/Test.js` for every folder; the second step did NOT
   delete the first step's output (order check).
3. `node Target/Test/<Name>/Test.js` for EVERY folder - each exits 0 and prints its
   expected PASS count (README count == printed count).
4. The ETS parity check: `diff <classic Test.ts> <ets Test.ts>` shows ONLY the
   tree-identity import substitutions (+ the additive ETS sections where applicable).
5. `.npmignore` contains `Source/Test/` and `Target/Test/`; `npm pack` in the package
   lists ZERO Test paths.
6. The suite-level count equality: sum of the folder PASS counts == the recorded
   baseline for that suite (additive growth allowed, recorded in the handoff; ZERO
   assertion weakening - the ledger strings byte-identical).
7. `node Maintain/Run-Smokes.mjs` (or the updated runner) - green, and its final total
   includes the new folders.
8. `pnpm format:check` - green (tabs in TS/sh; markdown excluded).
9. Package `package.json` scripts wired (`prepublishOnly` -> the sh script; `Run` -> the
   dev twin); the monorepo `pnpm run build` still green end-to-end (serialized).
10. Docs updated: the package README/SCHEME mention the Source/Test layout; the smokes
    README (Classic/smokes/README.md) points to the new layout during migration.

---

## 8. THE PILOT CORRECTIONS (2026-10-19 - the pilot lane's findings, BINDING for every later lane)

The pilot (hook-dsh-core + ets-hook-dsh-core, green: 14/17 checks preserved, "All 60
smoke suites passed" = 42 .mjs + 18 folders, monorepo build exit 0). Its deviations
correct the templates above - later lanes copy the PILOT'S PACKAGES as the pattern
reference (Classic/packages/hook-dsh-core + EffectTS/packages/ets-hook-dsh-core) and
apply these rules:

1. **The import depth (template 2.1 corrected).** From `Source/Test/<Name>/`, the
   own-bundle import is `../../../Target/Library.js` (the `../../` of template 2.1
   resolves to `Source/Target` - proved by tsc trace). Cross-bundle:
   `../../../../<pkg>/Target/Library.js` (e.g. the ETS Chunk/Block import
   `../../../../ets-base-dsh/Target/Library.js`). Valid from BOTH the Source and the
   Target trees (every compiled test runs standalone).
2. **The tsc-after-every-Build trap.** The Build CLI runs `tsc -p <tsconfig>` after
   EVERY Build step; with the Test files in that program, their imports of the built
   Target d.ts chain collide (TS5056/TS5055) and `Target/Library.d.ts` gets DELETED by
   the failing pass. Fix per package: the root `tsconfig.json` gains
   `"exclude": ["Source/Test"]`; the plugin type gate is
   `Configuration/TypeScript.noemit.json` (passed via `--TypeScript` in the sh
   scripts); the TEST tree type-checks via a NEW
   `Configuration/TypeScript-Test.noemit.json` (include `../Source/Test/**`). Later
   lanes should add that test type-check as a THIRD prepublishOnly step (the pilot ran
   it in acceptance but left the two-step script per the spec).
3. **npm's files allowlist beats .npmignore.** The `.npmignore` Test lines do NOT stop
   npm shipping `Target/Test` under `files: ["Target"]` - add `"!Target/Test"` to the
   package.json `files` array (keep BOTH the .npmignore lines AND the files negation;
   verified: 0 Test paths in the tarballs).
4. **Check granularity.** One Check per source ok-group, so the folder sums equal the
   .mjs baselines EXACTLY (a per-assertion Check would break the sum==baseline law);
   the "deeply nested hierarchy" lives as Sub-blocks between Checks and branch-blocks
   inside the big single-Check folders (Chunk/Block/Update-Envelope).
5. **The sh scripts.** `set -e` at the top (enforces both-steps-green); the negation
   is mirrored into Run.sh's plugin step; `--Watch` on the LAST Build only (the
   Element pattern).
6. **The harness.** `CheckAsync` (an async variant) exists for awaited branches; the
   ETS Harness.ts stays byte-identical to the Classic one.
7. **Unicode.** Assertion messages/labels use `\u2192`/`\u2014`/`\u2082`-style escapes
   (runtime bytes identical to the source suite, source files pure ASCII); the
   READMEs are ASCII, quoting U+2014 ledger strings with an ASCII hyphen plus an
   explicit "(U+2014)" note.
8. **The runner's expected-count source.** The runner reads each folder's expected
   count from the SOURCE README (`Source/Test/<Name>/README.md` - READMEs are not
   compiled into Target/Test).
9. **Folder counts.** A 9-folder split merges the SMALLEST pair (the pilot merged
   Replace+Replace-Map -> 8 Classic folders); the ETS trees keep their additive
   folders (8 shared + 2 ETS-only = 10). The >8 ceiling applies to the shared twins.
10. **The strict-tsconfig scaffolding.** The Update-Envelope folder's type scaffolding
    (SmokeState/SmokeDeps, `_State`-style renames for noUnusedParameters, `State.Spec!`
    non-null assertions, `State.Ledger[0] ?? ""` for noUncheckedIndexedAccess) is
    fixture-only - ZERO assertion changes.
11. **The migration fallback.** The .mjs suites stay byte-identical (the runner still
    globs them) until a later lane retires them; the ETS-only folders double-assert
    the R1 sections with the .mjs until L6 re-homes them.

---

1. The note's "41 smoke suites" is stale: the current runner globs 21 per tree = 42.
   Recount at implementation time.
2. `Build` tool semantics for `--Watch` with two sequential invocations, and for a
   `.ts` ESBuild config passed from a package root (the family already passes
   `Configuration/ESBuild.ts`, so this is proven; the twin `.js` convention for the
   Test config needs one look at an existing `Configuration/ESBuild.js` header).
3. Whether the shared Harness.ts per package should instead be one shared file per TREE
   (e.g. `Classic/smokes/Harness.mjs` today is duplicated per suite) - the blueprint
   chooses per-package Harness.ts because the fake-ctx seams differ subtly per bundle
   (the capturing fs vs the real-token fs vs the commands seam); a per-tree shared
   harness is a possible later refactor, out of scope.
4. The wiring suites' folder split is intentionally shallow (2 folders); if the lane
   finds the live assertions resist splitting without breaking Run-Wiring.mjs's count
   arithmetic, keep the suite whole and note it in the handoff (the spec's 3-folder
   floor applies to the mechanics suites).
5. ets-base-dsh's folders are new coverage (not a twin); its PASS baseline is derived
   from the ets core smoke's re-homed sections minus those sections - record the
   arithmetic in the L6 handoff so the ets core total stays >= baseline.

---

## 9. THE TOTALS LEDGER (the wrap-up lane, I8 - 2026-10-20)

The restructure is complete: every converted package's `Source/Test/` folders cover its
suite, the 42 `.mjs` fallback files (21 per tree) are REMOVED, the runner's glob counts
ONLY the folders, and `node Maintain/Run-Smokes.m` is green. Baseline = the `.mjs`
suite's printed count, recorded immediately before removal (each suite green at
removal time). After = the sum of the package folder READMEs' expected counts (the
vacuously-green guard holds: the runner compares printed vs README per folder).

### 9.1 The mechanics suites (per tree)

| Suite | .mjs baseline | Folder sum after | Delta |
| --- | --- | --- | --- |
| Classic/hook-dsh-core | 14 | 14 | 0 |
| Classic/plugin-dsh-factory | 35 | 35 | 0 |
| Classic/hook-dsh-package-governor | 78 | 78 | 0 |
| Classic/hook-dsh-package-pinner | 32 | 32 | 0 |
| Classic/hook-dsh-cargo-governor | 62 | 62 | 0 |
| Classic/hook-dsh-normalize-dash | 184 | 184 | 0 |
| Classic/hook-dsh-normalize-file | 112 | 112 | 0 |
| Classic/hook-dsh-normalize-quotes | 104 | 104 | 0 |
| Classic/hook-dsh-normalize-ellipsis | 104 | 104 | 0 |
| Classic/hook-dsh-normalize-spaces | 104 | 104 | 0 |
| Classic/hook-dsh-normalize-invisible | 104 | 104 | 0 |
| Classic/hook-dsh-normalize-fullwidth | 104 | 104 | 0 |
| Classic/hook-dsh-ccr | 146 | 146 | 0 |
| Classic/hook-dsh-tool-coach | 129 | 129 | 0 |
| EffectTS/ets-hook-dsh-core | 17 | 14 | -3 (re-homed) |
| EffectTS/ets-plugin-dsh-factory | 42 | 42 | 0 |
| EffectTS/ets-hook-dsh-package-governor | 81 | 81 | 0 |
| EffectTS/ets-hook-dsh-package-pinner | 32 | 32 | 0 |
| EffectTS/ets-hook-dsh-cargo-governor | 62 | 62 | 0 |
| EffectTS/ets-hook-dsh-normalize-dash | 184 | 184 | 0 |
| EffectTS/ets-hook-dsh-normalize-file | 112 | 112 | 0 |
| EffectTS/ets-hook-dsh-normalize-quotes | 104 | 104 | 0 |
| EffectTS/ets-hook-dsh-normalize-ellipsis | 104 | 104 | 0 |
| EffectTS/ets-hook-dsh-normalize-spaces | 104 | 104 | 0 |
| EffectTS/ets-hook-dsh-normalize-invisible | 104 | 104 | 0 |
| EffectTS/ets-hook-dsh-normalize-fullwidth | 104 | 104 | 0 |
| EffectTS/ets-hook-dsh-ccr | 146 | 146 | 0 |
| EffectTS/ets-hook-dsh-tool-coach | 129 | 129 | 0 |

Notes:

- **The L6 re-home arithmetic (ets-base-dsh):** the ets core `.mjs` baseline 17 =
  14 (the eight shared folders) + 1 (Stream-Gate) + 2 (Update-Envelope). The
  Stream-Gate and Update-Envelope sections moved into the base's OWN test tree
  (`EffectTS/packages/ets-base-dsh/Source/Test/`, new coverage, no Classic twin):
  ets-base totals 0 -> 3 (1 + 2, derived from the re-homed sections); the ets core
  sum stays >= its shared-folder share with ZERO weakening (17 = 14 + 3 across the
  two packages, exactly preserved).
- **hook-dsh-live-containers / ets-hook-dsh-live-containers:** new packages from the
  site lanes (no `.mjs` suite ever existed); folder sums 105 per tree are pure NEW
  coverage, not a conversion. They are excluded from the delta law below.
- The ETS governor's +3 and the ETS factory's +7 over Classic are the additive
  EffectTS coverage recorded at conversion (unchanged).

### 9.2 The wiring suites (per tree, live battery)

| Suite | .mjs baseline | Folder sum after (gate ON) | Delta |
| --- | --- | --- | --- |
| Scratch-Profile | self-skip (no scratch) | 23 | 0 |
| Profile-Assembly | self-skip (no scratch) | 16 | 0 |
| Patch-Layer | self-skip (no scratch) | 14 | 0 |
| Live-Ledger | self-skip (no scratch) | 38 | 0 |
| Governed-Write | self-skip (no scratch) | 13 | 0 |
| Refusal-Path | self-skip (no scratch) | 10 | 0 |
| Introspection | self-skip (no scratch) | 22 | 0 |

Identical sums in both trees (136 checks per tree, 272 combined). The `.mjs`
originals are removed too; the folders run under `Maintain/Run-Wiring.mjs` (which sets
the gate) and self-skip inside the aggregate without `DSH_TEST_SCRATCH`. The
`wiring-live.mjs` scaffold stays (it is not a counted suite).

### 9.3 The roll-up

| Measure | Before (the double-assertion window) | After (the retirement) |
| --- | --- | --- |
| Runner units (Maintain/Run-Smokes.mjs final line) | 229 (42 .mjs + 187 folders) | 187 (folders only) |
| Mechanics PASS, Classic | 1312 | 1417 (+105 = live-containers new coverage) |
| Mechanics PASS, EffectTS | 1325 | 1430 (+105 = live-containers; core -3 offset by ets-base +3) |
| Converted-package deltas | - | ZERO weakening, ZERO growth (the additive growth happened at conversion, recorded in the lane handoffs) |

### 9.4 The wrap-up lane's additional deliverables (BINDING)

1. **The declaration-hygiene sweep (the L5A finding):** every converted
   `prepublishOnly.sh` gained the awaited fourth step
   `pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p tsconfig.json`
   (28 scripts; tool-coach already carried it). Surfacing the awaited emit fixed:
   the live-containers pair's missing `exclude: ["Source/Test"]` (duplicate-input
   TS5055/TS5056), the governors' and pinner's strict-null test typing (fixture-only
   narrowing, zero assertion changes), and the ETS ccr dep skew (cordis 4.0.5 ->
   4.0.4, tsc-alias aligned; the stray package-local node_modules removed so the
   hoisted root resolution applies). Tracked Targets verified alias-free.
2. **The red-arbiter fix:** the old governor `.mjs` suites' Target-walk skipped the
   gitignored `Target/Test` subtree (the converted folders' compiled output legitimately
   imports the factory) - the minimal patch that kept the `.mjs` green until the
   retirement.

