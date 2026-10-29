---
title: The smoke-suite restructure blueprint
category: Archive/Smoke-Restructure
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md
index: Documentation/INDEX.md
statuses:
    - name: the blueprint (the inventory, the templates, the folder splits)
      state: implemented
      evidence: the coder lanes executed it; 187 mechanics suites plus the wiring
    - name: the pilot (lib-dsh-core + the ETS twin)
      state: implemented
      evidence: the 11 corrections became binding; recorded in section 8
    - name: the fan-out (L1-L6 over all packages)
      state: implemented
      evidence: the totals ledger in section 9 - all 28 mechanics rows delta-0
    - name: the totals ledger (section 9)
      state: implemented
      evidence: Classic mechanics 1312 to 1417; ETS 1325 to 1430; the roll-up 187 units
    - name: the legacy runner retirement
      state: implemented
      evidence: the 42 legacy suites removed; the folders are the arbiter
    - name: the red-arbiter fix (the governor Target-walk)
      state: resolved
      evidence: both walks skip Target/Test; green until retirement
    - name: the ets-base re-home
      state: implemented
      evidence: Stream-Gate 1 and Update-Envelope 2 moved; 17 = 14 + 3
---

# SMOKE-SUITE-RESTRUCTURE-BLUEPRINT

Status: BLUEPRINT (explorer output, 2026-10-19).

Implementing coder lanes execute this document verbatim.

Specification: Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-NOTE.md (read in
full).

Reference studied: /Users/nikola/Developer/Application/CodeEditorLand/Land/Element/Output
(Source/prepublishOnly.sh, Source/Run.sh, Source/ESBuild.ts, Source/ESBuild/Output.ts, package.json
scripts).

This exploration changed no code and ran no tests.

Conventions for this document: tabs for indentation, ASCII only.

The coder lanes copy the templates byte-for-byte, then substitute the marked placeholders
(`<Bundle>`, `<TestName>`, tree imports).

---

## 1. THE INVENTORY

### 1.1 Packages (28 total, all at 0.0.1 under @playform)

Classic tree (14, in `Classic/packages/`):

| #   | Package                      | Has smoke?                       |
| --- | ---------------------------- | -------------------------------- |
| 1   | lib-dsh-core                 | yes (`core-smoke.mjs`)           |
| 2   | plugin-dsh-factory           | yes (`factory-smoke.mjs`)        |
| 3   | hook-dsh-cargo-governor      | yes (`cargo-smoke.mjs`)          |
| 4   | hook-dsh-package-governor    | yes (`governor-smoke.mjs`)       |
| 5   | hook-dsh-package-pinner      | yes (`pinner-smoke.mjs`)         |
| 6   | hook-dsh-normalize-dash      | yes (`normalize-dash-smoke.mjs`) |
| 7   | hook-dsh-normalize-quotes    | yes (`quotes-smoke.mjs`)         |
| 8   | hook-dsh-normalize-ellipsis  | yes (`ellipsis-smoke.mjs`)       |
| 9   | hook-dsh-normalize-spaces    | yes (`spaces-smoke.mjs`)         |
| 10  | hook-dsh-normalize-invisible | yes (`invisible-smoke.mjs`)      |
| 11  | hook-dsh-normalize-fullwidth | yes (`fullwidth-smoke.mjs`)      |
| 12  | plugin-dsh-normalize-file    | yes (`normalize-file-smoke.mjs`) |
| 13  | hook-dsh-ccr                 | yes (`ccr-smoke.mjs`)            |
| 14  | hook-dsh-tool-coach          | yes (`tool-coach-smoke.mjs`)     |

EffectTS tree (14, in `EffectTS/packages/`): the exact ets- twins of all 14 packages above
(`ets-lib-dsh-core`, `ets-plugin-dsh-factory`, `ets-hook-dsh-cargo-governor`,
`ets-hook-dsh-package-governor`, `ets-hook-dsh-package-pinner`, the 7 `ets-hook-dsh-normalize-*`,
`ets-hook-dsh-ccr`, `ets-hook-dsh-tool-coach`), all with a smoke, PLUS:

`ets-base-dsh` is the 15th package, and it has no smoke of its own.

Its exports (Activate/Update/Block/Chunk/StreamGate, the Effect services/layers) are exercised from
the ets core smoke's additive sections via `../packages/ets-base-dsh/Target/Library.js`.

The restructure gives it a `Source/Test/` tree that tests ITS OWN surface directly, because the R1
additive sections move home.

That tree holds 2 test folders minimum (`Stream-Gate/`, `Update-Envelope/`), re-homed from the ets
core smoke, plus the shared Effect parity assertions.

This is the one package where the ETS test tree is NOT a byte-twin of a Classic tree, so the
blueprint marks its lane accordingly (lane L6).

### 1.2 Suites (42 total: 21 per tree, mechanically 14 + wiring 7)

The per-tree suite list is the same for `Classic/smokes/` and `EffectTS/smokes/`, because the names
match.

Baseline printed counts come from the README and the note.

The coder lanes re-read each suite's final `PASS`/`checks` line and record it as the lane baseline
before splitting.

