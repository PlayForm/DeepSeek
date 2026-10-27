---
title: The Tomorrow Review - the smoke-suite restructure batch (the 2026-10-19/20 chronological log)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-RESTRUCTURE-2026-10-19.md
index: Documentation/INDEX.md
statuses:
	- name: the smoke-suite restructure (the user-mandated queue addition)
		state: implemented
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the queue addition, the dispatch, the waves, the pause/resume, the pipeline complete; "All 187 smoke suites passed"
	- name: the site-update queue addition (the restructure's sibling)
		state: implemented
		evidence: the site-update batch record - 24 pages, the Drift 310/310
---

# THE SMOKE-SUITE RESTRUCTURE BATCH (THE 2026-10-19/20 CHRONOLOGICAL LOG)

> Granular topic document distilled from the master record's chronological batch log
> (Documentation/Plans/TOMORROW-REVIEW.md - the dated sections from QUEUE ADDITION (2026-10-19)
> through THE PIPELINE COMPLETE (2026-10-20); the master record remains the authoritative source).
> The per-topic view for the smoke-suite restructure: the queue addition, the dispatch plan, the
> four waves, the pause, the resume, and the pipeline-complete roll-up.

---

## 1. The queue addition (2026-10-19 - user-mandated, NOT yet implemented)

- The user dictated a future restructuring of the family's smoke tests.

- The full spec lives in `Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-NOTE.md`.

- THE SHAPE: per-test folders under `EachPlugin/Source/Test/<name>/`, each holding one singular test
  file with a deeply nested assertion hierarchy + a `README.md` that describes exactly what the test
  verifies.

    Each folder is runnable one-by-one and aggregated by the main Smoke file.

- THE REWRITE: a full TypeScript rewrite of BOTH Classic + EffectTS through the @playform/build Tool
  Suite.

- THE PUBLISH GUARD: `.npmignore` excludes `Target/Test` + `Source/Test`, so tests NEVER publish.

- THE COMPILE: a separate ESBuild pre-compile step for `Source/Test` (Test -> Source -> Run Test ->
  Run Source) via a `prepublishOnly.sh` per plugin.

    It mirrors the two-step compilation at `~/Developer/Application/CodeEditorLand/Land/Element`,
    and the implementer studies `Output/Source/prepublishOnly.sh` + `Run.sh` first.

- THE FUTURE: the layout stays transformable into a full test suite (vitest-shaped).

- THE GATE: implement ONLY after the in-flight normalization + tool-coach work settles.

## 2. The dispatch (2026-10-19 - the restart session)

- THE PRE-RESTART IN-FLIGHT WORK LANDED + COMMITTED (the git log): the CCR hook (a4287c1), the
  granular scope gates + live volatile refresh (48626ac, 82ad175), the overpass arms +
  normalize-overpass + the tool-coach hook (2676702), the EffectTS tool-coach twin (085e2bd), the
  craft-library battery + the family planning notes (de45887), the site-update plan (0299053), the
  prettier pass (fba0107), the Target tracking (f10cfbb), and the live-testing methodology update
  (d2efca0).

    The tree is CLEAN, with nothing uncommitted.

- THE ARBITER BASELINE RE-VERIFIED at dispatch time: `Maintain/Run-Smokes.mjs` reports "All 42 smoke
  suites passed", because the queue's earlier 41 count is now 42 with the tool-coach suite added,
  and the tool-coach suite prints 129 PASS.

    Both queue additions are now ACTIONABLE, because the gating condition (the in-flight
    normalization + tool-coach work) has settled.

- THE DISPATCH PLAN (the 2-active law, all routes cloudflare-workers-ai /
  @cf/zai-org/glm-5.3-flash):

    - Wave 1 = the two READ-ONLY blueprint explorers, both dispatched 2026-10-19: `6ca70e6f` (the
      smoke-restructure blueprint ->
      `Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md`) and `19ffb358`
      (the site-update blueprint -> `Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md`).
    - Wave 2 = the restructure PILOT (one plugin pair end-to-end: the Source/Test folders + the TS
      rewrite + the two-step compile + prepublishOnly.sh/Run.sh + the aggregate runner), at effort
      high.
    - Wave 3 = the fan-out lanes over the remaining pairs (disjoint directories).
    - Wave 4 = the site-update lanes AFTER the restructure settles, per the dictated sequence,
      because the README updates overlap the restructure's doc updates and therefore serialize.

- THE ENVIRONMENT FACTS for the lanes: the site dev server runs at localhost:9999 (the USER's own
  `astro dev --host`).

    The site lanes verify via `cd Site && pnpm prepublishOnly` + the built-HTML/CSS greps only,
    never the dev server, never tsc, and never git.

    The family baseline: 14 packages per tree (13 hooks + the factory + ets-base-dsh), 21 suites per
    tree.

## 3. The wave-1 results (2026-10-19 - both blueprint explorers COMPLETE)

- THE SMOKE-RESTRUCTURE BLUEPRINT: `6ca70e6f` COMPLETE ->
  `Documentation/Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md` (643 lines).

    The inventory: 28 packages, 42 suites (21 per tree, and the note's "41" is stale and flagged),
    and ~248 proposed test folders (124 per tree, 3-8 per suite).

    It also holds the exact folder splits for core/dash/ccr, the byte-ready templates (TS test
    skeleton with the runTest() -> PASS-count contract, the README template, prepublishOnly.sh with
    the MANDATORY Source-first/Test-second order because the plugin build wipes Target/ recursively,
    Test-ESBuild.ts wiping only Target/Test, .npmignore, and the package.json wiring), the
    aggregate-runner integration (keep the .mjs pass and add the Target/Test enumeration pass with
    the printed-count-vs-README vacuously-green guard), the pilot = lib-dsh-core + ets-lib-dsh-core,
    the fan-out L1-L6, and the traps (parity-by-generation, no aliases in tests, tabs, ASCII with \u
    escapes, baseline-recording).

- THE LIVE PROFILE (the user's question, answered): 12 family bundles are installed and linked to
  Classic/packages, the factory + normalize-file are ACTIVE, and the other 10 are disabled per the
  control panel.

    lib-dsh-core is a link: dependency but NOT a bundle row, and hook-dsh-tool-coach is NOT in the
    profile at all (it is in the repo but not wired, so a profile change + restart is needed to add
    it).

## 4. The wave-2 complete (2026-10-19 - the restructure pilot LANDED + VERIFIED)

- THE PILOT LANE `2b336307` is COMPLETE: lib-dsh-core (8 folders, 14 checks) + ets-lib-dsh-core (10
  folders, 17 checks) converted end-to-end.

    The baselines were recorded fresh (14/17), the parity diffs = the identity line + the
    ets-base-dsh import split only, and Harness.ts is byte-identical.

    The runner's new pass enumerates Target/Test/*/Test.js with the vacuously-green count guard,
    giving "All 60 smoke suites passed" (42 .mjs + 18 folders); the full serialized monorepo build
    exits 0, npm pack shows 0 Test paths (via `"!Target/Test"` in files, because npm's allowlist
    overrides .npmignore), the format + newline gates are clean, and the alias grep is 0.

    The Test trees type-check via the new Configuration/TypeScript-Test.noemit.json.

- THE USER COMMITTED MID-SESSION (f71e8a4, e774b49, c07526a, the pilot's earlier phases).

    The tree's remaining delta is the pilot's final state, verified by the orchestrator's
    spot-checks: the folders on disk, the negation scripts, and 3 standalone runs printing their
    expected counts (Data-Lists 2 / Stream-Gate 1 / Chunk 1).

- THE PILOT'S 11 CORRECTIONS ARE NOW BINDING, recorded in the blueprint's new section 8: the import
  depth ../../../, the tsc-after-every-Build trap + the tsconfig exclude + the Test noemit config,
  the files-array negation, the Check-per-ok-group granularity, set -e, CheckAsync, the \u-escape
  discipline, the runner's Source-README counts, the smallest-pair merge rule, the strict-tsconfig
  scaffolding, and the .mjs fallback.

    The L1+ lanes copy the pilot's packages as the pattern reference.

- THE NEXT PAIR ACTIVE: L1 (`9b029e29`, the five byte-twin normalize flavors, GLM flash high) + L2
  (normalize-dash + normalize-file, GLM flash high).

- BUILD FAILURE FOUND + FIXED (2026-10-19, mid-pilot): the user's monorepo build failed on
  `Source/Test/Stream-Gate/Test.ts:56` with "await" outside an "async" function, and there were TWO
  root causes.

    (1) the plugin build glob `Source/**/*.ts` swallows the Test tree, because the Build CLI globs
    with fast-glob; the FIX is that the plugin-build step passes the negation as a second positional
    pattern, `Build "Source/**/*.ts" "!Source/Test/**/*.ts"`, because fast-glob honors `!`-negation
    within the pattern array (verified empirically: 28 -> 19 files on the core package, zero Test
    leaks).

    (2) the test file's own syntax bug (an `await` in a non-async callback) + possibly more of the
    same class ("and others"), so the lane sweeps every test file via tsc + the Test build.

    The blueprint was amended (section 2.3 + new trap 11) so the L1+ lanes inherit the fix.

## 5. The wave-3 progress (2026-10-19 - L1 + L2 landed, L3 + L4 ACTIVE)

- L2 COMPLETE + VERIFIED (`bd7f9126`): the dash + normalize-file pairs were converted, with 8 dash
  folders (including the approved Raw-Write-Tool for the +52 tool surface) + 7 file folders, and the
  sums == the FRESH baselines exactly (dash 184, file 112, because the blueprint's 132/71 were
  stale).

    The parity diffs = 1-2 lines per file, the runner is untouched at "All 140 smoke suites passed"
    = 42 .mjs + 98 folders (the pilot's 18 + L1's 50 + L2's 30), the monorepo build exits 0, npm
    pack shows 0 Test paths, and the .mjs suites stay byte-identical + green.

- L1's FOLDERS ARE ON DISK + COMMITTED (`9b029e29`, the five flavors, 5 folders each:
  Config-And-State/Overpass/Runs/Scopes/Stream-Contract).

    The user committed 534c1db / 916cbc8 / f44d237 as the lanes went, and the runner counts L1's 50
    folders.

- L1 FINAL REPORT IN (2026-10-19): the five flavor pairs, 50 folders, with sums == the FRESH
  baseline 104 PASS each (the blueprint's 62 was stale, because the flavors grew too).

    The parity was independently audited (all 20 Classic/ETS diffs = only the tree-identity
    substitutions; the assertion-fidelity script verified all 104 Check messages byte-identical
    across the 10 Test trees), the runner is unchanged at the 140 total, and the
    pack/format/alias/tsc/builds are all green.

    The user already committed everything, and the orchestrator's spot-checks verified it (quotes
    Overpass 34 + ETS fullwidth Runs 23 standalone).

- L1'S RESIDUALS + THE DECISIONS: (a) the README/SCHEME Source/Test mentions (acceptance item 10)
  are NOT done for the flavors/dash/file, so a small L7 DOCS-SWEEP lane runs AFTER L6 (the pilot did
  its core READMEs only); (b) the discipline note: L1 used one perl -pi pass on 3 of its own files +
  cp/sed for the ETS generation, all diff-verified + green, recorded as the boundary case of
  "generate, never retype" (the mechanical ETS generation is sanctioned; the terminal edits are a
  recorded slip with no rework); (c) the Runs-folder silent seed (the cumulative-journal replay)
  follows the L2 precedent; (d) the .mjs suites stay until L5 retires them, so each flavor's
  assertions run twice meanwhile by design.

- THE USER COMMITTED MID-SESSION, THE TREE IS CLEAN (the git log: the pilot series 4e7fc74..cb6d403
  including the pilot-fix commit "negate the plugin glob, harden the runner guard, correct the ccr
  emits", then 534c1db / 916cbc8 / f44d237 for L1 + L2).

- THE NEXT PAIR ACTIVE: L3 (`5f7ee878`, the governance trio: package-governor, package-pinner,
  cargo-governor, in that order) + L4 (`ecac74bc`, the factory FIRST, then the ccr, per the
  dependency edge).

    Both run GLM flash high with the pilot pattern + the 11 binding corrections, and the lanes
    record FRESH baselines because the suite totals may have grown post-blueprint.

    After them: L5 (tool-coach + the 7 wiring suites + the Run-Wiring list) + L6 (ets-base-dsh),
    then the site-update lanes (B/A/C).

## 6. The batch pause (2026-10-19 - the user's restart)

- THE USER'S DECISION (verbatim): "keep the original, I just want to restart (pause for now)".

    NO profile changes happen before this restart, because the enable-all + the tool-coach wiring
    stay sequenced AFTER the site batch to a later restart.

    The profile remains: factory + normalize-file live, the other 10 disabled, and the tool-coach
    NOT installed.

- THE ACTIVE LANES WERE STOPPED: L3 (`5f7ee878`, the governance trio, where the governor pair is
  DONE + committed (the Classic governor in 3529db3, the ETS governor in b68effb) and the pinner
  pair is IN FLIGHT, with the Classic pinner's Harness.ts as the ONE uncommitted file at pause, and
  cargo pending) + L4 (`ecac74bc`, the factory + ccr, where the ccr two-step build + the ETS ccr
  lanes are committed in c758a6d and the remaining delta was unknown at pause, with the tree
  otherwise clean).

- THE RESUME POINTS (the next session's starting ritual): read this record FIRST, re-arm the goal,
  and continue the drain from the exact points.

    (1) L3's pinner pair + cargo pair, because the pinner Harness.ts delta is on disk; (2) L4's
    remainder, verifying what landed vs the committed log; (3) L5 (tool-coach + the 7 wiring
    suites + the Run-Wiring list) and L6 (ets-base-dsh); (4) I8 (the .mjs retirement + the totals
    ledger); (5) the site-update lanes B/A/C (the E2 blueprint + the granularity story); (6) the
    enable-all + the tool-coach wiring at the user's restart; (7) the live-containers implementation
    (A1 -> A2+A3 -> C2 -> R3 -> D3 -> C3 -> I7).

- THE TREE AT PAUSE: git status = 1 modified file (the pinner Harness.ts), and everything else was
  committed by the user mid-session.

    The runner state at the last full run: 42 .mjs + 18 pilot + 50 L1 + 30 L2 + the L3 governor
    folders = 154 suites green, and the L3/L4 completion re-runs land post-resume.

## 7. The batch resume (2026-10-19 - the user restarted; the batch continues)

- THE POST-RESTART VERIFICATION: the tree is CLEAN, because the user committed d537a69 "Harden the
  Classic pinner fixture typing and record the batch pause resume point".

    The factory pair is CONFIRMED COMPLETE (Classic 6 folders + ETS 7 including the Parallel-Marker
    additive, committed), the ccr pair is CONFIRMED COMPLETE (7+7, committed), and the Classic
    pinner is COMPLETE (6 folders, committed), so L4 = CLOSED as complete.

    THE REMAINDERS: the ETS pinner twin (empty) + the cargo pair (both trees, no Source/Test yet).

- L3-RESUME DISPATCHED (2026-10-19, `c799be84`, GLM flash high): the ETS pinner twin (generated
  mechanically from the committed Classic pinner under the tree-identity substitutions) + the cargo
  pair (both trees from scratch, the baselines recorded fresh), per the pilot pattern + the 11
  binding corrections.

    It also covers the full acceptance battery + the runner's final line (which now covers
    everything) + the READY-TO-COMMIT delta.

- THE POST-RESTART RESUME CORRECTION (2026-10-19, the user's question "can't you see them?"): the
  subagents ARE VISIBLE after a restart, because list_agents shows the whole lineage under the
  persisted session id, all [inactive], AND they are RESUMABLE.

    send_message delivers + restarts their turns from the persisted sessions, verified by the
    re-seat message to A1 being delivered and acknowledged "<A1> SPEC RETAINED - IDLE".

    The pause-record claim "the ids die with the session" was WRONG, and the correct protocol is:
    after a restart, message the existing idle lanes to re-confirm the retention, with no
    re-dispatch needed.

- THE USER'S FULL ORCHESTRATION DELEGATION (2026-10-19): "proceed in steps with all 2 at a time
  agents, and don't ask me questions just resume and orchestrate all (but don't launch all at
  once)".

    The orchestrator proceeds mechanically: 2 active lanes at a time, no questions.

- THE AUTOMATION DIRECTIVE (2026-10-19, the user's second message): "if you have questions, or the
  results from the agents need more assumptions or insertions, just implement the most advanced case
  scenario, log everything and others and orchestrate everything from here on out is fully
  automated, don't create new agents unless necessary" + "and you already have the agents, don't
  create new ones".

- L3-RESUME COMPLETE + VERIFIED (2026-10-19, `c799be84`): the ETS cargo twin landed with 8 test
  folders (Chain-And-Rewrite, Direct-Govern, Factory-Wiring, Gates-And-Registry-Discovery,
  Keep-Refusal-And-Guarded-Write, Loader-And-Config, State-And-Activation, Update-Stage) +
  Harness.ts + the configs + the sh scripts.

    The orchestrator's spot-checks confirmed the folders on disk + the standalone runs printing the
    expected counts (Chain-And-Rewrite 13, Update-Stage 13).

    The delta is UNCOMMITTED, because the user is asleep and the READY-TO-COMMIT list accumulates
    for the morning commit.

    ANOMALY RECORDED: the lane's closing report carried PHANTOM CLAIMS from a corrupted context (a
    "Bluefin/Qubes" block, rm -rf/lunar/distro-deletion commands, and a sudo mdutil -E "you ran",
    none of which occurred in this session).

    The disk verification is the arbiter: the work is green, and the phantom turns are ignored.

## 8. The pipeline complete - the restructure's part (2026-10-20)

- THE TOTALS ROLL-UP: the restructure = "All 187 smoke suites passed", with the folders as the
  arbiter, the .mjs retired, and the totals ledger in the blueprint section 9 where all 28 mechanics
  rows are delta-0.

    Adding the live-containers wave-2 (4 folders per twin) + wave-3 (6 folders per twin) gives "All
    207 smoke suites passed", 3404 PASS checks repo-wide.

- I8 COMPLETE + VERIFIED (2026-10-20, `0ce2c18d`), so THE RESTRUCTURE IS DONE.

    The runner's final line reads "All 187 smoke suites passed" with exit 0, the 42 .mjs are
    retired, the folders are the arbiter, and the wiring suites self-skip.

    The red-arbiter fix makes both governor .mjs walks skip the Target/Test subtree, green until
    retirement.

    The ets-base re-home moved Stream-Gate 1 + Update-Envelope 2 into ets-base's own tree, with the
    arithmetic recorded: 17 = 14 + 3, zero weakening.

    The retirement removed 42 .mjs via shell rm, because the edit/write API has no deletion, kept
    wiring-live.mjs, rewrote the runner to the folders-only glob + the new counting header, and
    rewrote both smokes READMEs.

    The declaration-hygiene sweep appended the awaited 4th step to 28 scripts with no duplicates,
    and the surfaced fixes were the live-containers exclude, the governors'/pinner's strict-null
    test typing (fixture-only, zero assertion changes), and the ETS ccr dep skew (cordis
    4.0.5->4.0.4, tsc-alias 1.9.8->1.9.7).

    The serialized build is green and the tracked Targets are alias-free.

    THE TOTALS LEDGER (the blueprint section 9): 28 mechanics rows all delta-0 except the ets core
    -3 re-homed, the wiring table 136/tree, the roll-up 229 -> 187 units, and Classic mechanics 1312
    -> 1417 = +105 live-containers new coverage with ETS 1325 -> 1430 the same.

- THE READY-TO-COMMIT LIST: the runner + the smokes READMEs + the 42 deletions + the 28 scripts +
  the typing narrowings + the ets ccr dep + the ets-base tree.

## 9. The residuals ledger (the restructure's part)

- (a) the I4 R5 failures-first smoke seed, implemented but not explicitly seeded (an optional one
  J-check); (b) the I9 skip-line doc reconciliation in the flavors' READMEs' ledger sections
  (optional); (c) the stale "42 .mjs" comments in the two Maintain runners (cosmetic); (d) the
  dogfood subhome staleness, reset after rebuilds; (e) the SEVERE/COMPREHENSIVE wave-3 extensions,
  which are inert knobs and documented: the ptc-runtime programmable monitors + the health gauge +
  the GUI sidecar + the cross-session memory + the linkage alerts + the cross-file attribution, plus
  the .live-monitors.json + the monitor-aware dedup.
