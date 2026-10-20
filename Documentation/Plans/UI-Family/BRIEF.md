---
title: The UI Family Implementation Plan - the new-conversation brief
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/BRIEF.md
index: Documentation/INDEX.md
statuses:
	- name: the new-conversation brief (the state, the order, the routing, the arbiters, the disciplines, the naming)
		state: open
		evidence: this document - pasted/read first by the implementing session
	- name: the naming arbitration (the central package decision)
		state: resolved
		evidence: this document - @playform/dsh-panel-family, one central package, 13 adapters, no second panel package
---

# THE UI FAMILY IMPLEMENTATION PLAN - THE NEW-CONVERSATION BRIEF

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.
> The foundations (read these first, in this order):
> Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md (R-UI-1: the
> Plugins page slots); Documentation/Researches/HARNESS-UI-OPTIONS-RESEARCH.md
> (R-UI-2: the volatile config chain);
> Documentation/Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md (R-UI-3: the
> panel contract + adapters); Documentation/Researches/FAMILY-INTERACTIONS-
> RESEARCH.md (R-INTERACT: the ccr truth + R1-R10).

---

## 1. The state

- **WHAT EXISTS AND IS COMMITTED** (git working tree clean at the time of
  writing; HEAD ef58564):
  - The four research documents above (all committed).
  - The published family: 25 @playform packages at 0.0.1 (Classic +
    EffectTS + ets-base-dsh). The Classic sources live in
    Classic/packages/<name>/.
  - 13 family bundles installed in the live desktop profile
    (~/.dsh/profiles/desktop/node_modules/@playform/, wired through
    ~/.dsh/profiles/desktop/cordis.patch.yml).
  - The site: Site/ (Astro, 21 pages), build = `cd Site && pnpm
    prepublishOnly` (outDir ./Target). It is verified against the BUILT
    output only.
  - The smokes: 207 suites across the Classic/ETS twins, run via the
    aggregate runner (Maintain/Run-Smokes.mjs). Each folder's README
    records its expected PASS count. The runner compares printed vs
    expected (the vacuously-green guard).
  - The harness docs repo: ~/Developer/Documentation/Module/deepseek-harness/
    (NOT ~/Developer/Documentation/deepseek-harness - that path does not
    exist).
  - The running harness implementation, read in place, NEVER extracted:
    /Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/.
- **WHAT IS PENDING** (nothing is implemented yet):
  - The central panel package @playform/dsh-panel-family does not exist.
  - No family bundle has a browser half (no dsh.client, no ./client
    export).
  - Zero family knobs are editable in the UI today.
  - The interaction improvements R1-R10 are unimplemented.

## 2. The order (the seven phases, summarized)

- Phase 0 - Orientation + the mount-failure investigation + live inspect
- Phase 1 - The site commit + push (READY-TO-COMMIT package; the user
  commits)
- Phase 2 - The panel contract (@playform/dsh-panel-family)
- Phase 3 - The first adapter: hook-dsh-tool-coach (ladder + its form
  POC)
- Phase 4 - The options forms (all volatile rows via whileServed)
- Phase 5 - The remaining adapters + the ledger tails (host/Typert
  endpoint)
- Phase 6 - The interaction improvements R1-R10
- Phase 7 - The plain-field bridge + the Option B trajectory sections

## 3. The routing (the law, from Documentation/Skill/task-routing and
Documentation/Skill/worker-strains)

- EVERY subagent delegation: provider cloudflare-workers-ai, model
  @cf/zai-org/glm-5.3-flash, reasoningEffort low.
- The explicit triple is ALWAYS passed.
- Exploration = low; coding = low then high; planning = DeepSeek V4 Flash
  max.
- Escalate ONLY on explicit ESCALATION markers or verification failures.

## 4. The arbiters (what proves each step done)

- **THE BUILD**: the serialized build exit 0 (the family's per-package
  Source/prepublishOnly.sh chain).
- **THE SMOKES**: "All 207 smoke suites passed" + the per-folder
  expected-PASS-count comparison (Maintain/Run-Smokes.mjs; vacuously-green
  guard).
- **THE SITE**: the site build: cd Site && pnpm prepublishOnly, then grep
  the BUILT Target/ HTML. NEVER a dev server, NEVER the source alone.
- **THE DRIFT** (the declare-then-verify discipline): the exact declared
  acceptance lines of EACH phase, checked ONE by ONE.
- **THE LIVE INSPECT**: cordis_inspect_query against the CLIENT providers
  (Slots.listSubTree, Service.listService). These REQUIRE the Web GUI
  page open (the GUI URL is http://127.0.0.1:52252 as of 2026-10-20). A
  closed page makes EVERY client query time out (see the risk register).

## 5. The disciplines (non-negotiable)

- **THE GIT LAW**: NEVER mutate git. Checks ONLY
  (status/log/diff/show/rev-parse/ls-files/fetch). Every deliverable that
  needs a commit is reported READY-TO-COMMIT: the exact file list + the
  suggested message. The user commits and pushes.
- **THE FILE-WRITE LAW**: ALL file writes go through the write/raw-write/
  edit tool API - NEVER terminal content edits. The normalize hooks are
  active: prefer ASCII. Use raw-write/edit for ANY real unicode glyph.
- **NO DEV SERVERS** anywhere. The site verifies via its built output.
  The harness GUI verifies via the live inspect + the open page.
- **THE HARNESS CHECKOUT** (the .asar path) is read-only ground truth.
  NEVER modified, NEVER extracted. Everything the family adds lives in
  family packages.
- **THE TOOL-COACH IS LIVE AND WATCHING**. The terminal runs COMMANDS
  (builds, tests, git, package managers). The tools handle CONTENT
  (read/grep/glob for file reads and searches - not head/cat/terminal
  grep).

## 6. The naming arbitration (decided here; do not re-litigate)

- R-UI-1 sketched @playform/dsh-family-panel; R-UI-3 sketched
  @playform/dsh-panel-family with the contract design.
- **THE DECISION**: the central package is @playform/dsh-panel-family
  (the contract-first design wins; R-UI-1's registration surface folds
  into it as phase 2's first consumer).
- ONE central package, 13 per-bundle adapters, NO second panel package.