| Suite                  | Baseline                                                                                                                                                                                                | Harness pattern                                                                                                                                                        | Natural decomposition (folders)                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| core-smoke             | 14 `ok` checks                                                                                                                                                                                          | pure unit: NO fake ctx, NO factory; real built Target only; one tmpdir fs fixture for Policy                                                                           | 8 Classic / 10 ETS (ETS adds Stream-Gate + Update-Envelope)                                                                                                  |
| factory-smoke          | 34 checks                                                                                                                                                                                               | real FactoryClass instantiated against stub ctx; State builder; registers one loader/volatile-update listener (line ~1051)                                             | 6                                                                                                                                                            |
| governor-smoke         | 78                                                                                                                                                                                                      | fake ctx + real factory + real governor Target; ledger byte-strings; policy files                                                                                      | 7                                                                                                                                                            |
| pinner-smoke           | 32                                                                                                                                                                                                      | fake ctx + real factory; REAL-token fs (the version guards exercised with actual tokens - the pinning writes go through the capturing fs with real version objects)    | 6                                                                                                                                                            |
| cargo-smoke            | 62                                                                                                                                                                                                      | fake ctx + real factory; journal file fixtures in /tmp; ledger strings                                                                                                 | 6                                                                                                                                                            |
| normalize-dash-smoke   | 184 PASS (fresh 2026-10-19 - the blueprint's 132 was STALE; the +52 is the raw-write TOOL surface: Run 8 tool registration+exec 23, Run 9 per-call flavor selection 10, Run 10+addendum govern path 19) | fake ctx (on/get/logger/tools/fs/waterfall/emit capture) + REAL factory + real dash apply; live-volatile flips (loader/volatile-update dispatches: Run V, S5, O2, O10) | 8 (the 7 exact names of 1.4 + ONE new `Raw-Write-Tool/` folder for the post-blueprint tool surface; sums == 184 exactly)                                     |
| quotes-smoke           | 62                                                                                                                                                                                                      | fake ctx + real factory; byte-twin of fullwidth/ellipsis/spaces/invisible                                                                                              | 5                                                                                                                                                            |
| ellipsis-smoke         | 62                                                                                                                                                                                                      | same pattern                                                                                                                                                           | 5                                                                                                                                                            |
| spaces-smoke           | 62                                                                                                                                                                                                      | same pattern                                                                                                                                                           | 5                                                                                                                                                            |
| invisible-smoke        | 62                                                                                                                                                                                                      | same pattern                                                                                                                                                           | 5                                                                                                                                                            |
| fullwidth-smoke        | 62                                                                                                                                                                                                      | same pattern                                                                                                                                                           | 5                                                                                                                                                            |
| normalize-file-smoke   | 112 PASS (fresh 2026-10-19 - the blueprint's 71 was STALE; the +41 = Run V volatile flip 9 + Run F files scope gate 3 + Run O overpass 29)                                                              | fake ctx + real factory; real-token fs for the file rewriting (the tool writes actual bytes through the fs seam)                                                       | 7 (Config-And-Registration 18, Read-Write-Pipeline 24, No-Op-Rule 11, Error-Paths 10, Presenters 8, Volatile-Live-Flip 12, Overpass 29; sums == 112 exactly) |
| ccr-smoke              | 146                                                                                                                                                                                                     | fake ctx + real factory; live-volatile dispatches (P10 loader/volatile-update refresh); journal compaction fixtures; strict marker parsing                             | 7 (split in 1.4)                                                                                                                                             |
| tool-coach-smoke       | 129                                                                                                                                                                                                     | fake ctx + real factory; tool registry seam; coach lines                                                                                                               | 6                                                                                                                                                            |
| scratch-profile-smoke  | wiring                                                                                                                                                                                                  | SELF-SKIPS without DSH_TEST_SCRATCH (env-gated at top)                                                                                                                 | 2                                                                                                                                                            |
| profile-assembly-smoke | wiring                                                                                                                                                                                                  | self-skip; DSH_TEST_SCRATCH home                                                                                                                                       | 2                                                                                                                                                            |
| patch-layer-smoke      | wiring                                                                                                                                                                                                  | self-skip                                                                                                                                                              | 2                                                                                                                                                            |
| live-ledger-smoke      | wiring                                                                                                                                                                                                  | self-skip                                                                                                                                                              | 2                                                                                                                                                            |
| governed-write-smoke   | wiring                                                                                                                                                                                                  | self-skip                                                                                                                                                              | 2                                                                                                                                                            |
| refusal-path-smoke     | wiring                                                                                                                                                                                                  | self-skip                                                                                                                                                              | 2                                                                                                                                                            |
| introspection-smoke    | wiring                                                                                                                                                                                                  | self-skip                                                                                                                                                              | 2                                                                                                                                                            |

The 7 wiring suites across 2 trees make 14 folder pairs.

They run under `Maintain/Run/Wiring/Index.mjs` (the live ~/.dsh battery), and they self-skip inside
Run-Smokes.

Their per-folder split stays shallow at 2 folders each: "skip-guard + harness" and "the live
assertions".

They are env-gated and must NOT be forced green in the aggregate.

Total proposed test folders: 2 x (8+10+6+7+6+6+7+5x4+6+7+6+2x7) = 2 x 124 = 248 folders (124 per
tree), each with one singular TS test file + one README.md.

Coder lanes may adjust +/-1 folder per suite as the assertion groups fall out; the floor is 3, the
ceiling 8 per suite (per the spec).

### 1.3 The parity discipline, confirmed by diff

- `quotes/fullwidth/ellipsis/spaces/invisible/pinner/normalize-file` smokes are BYTE-EQUAL between
  the trees except the import lines: `hook-dsh-*` -> `ets-hook-dsh-*`, `plugin-dsh-factory` ->
  `ets-plugin-dsh-factory`.

    The diff is verified: fullwidth = 2 lines, quotes = 3 lines, pinner = 18 lines, cargo = 12
    lines, all import or comment-path lines only.

- The larger suites (core, factory, governor, ccr, tool-coach, cargo) are byte-equal in the
  Classic-arbiter sections PLUS additive ETS-only sections (the Stream pipeline, the typed envelope,
  the parallel marker).

    The ETS core smoke additionally imports from `ets-base-dsh/Target/Library.js` and from `effect`.

- The restructure preserves this exactly: each ETS test file is the Classic test file with ONLY the
  tree-identity substitutions applied.

    The lane law: generate the ETS file from the Classic file mechanically, then append the additive
    ETS sections where the suite has them.

### 1.4 Exact folder splits for the three suites read in full

**core-smoke (Classic; 700 lines, 14 `ok` groups).** The folder-to-assertion-group map follows:

1. **Data-Lists.**

    Section deepEqual covers the 4 npm dependency sections.

    Default deepEqual covers the 6 exclusion segments.

    The folder holds 2 checks.

2. **Suppress.**

    The three suppression-line shapes are covered: the continuation error, the listener string
    cause, and the empty-message error that composes the line.

    The folder holds 1 ok group.

3. **Policy.**

    An absent file gives Defaults plus the two byte-identical lines.

    A readable file gives its policy plus silence.

    An unreadable file gives Defaults plus the unreadable diagnostic.

    The Quiet form skips every diagnostic.

    The folder holds 4 ok groups.

    It uses the tmpdir fixture, and the folder README documents the two exact ledger strings.

4. **Refusal.**

    A sections-only change is allowed and writes no line.

    A non-dependency change is refused and writes the byte-identical refusal line.

    The folder holds 1 ok group.

5. **Tables.**

    The four character-class regex sources appear verbatim (Dashes, Ellipsis, Spaces, Invisible)
    plus the flags.

    The Quotes map shows its exact contents, and the Fullwidth table shows the computed 94 entries.

    The folder holds 2 ok groups.

6. **Replace.**

    The class-to-string replacer is checked for match plus count, for count 0, for the literal `$&`
    insertion, and for an untouched lastIndex.

    The folder holds 1 ok group.

7. **Replace-Map.**

    The char-to-char map is checked for the Quotes flavor, the Fullwidth flavor, the literal values,
    and count 0.

    The folder holds 1 ok group.

8. **Chunk.**

    The whole dispatch section moves here (lines 252-522).

    It covers the text-delta rewrite plus the identity passthrough, the tool-call-delta passthrough,
    the tool-args gate ON and OFF, the edit exemption, the raw-write exemption, and the
    normalize-file exemption.

    It also covers the per-call raw marker (strip, empty-object, whitespace variant,
    subsequent-delta anchored, flag-OFF still strips), the reasoning gate, the
    block-start/usage/finish passthroughs, the block-end text/reasoning/thinking, and the
    second-flavor injection.

9. **Block.**

    The block normalizer moves here (lines 524-697) and covers text, reasoning, and thinking.

    It also covers the tool-call gate ON and OFF, the three exemptions, the raw marker (empty,
    flag-OFF, Raw-ignored for text), and the image passthrough.

10. **Stream-Gate and Update-Envelope (ETS only).**

    These two folders are the ETS-only additions, re-homed from the ets core smoke's R1 sections.

    `Stream-Gate/` covers the real Stream transformer equivalence, and `Update-Envelope/` covers the
    typed Dispatch/Settle effects.

**normalize-dash-smoke (1547 lines, 132 PASS).** The folder-to-assertion-group map follows:

1. **Config-And-State.**

    The config defaults are covered (normalizeReasoning=true, normalizeToolArguments=false), the
    llm/stream listener is registered, and the state carries the REAL factory instance.

    The volatile unwrap is checked: the log cell sets State.Enabled=true.

2. **Stream-Contract.**

    next() is called once synchronously before any upstream iteration, the options are deep-frozen,
    and the chunk order and count are preserved.

    The passthrough identities are checked (block-start, usage, finish), and the rewrite groups are
    checked (text-delta to the count line, reasoning, block-end fields).

    The exact ledger strings for each rewrite are asserted.

3. **Scopes.**

    With scopes.conversation off, text-delta passes by identity.

    With scopes.reasoning off, the same holds, and with toolInput both off, the result is identity.

    The S5 volatile scope flip changes the NEXT stream's gate without a remount.

4. **Tool-Args-Exemptions.**

    Plain fields give ToolArgs=true when normalizeToolArguments is on.

    The edit, raw-write, and normalize-file exemptions are checked, and so are the raw-marker strip
    variants.

5. **Overpass.**

    The two overpass arms are covered: post-execute prepended, and pre-step default order.

    N=0 writes no ledger line, per the no-op rule.

    The batch arms are checked, and so are the O2/O10 volatile flips (toolResults/batch scope ON
    gives normalization plus the exact ledger).

6. **Journal-And-Custom.**

    The custom-replacement run adds its 'normalized' journal record, the journaling mechanics are
    checked, and the transport boom covers the error path.

7. **Volatile-Live-Flip.**

    This folder is the P10 group.

    It checks that exactly one activation line appears after the mount, that the State object
    identity is preserved (no rebuild), and that there is still exactly one activation line (NO
    remount, no re-apply).

    The flipped stream adds NO activation line, but it still writes its normal count line.

    Run V supplies the dispatch shape: `Listeners["loader/volatile-update"] ([["replacement"]])`.

**ccr-smoke (1114 lines, 146 PASS).** The folder-to-assertion-group map follows:

1. **Config-And-Activation.**

    The volatile-cell shape is checked: log/logFile/multipliers/thresholdBytes/previewMaxChars
    arrive as `{ get }`.

    Every config default is checked (thresholdBytes=2048, inlineThresholdBytes=1024,
    autoExpand=true, autoExpandLimitBytes =102400, compressFailures=false, previewMaxChars=240,
    ttlSeconds=3600, storeBudgetBytes=268435456, journalPath='', contextEngine=false,
    contextEngineThresholdPct=30, protectFirstTurns=2, protectLastTurns=4).

    The activation posture is checked: the bundle 0.0.1 line and the listeners set.

2. **Run-One-State.**

    Exactly one tool is registered, and its shape is checked.

    State.Factory === Furnace, the volatile unwraps give Enabled=true and Threshold=2048, and
    State.Module === 'ccr'.

    The store is memory-only by default, State.Targets.length === 8, and the listener set includes
    tools/post-execute plus the State builder's P10 loader/volatile-update refresh.

3. **Engine-Flag-Off.**

    Run 10 leaves EngineRuntime undefined and registers NO agent/pre-step listener, because the
    extra listener is P10.

    Post-execute traffic leaves no engine traces.

4. **Engine-Flag-On.**

    The agent/pre-step and tools/post-execute posture is checked, the engine runtime is built, and
    the protective zones apply (protectFirstTurns/protectLastTurns).

5. **Retrieve-And-Marker.**

    ccr_retrieve registration is checked, and the marker parses strictly (24-hex hash, type, size).

    An out-of-range start clamps to an empty slice.

    Auto-expand keeps the entry retrievable by hash, and the exact retrieved text and ledger strings
    are asserted.

6. **Journal-Compaction.**

    The journal boot compaction edges are covered, including Edge 3: a MISSING journal file is not
    created on boot (memory-only).

7. **Volatile-Refresh.**

    The P10 volatile-update dispatch behavior on the ccr State is checked, where the config flip
    applies to the NEXT call without a remount.

    The engine-ON variant of the refresh line is also covered.

---

## 2. THE TEMPLATES (byte-ready)

Location law: each plugin package gets `Source/Test/<TestName>/Test.ts` +
`Source/Test/<TestName>/README.md`.

Shared harness code lives in `Source/Test/Harness.ts`, which is NOT a test folder and needs no
README beyond a header comment, so the fake-ctx builder is written ONCE per package and imported by
every test folder.

The ETS tree's Harness.ts is the Classic Harness.ts with the same tree-identity substitutions.

### 2.1 The TS test file skeleton

```ts
// Source/Test/<TestName>/Test.ts - one singular test: <one-line intent>.
// Runs standalone (`node Target/Test/<TestName>/Test.js`) AND under the
// aggregate (`Maintain/Run/Smokes/Index.mjs` imports runTest).
import assert from "node:assert/strict";

// The REAL built entry of THIS bundle. This same relative specifier is valid
// at type-check time (Source/Test/<Name>/ -> ../../Target) and at runtime
// (Target/Test/<Name>/ -> ../../Target): esbuild keeps imports external
// (bundle: false), so the depth is preserved by the mirrored outbase.
import Plugin from "../../Target/Library.js";
import { Check, Furnace, MakeContext } from "../Harness.js";

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
			Check(Pass, Fail, () => assert.equal(/* byte-identical ledger string assertion */));
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

The aggregate-run contract: the main Smoke file imports `{ runTest }` from the compiled module and
awaits it.

The returned number is the folder's PASS count, and a throw is a failure.

The per-folder README records the folder's EXPECTED PASS count, so the runner and the lane
acceptance check can compare counts and never accept fewer.

Harness.ts exports the capture seams from the current smokes, verbatim:

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

Note: objects must be passed by reference for the counter (`{ n: number }`), or the helpers return a
counter object.

The coder lane picks one shape and uses it uniformly.

The printed line format stays `PASS - <message>` / `FAIL - <message>`, byte-compatible with today's
output.

### 2.2 The per-test-folder README.md template

```md
# <TestName>

What this test verifies.

## Intent

<One paragraph: the behavior under test and why it is its own folder.>

## Scenario

<The nested assertion hierarchy, as a tree: the groups and the leaves, in order.>

## Fixtures

<The fake-ctx seams used, the tmp/journal fixtures created and their paths, the config objects
passed to apply().>

## Expected ledger strings (byte-exact)

<Every ledger/log line the test asserts, quoted exactly, one per line. These are the contract - they
may change ONLY when the module's identity changes.>

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

The `--selfcheck` line is optional but recommended: Harness.ts gets a tiny standalone guard that
exits 0 if imported as a library and 1 if run directly with a broken seam, and the coder lane may
drop the line.

The `--TypeScript` flag matches the family's noemit type-check convention; if the current package
script does not pass it, keep parity with what the package does today and add the flag in the same
lane as the tsconfig change, never silently.

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

Note: with `--Watch` the two Builds run sequentially in one shell.

If the family's Build tool blocks on watch, split the calls into two backgrounded invocations
(`... --Watch &` / `wait`), and the coder lane verifies the tool's watch semantics once and keeps
the script shape.

Land/Element's Run.sh passes `--Watch` on the LAST Build only, so mirror that if the tool supports
one watcher per process: first Build without --Watch, second with.

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

If the twin-file convention applies here too (the build loader swaps Configuration/ESBuild.ts to
ESBuild.js), the lane adds the compiled `Configuration/Test-ESBuild.js` twin the same way the plugin
configs carry one.

Check one existing package's Configuration/ESBuild.js and mirror its header.

### 2.6 .npmignore (belt-and-braces; the `files` field is the primary gate)

Every package already ships `.npmignore` (verified in all sampled packages) excluding `Source/`,
`Configuration/`, docs, etc.

ADD two lines to the existing file; do not replace it:

```
Source/Test/
Target/Test/
```

The `files` field (`["Target", "README.md", ...]`) already excludes Source/Test.

The Target/Test exclusion is REQUIRED because `files: ["Target", ...]` would ship the compiled tests
inside Target.

Acceptance proves it with a packed-install check: run `npm pack` and list the tarball, then confirm
zero Test paths.

### 2.7 package.json script wiring

```json
"scripts": {
	"prepublishOnly": "sh prepublishOnly.sh",
	"Run": "sh Run.sh"
}
```

The existing `prepublishOnly` value `Build 'Source/**/*.ts' --ESBuild Configuration/ESBuild.ts` is
REPLACED by the sh script, which contains that same Build plus the test step, mirroring
Land/Element's `"prepublishOnly": "sh Source/prepublishOnly.sh"`.

The monorepo `pnpm run build:classic` / `build:effect-ts` scripts keep working unchanged, because
they run the packages' prepublishOnly with `--workspace-concurrency=1`.

Keep the builds serialized: concurrent builds race the shared Targets and now also the per-package
Target/Test wipes.

---

## 3. THE AGGREGATE-RUNNER INTEGRATION

`Maintain/Run/Smokes/Index.mjs` changes in five places:

1. **Keep the current pass during the migration.**

    Glob `Classic/smokes/*-smoke.mjs` + `EffectTS/smokes/*-smoke.mjs`, spawn each suite, and exit
    non-zero on the first failure.

    The semantics stay unchanged, and the streaming output stays preserved.

2. **Add the new pass.**

    For each package with a `Target/Test/` directory, enumerate `Target/Test/*/Test.js` in sorted
    order and spawn `node <file>` per test with stdio inherit.

    Collect the printed `N PASS - <TestName>` line, then compare N against the folder README's
    expected count; a mismatch is a failure even on exit 0, which is the vacuously-green guard.

    Import-based aggregation is possible (`await import(...); await runTest()`), but SPAWNING is the
    recommended default because it preserves today's isolation, the streaming output, and the
    exit-code semantics of the current loop.

    A crashing test then does not kill the runner.

    Import-based (`runTest`) is the fallback for lanes that need shared in-process state, and a tree
    never mixes the two modes.

3. **Keep the final line shape.**

    The runner still ends with `All <n> smoke suites passed (...)`, where n counts the per-test
    folders plus any remaining `.mjs` suites.

    The baseline to compare is today's "All 42 smoke suites passed" line; the note's "41" is stale,
    so recount at implementation time (`ls */smokes/*-smoke.mjs | wc -l` = 21 per tree).

    The arbiter law: the SUM of per-folder PASS counts per suite must equal the suite's recorded
    baseline (for example normalize-dash 132, ccr 146).

    The sum is never fewer, and any growth is additive coverage recorded in the lane handoff.

4. **Update the wiring runner.**

    `Maintain/Run/Wiring/Index.mjs` keeps its own explicit suite list; if the wiring suites are split into
    folders, update its `WiringSuites` array to the new folder paths in the same lane.

    The wiring counts remain its arbiter, never the 733/746 mechanics numbers.

5. **Fall back for incremental migration.**

    Keep the old `.mjs` suite as a THIN AGGREGATOR that imports the migrated folders' `runTest`
    exports and asserts that the sum equals the baseline.

    The runner's current glob keeps passing unchanged while the folders accrete.

    Remove the thin aggregator only when the LAST folder of that suite lands.

---

## 4. THE PILOT RECOMMENDATION

Convert **`lib-dsh-core` + `ets-lib-dsh-core`** end-to-end first.

Justification: the core smoke is the only suite with NO harness wiring, because it imports pure
units from one built Target.

The pilot therefore exercises the entire mechanical surface with ZERO fake-ctx risk and the smallest
blast radius: folder creation, the Test ESBuild config, the two-step sh scripts, the
standalone/aggregate run contract, .npmignore, package.json rewiring, and the parity substitution.

Yet it still spans the hard cases: a tmpdir-fs folder in Policy, the deeply nested Chunk/Block
exemption tree, and the ETS tree's additive Stream/Envelope sections that prove the ETS-only-folder
rule and the ets-base-dsh import path.

Once the pilot is green under both `node Target/Test/<Name>/Test.js` and the aggregate runner, every
other lane repeats the same mechanics with only the assertion-content work differing.

---

## 5. THE FAN-OUT CLUSTERING (the remaining 13 pairs -> 6 lanes)

Order law: the factory and the core come BEFORE the consumers, because the consumers' tests
instantiate the REAL factory from its built Target.

The family builds serialized with `--workspace-concurrency=1` for the same reason.

Within a lane, build and convert in the listed order.

- **L1 - normalize flavors A (mechanical, byte-twins):** normalize-quotes, normalize-ellipsis,
  normalize-spaces, normalize-invisible, normalize-fullwidth (5 pairs).

    All five suites are byte-equal twins with the same 5-folder split shape, so one lane does one
    pass with the highest confidence.

- **L2 - normalize flavors B:** normalize-dash (the 184-PASS suite, 7 folders, live volatile flips)
  and normalize-file (112, real-token fs, 7 folders).

    Dash after File or dash first both work, because they share the raw-marker/exemption assertion
    families; keep them in one lane so the exemption READMEs stay consistent.

- **L3 - governance trio:** package-governor (78), package-pinner (32, real-token fs),
  cargo-governor (62).

    Governor first, then pinner, then cargo, because the cargo suite's journal fixtures lean on the
    governor's step vocabulary.

- **L4 - factory + ccr:** plugin-dsh-factory (34; the volatile-update State-builder listener lives
  here) then hook-dsh-ccr (146; its P10 refresh depends on the factory's volatile dispatch).

    Factory first, because ccr's tests import the factory's Target.

- **L5 - tool-coach + wiring suites:** tool-coach (129) plus the 7 wiring suite pairs (2 shallow
  folders each) and the Run-Wiring.mjs list update.

    The wiring lane is last because it is env-gated, self-skipping, and its runner list changes the
    aggregate counts.

- **L6 - ets-base-dsh (the non-twin lane):** the ETS-only package.

    Re-home the Stream Gate and Update Envelope sections from the ets core smoke into its own
    `Source/Test/Stream-Gate/` + `Update-Envelope/` folders, because no Classic twin exists.

    Run AFTER L1 so the ets core folders already reference the re-homed sections cleanly, and do
    this in the same PR series as the ets core pilot follow-up to avoid a window where the sections
    are asserted twice.

Dependency edges to respect: L4-factory before L4-ccr and before L3, because all consumers
instantiate the factory; the pilot (core) before everything; L6 after the ets-core folders exist.

---

## 6. THE TRAPS + GUARDS

1. **The vacuously-green trap.**

    A folder whose fixture wiring is wrong passes with the right count printed.

    Guard: every folder's runner step compares the printed PASS count against the README's expected
    count, because a fixture that never reaches the code prints fewer.

    ALSO: at least one assertion per folder must be a NEGATIVE control that proves the mechanism
    actually fired, for example a non-empty captured listener map, wherever the source suite had
    one.

2. **Byte-identical ledger strings.**

    The split must not reword, re-prefix, or reorder any asserted string.

    The README quotes them, and the coder lane diffs each moved assertion against the source suite
    line, same bytes and same order within the folder.

    Only the identity-driven strings (`<module>: ` prefixes, logFile defaults) change BY DESIGN, and
    only when the module's identity changes.

3. **The parity discipline.**

    ETS test files are generated from the Classic files under the tree-identity substitutions
    (`hook-dsh-` -> `ets-hook-dsh-`, `plugin-dsh-factory` -> `ets-plugin-dsh-factory`, base imports
    -> `ets-base-dsh` where the source suite did), then the additive ETS sections are appended.

    A lane that hand-writes the ETS file breaks parity, so generate and never retype.

4. **The Target rebuild order.**

    The plugin Build wipes `Target/` recursively through its config's Target plugin.

    The test build MUST run AFTER it and wipe only `Target/Test`.

    Also: consumers type-check against the factory's BUILT Target, and the serialized workspace
    build order already handles this, so do not parallelize.

5. **The smoke/live fidelity gap.**

    The smokes prove the MECHANICS, and the wiring suites prove the WIRING.

    Do not promote a wiring folder into the mechanics count or the reverse, and the split folders
    keep the same env gates (`DSH_TEST_SCRATCH`) and self-skip behavior.

6. **The tsconfig paths aliases.**

    `@Function/*`, `@Interface/*`, and `@Variable/*` map to `./Source/...`, and the build rewrites
    them to relative output paths; `tsc-alias` runs over the plugin build.

    The TEST files must NOT use the aliases, because they import built Target paths relatively.

    If a test ever imports a Source alias, the Test-ESBuild step has no alias rewriter and the
    compiled file breaks at runtime.

    Guard: lint or grep the Test tree for `@Function/|@Interface/|@Variable/` and fail the lane.

    `tsc -p Configuration/TypeScript.noemit.json` type-checks Source/Test automatically
    (`include: ["Source"]` already covers it) against the built `.d.ts` in Target.

7. **The tabs formatting law.**

    `.prettierrc` sets useTabs true, tabWidth 4, printWidth 100, proseWrap always.

    TS test files and the sh scripts are prettier-formatted with prettier-plugin-sh.

    The markdown READMEs are EXCLUDED from prettier via .prettierignore, because the family prose is
    byte-integrity-protected; keep it that way and write the READMEs ASCII.

    YAML stays spaces, and this restructure holds no YAML except cordis.patch.yml, untouched.

    Run `pnpm format:check` in every lane's acceptance.

8. **The content-write law.**

    The normalize hooks are active on streamed writes, so write test files ASCII-safe.

    The suites contain unicode test data (em/en dashes, curly quotes), so use escapes (`\u2014`)
    exactly as the current sources already do; if a byte-faithful glyph is unavoidable, use
    raw-write or an identity-exempt edit.

9. **The import-depth invariant.**

    Relative Target imports must resolve from BOTH `Source/Test/<Name>/` and `Target/Test/<Name>/`.

    With `outbase: "Source/Test"` the mirrored structure guarantees it, but a lane that changes
    outbase silently breaks the standalone runs.

    Verify once per lane: run one compiled test directly.

10. **The baseline recording.**

    Before splitting, each lane records the suite's printed total from a fresh run of the CURRENT
    suite, never from this document.

    The note's counts and the README's counts may both be stale by the time a lane starts.

11. **The plugin build glob swallows Source/Test (found by the pilot, 2026-10-19).**

    `Build 'Source/**/*.ts'` matches the Test tree because the CLI globs with fast-glob, so the
    plugin build compiles the tests with the PLUGIN config.

    It then fails on test-only syntax (a top-level `await` or an `await` in a non-async callback)
    and would ship the compiled tests inside `Target`.

    The plugin-build step MUST pass the negation as a SECOND positional pattern,
    `Build "Source/**/*.ts" "!Source/Test/**/*.ts"`, which fast-glob honors within the pattern array
    (verified: 28 -> 19 files on the core package; zero `Source/Test/` leaks).

    The Test build globs only `Source/Test/**/*.ts`, so it needs no negation.

    Also: every test file must be syntax-swept for `await` outside `async` callbacks before the
    first build; the standalone guard's top-level `await` is fine under the Test config (esm,
    esnext).

    ERRATUM (2026-10-20, the L5A lane): in @playform/build 0.3.4 the negation positional is a NO-OP,
    because the CLI globs each pattern separately and concatenates, and lone negative patterns match
    nothing (verified).

    The plugin build therefore DOES compile the Test tree with the plugin config.

    The end-state is harmless, because the test build wipes and regenerates Target/Test with the
    right config and the tarball stays clean, so the scripts KEEP the negation for future CLI
    versions, but the "28 -> 19 files" claim does not hold for 0.3.4.

    ADDITIONAL FINDING (the declaration-hygiene rule): the Build CLI's tsc and tsc-alias spawns are
    FIRE-AND-FORGET and never awaited, so the background raw-tsc emit can land AFTER its tsc-alias
    and leave @Interface aliases in the TRACKED Target/*.d.ts.

    Every converted prepublishOnly.sh gains a FOURTH awaited step,
    `pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p tsconfig.json`, after the Build
    children exit (the L5A precedent), so the shipped declarations are deterministic.

---

## 7. THE ACCEPTANCE-CHECKLIST (per lane)

For each converted package pair (Classic + ETS):

1. **Folder shape.**

    `ls <pkg>/Source/Test/*/` shows every folder with exactly one `Test.ts` and one `README.md`, the
    shared `Source/Test/Harness.ts` exists, and no test folder is empty.

2. **The two-step build.**

    `sh <pkg>/prepublishOnly.sh` runs both Build steps green, and `Target/` contains the plugin
    output AND `Target/Test/<Name>/Test.js` for every folder.

    The second step did NOT delete the first step's output, which is the order check.

3. **Standalone runs.**

    `node Target/Test/<Name>/Test.js` runs for EVERY folder, each exits 0, and each prints its
    expected PASS count (README count == printed count).

4. **The ETS parity check.**

    `diff <classic Test.ts> <ets Test.ts>` shows ONLY the tree-identity import substitutions, plus
    the additive ETS sections where applicable.

5. **The package contents.**

    `.npmignore` contains `Source/Test/` and `Target/Test/`, and `npm pack` in the package lists
    ZERO Test paths.

6. **The suite-level count equality.**

    The sum of the folder PASS counts equals the recorded baseline for that suite; additive growth
    is allowed and recorded in the handoff, with ZERO assertion weakening and the ledger strings
    byte-identical.

7. **The aggregate runner.**

    `node Maintain/Run/Smokes/Index.mjs` (or the updated runner) is green, and its final total includes
    the new folders.

8. **Formatting.**

    `pnpm format:check` is green (tabs in TS/sh; markdown excluded).

9. **Script wiring.**

    The package `package.json` scripts are wired (`prepublishOnly` -> the sh script; `Run` -> the
    dev twin), and the monorepo `pnpm run build` is still green end-to-end (serialized).

10. **Docs.**

    The package README/SCHEME mention the Source/Test layout, and the smokes README
    (Classic/smokes/README.md) points to the new layout during migration.

---

## 8. THE PILOT CORRECTIONS (2026-10-19 - the pilot lane's findings, BINDING for every later lane)

The pilot (lib-dsh-core + ets-lib-dsh-core) is green: 14/17 checks preserved, "All 60 smoke suites
passed" = 42 .mjs + 18 folders, monorepo build exit 0.

Its deviations correct the templates above.

Later lanes copy the PILOT'S PACKAGES as the pattern reference (Classic/packages/lib-dsh-core +
EffectTS/packages/ets-lib-dsh-core) and apply these rules:

1. **The import depth (template 2.1 corrected).**

    From `Source/Test/<Name>/`, the own-bundle import is `../../../Target/Library.js`, because the
    `../../` of template 2.1 resolves to `Source/Target` (proved by tsc trace).

    Cross-bundle imports are `../../../../<pkg>/Target/Library.js`, for example the ETS Chunk/Block
    import `../../../../ets-base-dsh/Target/Library.js`.

    Both forms are valid from the Source and the Target trees, and every compiled test runs
    standalone.

2. **The tsc-after-every-Build trap.**

    The Build CLI runs `tsc -p <tsconfig>` after EVERY Build step; with the Test files in that
    program, their imports of the built Target d.ts chain collide (TS5056/TS5055) and
    `Target/Library.d.ts` gets DELETED by the failing pass.

    Fix per package: the root `tsconfig.json` gains `"exclude": ["Source/Test"]`, the plugin type
    gate is `Configuration/TypeScript.noemit.json` (passed via `--TypeScript` in the sh scripts),
    and the TEST tree type-checks via a NEW `Configuration/TypeScript-Test.noemit.json` (include
    `../Source/Test/**`).

    Later lanes should add that test type-check as a THIRD prepublishOnly step, because the pilot
    ran it in acceptance but left the two-step script per the spec.

3. **npm's files allowlist beats .npmignore.**

    The `.npmignore` Test lines do NOT stop npm shipping `Target/Test` under `files: ["Target"]`, so
    add `"!Target/Test"` to the package.json `files` array.

    Keep BOTH the .npmignore lines AND the files negation; verified: 0 Test paths in the tarballs.

4. **Check granularity.**

    One Check per source ok-group, so the folder sums equal the .mjs baselines EXACTLY, because a
    per-assertion Check would break the sum==baseline law.

    The "deeply nested hierarchy" lives as Sub-blocks between Checks and branch-blocks inside the
    big single-Check folders (Chunk/Block/Update-Envelope).

5. **The sh scripts.**

    `set -e` at the top enforces both-steps-green.

    The negation is mirrored into Run.sh's plugin step, and `--Watch` sits on the LAST Build only
    (the Element pattern).

6. **The harness.**

    `CheckAsync` (an async variant) exists for awaited branches, and the ETS Harness.ts stays
    byte-identical to the Classic one.

7. **Unicode.**

    Assertion messages and labels use `\u2192`/`\u2014`/`\u2082`-style escapes, so the runtime bytes
    are identical to the source suite and the source files stay pure ASCII.

    The READMEs are ASCII and quote U+2014 ledger strings with an ASCII hyphen plus an explicit
    "(U+2014)" note.

8. **The runner's expected-count source.**

    The runner reads each folder's expected count from the SOURCE README
    (`Source/Test/<Name>/README.md`), because READMEs are not compiled into Target/Test.

9. **Folder counts.**

    A 9-folder split merges the SMALLEST pair, so the pilot merged Replace+Replace-Map into 8
    Classic folders.

    The ETS trees keep their additive folders (8 shared + 2 ETS-only = 10), and the >8 ceiling
    applies to the shared twins.

10. **The strict-tsconfig scaffolding.**

    The Update-Envelope folder's type scaffolding (SmokeState/SmokeDependencies, `_State`-style
    renames for noUnusedParameters, `State.Specification!` non-null assertions,
    `State.Ledger[0] ?? ""` for noUncheckedIndexedAccess) is fixture-only, with ZERO assertion
    changes.

11. **The migration fallback.**

    The .mjs suites stay byte-identical and the runner still globs them until a later lane retires
    them.

    The ETS-only folders double-assert the R1 sections with the .mjs until L6 re-homes them.

---

1. **The stale suite count.**

    The note's "41 smoke suites" is stale: the current runner globs 21 per tree = 42.

    Recount at implementation time.

2. **The Build tool semantics.**

    Two questions remain: `--Watch` with two sequential invocations, and a `.ts` ESBuild config
    passed from a package root.

    The family already passes `Configuration/ESBuild.ts`, so that part is proven; the twin `.js`
    convention for the Test config needs one look at an existing `Configuration/ESBuild.js` header.

3. **The harness placement.**

    The blueprint chooses per-package Harness.ts because the fake-ctx seams differ subtly per
    bundle: the capturing fs, the real-token fs, and the commands seam.

    A per-tree shared harness, such as one shared file per TREE where `Classic/smokes/Harness.mjs`
    today is duplicated per suite, is a possible later refactor and out of scope.

4. **The wiring split.**

    The wiring suites' folder split is intentionally shallow at 2 folders.

    If the lane finds the live assertions resist splitting without breaking Run-Wiring.mjs's count
    arithmetic, keep the suite whole and note it in the handoff; the spec's 3-folder floor applies
    to the mechanics suites.

5. **The ets-base-dsh baseline.**

    ets-base-dsh's folders are new coverage, not a twin.

    Its PASS baseline is derived from the ets core smoke's re-homed sections minus those sections,
    so record the arithmetic in the L6 handoff and keep the ets core total >= baseline.

---

## 9. THE TOTALS LEDGER (the wrap-up lane, I8 - 2026-10-20)

The restructure is complete: every converted package's `Source/Test/` folders cover its suite, the
42 `.mjs` fallback files (21 per tree) are REMOVED, the runner's glob counts ONLY the folders, and
`node Maintain/Run-Smokes.m` is green.

Baseline = the `.mjs` suite's printed count, recorded immediately before removal, with each suite
green at removal time.

After = the sum of the package folder READMEs' expected counts, and the vacuously-green guard holds
because the runner compares printed vs README per folder.

### 9.1 The mechanics suites (per tree)

| Suite                                     | .mjs baseline | Folder sum after | Delta         |
| ----------------------------------------- | ------------- | ---------------- | ------------- |
| Classic/lib-dsh-core                      | 14            | 14               | 0             |
| Classic/plugin-dsh-factory                | 35            | 35               | 0             |
| Classic/hook-dsh-package-governor         | 78            | 78               | 0             |
| Classic/hook-dsh-package-pinner           | 32            | 32               | 0             |
| Classic/hook-dsh-cargo-governor           | 62            | 62               | 0             |
| Classic/hook-dsh-normalize-dash           | 184           | 184              | 0             |
| Classic/plugin-dsh-normalize-file         | 112           | 112              | 0             |
| Classic/hook-dsh-normalize-quotes         | 104           | 104              | 0             |
| Classic/hook-dsh-normalize-ellipsis       | 104           | 104              | 0             |
| Classic/hook-dsh-normalize-spaces         | 104           | 104              | 0             |
| Classic/hook-dsh-normalize-invisible      | 104           | 104              | 0             |
| Classic/hook-dsh-normalize-fullwidth      | 104           | 104              | 0             |
| Classic/hook-dsh-ccr                      | 146           | 146              | 0             |
| Classic/hook-dsh-tool-coach               | 129           | 129              | 0             |
| EffectTS/ets-lib-dsh-core                 | 17            | 14               | -3 (re-homed) |
| EffectTS/ets-plugin-dsh-factory           | 42            | 42               | 0             |
| EffectTS/ets-hook-dsh-package-governor    | 81            | 81               | 0             |
| EffectTS/ets-hook-dsh-package-pinner      | 32            | 32               | 0             |
| EffectTS/ets-hook-dsh-cargo-governor      | 62            | 62               | 0             |
| EffectTS/ets-hook-dsh-normalize-dash      | 184           | 184              | 0             |
| EffectTS/ets-plugin-dsh-normalize-file    | 112           | 112              | 0             |
| EffectTS/ets-hook-dsh-normalize-quotes    | 104           | 104              | 0             |
| EffectTS/ets-hook-dsh-normalize-ellipsis  | 104           | 104              | 0             |
| EffectTS/ets-hook-dsh-normalize-spaces    | 104           | 104              | 0             |
| EffectTS/ets-hook-dsh-normalize-invisible | 104           | 104              | 0             |
| EffectTS/ets-hook-dsh-normalize-fullwidth | 104           | 104              | 0             |
| EffectTS/ets-hook-dsh-ccr                 | 146           | 146              | 0             |
| EffectTS/ets-hook-dsh-tool-coach          | 129           | 129              | 0             |

Notes:

- **The L6 re-home arithmetic (ets-base-dsh).** The ets core `.mjs` baseline 17 = 14 (the eight
  shared folders) + 1 (Stream-Gate) + 2 (Update-Envelope).

    The Stream-Gate and Update-Envelope sections moved into the base's OWN test tree
    (`EffectTS/packages/ets-base-dsh/Source/Test/`), which is new coverage with no Classic twin.

    ets-base therefore totals 0 -> 3 (1 + 2, derived from the re-homed sections), and the ets core
    sum stays >= its shared-folder share with ZERO weakening (17 = 14 + 3 across the two packages,
    exactly preserved).

- **hook-dsh-live-containers / ets-hook-dsh-live-containers.** These are new packages from the site
  lanes, and no `.mjs` suite ever existed.

    Their folder sums of 105 per tree are pure NEW coverage, not a conversion, so they are excluded
    from the delta law below.

- The ETS governor's +3 and the ETS factory's +7 over Classic are the additive EffectTS coverage
  recorded at conversion, unchanged.

### 9.2 The wiring suites (per tree, live battery)

| Suite            | .mjs baseline          | Folder sum after (gate ON) | Delta |
| ---------------- | ---------------------- | -------------------------- | ----- |
| Scratch-Profile  | self-skip (no scratch) | 23                         | 0     |
| Profile-Assembly | self-skip (no scratch) | 16                         | 0     |
| Patch-Layer      | self-skip (no scratch) | 14                         | 0     |
| Live-Ledger      | self-skip (no scratch) | 38                         | 0     |
| Governed-Write   | self-skip (no scratch) | 13                         | 0     |
| Refusal-Path     | self-skip (no scratch) | 10                         | 0     |
| Introspection    | self-skip (no scratch) | 22                         | 0     |

The sums are identical in both trees: 136 checks per tree, 272 combined.

The `.mjs` originals are removed too.

The folders run under `Maintain/Run/Wiring/Index.mjs`, which sets the gate, and they self-skip inside the
aggregate without `DSH_TEST_SCRATCH`.

The `wiring-live.mjs` scaffold stays, because it is not a counted suite.

### 9.3 The roll-up

| Measure                                           | Before (the double-assertion window) | After (the retirement)                                                                                  |
| ------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Runner units (Maintain/Run/Smokes/Index.mjs final line) | 229 (42 .mjs + 187 folders)          | 187 (folders only)                                                                                      |
| Mechanics PASS, Classic                           | 1312                                 | 1417 (+105 = live-containers new coverage)                                                              |
| Mechanics PASS, EffectTS                          | 1325                                 | 1430 (+105 = live-containers; core -3 offset by ets-base +3)                                            |
| Converted-package deltas                          | -                                    | ZERO weakening, ZERO growth (the additive growth happened at conversion, recorded in the lane handoffs) |

### 9.4 The wrap-up lane's additional deliverables (BINDING)

1. **The declaration-hygiene sweep (the L5A finding).**

    Every converted `prepublishOnly.sh` gained the awaited fourth step
    `pnpm exec tsc -p tsconfig.json && pnpm exec tsc-alias -f -p tsconfig.json` (28 scripts;
    tool-coach already carried it).

    Surfacing the awaited emit fixed three problems: the live-containers pair's missing
    `exclude: ["Source/Test"]` (duplicate-input TS5055/TS5056), the governors' and pinner's
    strict-null test typing (fixture-only narrowing, zero assertion changes), and the ETS ccr dep
    skew (cordis 4.0.5 -> 4.0.4, tsc-alias aligned; the stray package-local node_modules removed so
    the hoisted root resolution applies).

    Tracked Targets were verified alias-free.

2. **The red-arbiter fix.**

    The old governor `.mjs` suites' Target-walk skipped the gitignored `Target/Test` subtree,
    because the converted folders' compiled output legitimately imports the factory.

    The minimal patch kept the `.mjs` green until the retirement.
