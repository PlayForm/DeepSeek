---
title: The Tomorrow Review - the alias-sweep incident + the corrected direction (2026-10-20)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-ALIAS-SWEEP-2026-10-20.md
index: Documentation/INDEX.md
statuses:
	- name: the alias-sweep incident (the 97-file deletion)
		state: resolved
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - the user restored all the deleted files; 0 deletions remain; the lesson recorded
	- name: the user's corrected direction (the binding clarifications)
		state: resolved
		evidence: the tsconfig path aliases + rootDir stay; the manual tsc-alias/awaited-tsc step removed; the scripts live in Source/; the Compress/Land designs borrowed
	- name: the corrected-sweep lane (the whole-tree reconcile)
		state: implemented
		evidence: `d7227988` - 215 Source .ts files reverted to the aliases (git diff 94b9f66 = 0 files); 31/31 packages with Source/prepublishOnly.sh + Source/Run.sh; the serialized build exit 0
	- name: the site-demo-fix lane
		state: implemented
		evidence: `7273f92e` - the repeating-stream sweep + the coach typed state machine + the supports example-swap + the copy restructure + the tier-focus bug fix
	- name: the site-diagrams lane
		state: implemented
		evidence: `90645125` - 57 new diagram sources, 319/319 mmd+svg integrated, zero placeholders; the renderer repaired for Mermaid 12.2.0
---

# THE ALIAS-SWEEP INCIDENT + THE CORRECTED DIRECTION (2026-10-20)

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the ALIAS-SWEEP
> INCIDENT section; the master record remains the authoritative source).

---

## 1. The incident

- THE ALIAS-SWEEP lanes (dispatched per the orchestrator's misreading of
  the user's tsc-alias instruction) ran a scripted conversion pass that
  DELETED 97 source files (66 Classic + 31 ETS - the packages' core
  sources + the scripts).
- The lanes were STOPPED immediately.
- The orchestrator began the lawful manual restoration (the git show +
  the write tool - NEVER git mutations).
- THE USER took over + manually restored all the deleted files (verified:
  0 deletions remain; the restored files carry the original bytes - the
  aliases + the tsc-alias steps intact).
- LESSON (recorded): the file-write law's "scripted pass" allowance was
  the hole. The corrected lanes are EDIT-TOOL-ONLY, NO scripted
  filesystem passes.

## 2. The user's corrected direction (their clarifications, binding)

- (1) the tsconfig path ALIASES + the rootDir STAY (the Compress-style
  tsconfigs - the user asked "why did the agents remove rootDir +
  paths");
- (2) the MANUAL tsc-alias/awaited-tsc step is REMOVED - @playform/build
  runs tsc + tsc-alias INTERNALLY awaited (verified against the Build
  repo: Source/Function/Build.ts:160,163 - the L5A "fire-and-forget"
  finding was wrong);
- (3) prepublishOnly.sh + Run.sh live in Source/ for EVERY package (the
  user's instruction);
- (4) the family borrows the Compress/Land designs (the
  @playform/build/tsconfig base + the config conventions - the ALIGN
  consideration recorded).
- The earlier alias-removal direction was the orchestrator's
  misinterpretation - superseded.

## 3. The corrected-sweep lane (the whole-tree reconcile)

- THE CORRECTED-SWEEP LANE (`febb5997`, GLM flash high) DISPATCHED: the
  whole-tree reconcile - the tsconfigs' rootDir + paths restored, the
  partial relative-import conversions reverted to the aliases, the
  scripts moved to Source/ + the tsc-alias/awaited-tsc step removed, the
  arbiters: the serialized 29-package build + the 207 suites + the
  declaration hygiene + the parity. EDIT-TOOL-ONLY (the hard lesson).
- THE ALIAS-REVERT LANE COMPLETE + VERIFIED (2026-10-20, `d7227988`):
  the whole-tree reconcile landed - 215 Source .ts files reverted to the
  @Function/@Interface/@Variable aliases (the ultimate arbiter: `git diff
  94b9f66 --name-only -- '*/Source/*.ts'` = 0 files - every Source tree
  byte-identical to the alias baseline; the user's mid-flight commit
  cd013dd captured part of the lane's state - the reverts stand as
  unstaged on top); the scripts: all 31 packages with
  Source/prepublishOnly.sh + Source/Run.sh + the correct shape (the Build
  plugin + the Test Build + the selfcheck + the test-tree tsc; zero
  awaited-tsc/tsc-alias steps); the tsconfigs: 31/31 with the rootDir +
  the paths; the CRLF repair (9 cargo Test files - the earlier scripted
  pass's residue - the newline gate clean 1490 files); the serialized
  build exit 0 + "All 207 smoke suites passed". READY-TO-COMMIT: 360
  files (215 alias reverts + 9 CRLF repairs + ~136 rebuilt Targets). The
  CORRECTED-SWEEP lane's mandate is fulfilled by this lane (the former
  was stopped - its destructive fan-out plan). The SITE-DEMO-FIX lane
  (`7273f92e`) is the remaining active lane (the repeating-stream + the
  coach state machine + the supports placement).

## 4. The site-demo-fix lane (complete, `7273f92e`)

- All the mandates landed + verified - the repeating-stream sweep (the
  homepage hero + the workbench: one-pass-then-settle, click-to-restart),
  the coach typed state machine (the discriminated union
  idle/judging/noting/escalated/denied/cleared + the toggle-able tiers +
  the non-sticky cards + the de-static markup + the idempotent wiring),
  the supports example-swap (the npm-mark red chip + the cargo-gear
  orange chip + the per-manifest templates + the dsh:example swap + the
  real cargo story), the copy restructure (the tagged
  one-topic-per-line panels), AND the tier-focus bug fix (the root cause:
  the STATIC is-active markup - the machine was correct).
- The Drift's 31 plugin-freshness failures = the parallel lane's rebuilds
  (outside the site surface).
- READY-TO-COMMIT: the index/Showcase/SupportsButton + the Targets.

## 5. The site-diagrams lane (complete, `90645125`)

- 57 NEW diagram sources authored + rendered + integrated (the ccr 18,
  the tool-coach 10, the live-containers 6, the flavor scopes/overpass
  14, setup 3, case-study P7 3, misc 3) - 319/319 mmd+svg, 319/319
  Concept slots implemented, ZERO placeholders in the built HTML.
- The STALE sources updated (plugins-seams "the twelve plugins" -> the
  15 + 7 -> 10 seams; versions-arbiter "the twelve smoke suites" -> the
  14).
- THE RENDERER REPAIRED for Mermaid 12.2.0 (the tspan class suffixes,
  the wrappingWidth 200 restore, the classic/base look pin, the
  entity-escaped labels) - the committed pipeline had been failing on
  100% of the diagrams.
- Incident (disclosed + recovered): a pre-fix render transiently deleted
  the 262 committed SVGs - restored from git + re-rendered, no loss.
- The bulk committed by the user (b121d209 + 197df81f).
- RESIDUALS: the live-containers page lacks the wave-2/3 sections (the
  stories live only in the package SCHEME - the 6 live-* diagrams revisit
  if the page gains those sections), 14 orphan mmd files (pre-existing),
  the plugin-Target freshness drift (a serialized rebuild clears them).

## 6. The UI researches (2026-10-20)

- R-UI-1 + R-UI-2 COMPLETE (the HARNESS-UI-PLUGIN-RESEARCH +
  HARNESS-UI-OPTIONS-RESEARCH - the Plugins page's child slots + the
  config-forms chain + the browser-half PoC).
- R-INTERACT COMPLETE (2026-10-20, `a3ea828a`): the FAMILY-INTERACTIONS-
  RESEARCH delivered - the per-plugin one-pagers + the interactions
  matrix (the best synergy: the ccr+normalize overpass ordering - the
  OUTERMOST prepend + the marker guard; the top friction: the coach blind
  to the persistent terminals + the terminal fs effects bypassing the
  governance chain + the silent govern-skip + the #14 design-only). THE
  USER'S EXAMPLE RESOLVED: NO "ccr.db" and NO sqlite anywhere (the phrase
  = the Aphrodite SQLite original's comments; the ccr = the in-memory LRU
  + the optional JSONL journal, live = memory-only); the ledgers = the
  plain-text ~/.dsh/*.log files; ccr_retrieve = RETRIEVAL-ONLY
  (hash-exact from the marker, strict parse, self-describing misses, NO
  search/list API). The coach's "grep ccr.db -> ccr_retrieve" mapping =
  HALF-TRUE (retrieval != search; the correct search = the harness grep
  over the plain-text ledgers); no marker-usage rule exists.
  RECOMMENDATIONS R1-R10 (the ccr_list/ccr_search tool, the journal
  persistence guidance, the ledger-search teaching, the TTL extension,
  the coach marker-usage rule, the re-scoped grep-ccr.db text, the
  terminal_send judging coverage, the govern-skip ledger line, the #14
  land-or-delete, the hard-coded logFile default fix) - ready for the
  implementation lanes.
- R-UI-3 COMPLETE (2026-10-20, `c4270222`) - THE TRAJECTORY + ADAPTER
  ARCHITECTURE: the HARNESS-UI-TRAJECTORY-RESEARCH delivered. THE
  VERDICT: the trajectory screen is CLOSED for additive sections
  (dsh-client-ui-trajectory declares ONLY conversation.trajectory.images
  - image rendering in the attachment rows; no toolbar/detail/tail/
  section slots - vs the plugin-manager's 9 slots). THE SEAMS: (a) the
  images slot (images only); (b) conversation.view's list slot (the
  SCREEN-level seam - the trajectory occupies id=trajectory order=10,
  chat id=chat - a plugin can inject a SIBLING FAMILY TAB - Option A: no
  harness changes); (c) the data seams (useTrajectory,
  sessions.loadOlder, the raw session events); (d) the priority
  shadowing of id=trajectory (replaces the screen - not recommended);
  (e) the detached panels via the shell overlay/sidebar. Option B = an
  upstream conversation.trajectory.sections declaration (owner-only,
  harness-side). THE ARCHITECTURE (the user's dictates formalized): the
  central @playform/dsh-panel-family client half provides the contract
  (PanelSection types + the registry service
  ctx.reflect.provide("playformFamilyPanel") + the open() launch
  protocol); each of the 13 bundles gets its own client half that
  reflect-looks-up the registry, NO-OPS when absent, gates on ITS OWN
  config (the per-plugin panel.* keys), registers its descriptor in
  ctx.effect. Config segregation: zero shared config - only the
  import-type contract types. The cascade: the central disabled -> the
  registry absent -> all the adapters dormant; per-adapter toggle -> the
  descriptor withdrawn + the central re-renders; the central master
  switch -> the whole mount collapses. The POC: the tool-coach ladder
  first. THE RESEARCH SET IS COMPLETE (R-UI-1/2/3 + R-INTERACT): the
  implementation briefs are ready (the family panel, the UI-powered
  options, the trajectory family tab, the interaction improvements
  R1-R10) - the user dispatches them on his word. The SITE-DEMO + the
  SITE-DIAGRAMS deltas await the user's commit + push; the plugin-Target
  freshness drift clears with a serialized rebuild.
