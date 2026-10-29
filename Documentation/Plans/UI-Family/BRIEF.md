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
		evidence: this document - @playform/client-dsh-panel-family, one central package, 13 adapters, no second panel package
---

# THE UI FAMILY IMPLEMENTATION PLAN - THE NEW-CONVERSATION BRIEF

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md. Read the foundations first, in this order:
> Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md (R-UI-1: the Plugins page slots);
> Documentation/Researches/HARNESS-UI-OPTIONS-RESEARCH.md (R-UI-2: the volatile config chain);
> Documentation/Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md (R-UI-3: the panel contract +
> adapters); Documentation/Researches/FAMILY-INTERACTIONS- RESEARCH.md (R-INTERACT: the ccr truth +
> R1-R10).

---

## 1. The state

- **WHAT EXISTS AND IS COMMITTED** (the git working tree was clean at the time of writing; HEAD
  ef58564):
    - The four research documents above, all committed.
    - The published family: 25 @playform packages at 0.0.1 (Classic, EffectTS, and ets-base-dsh).
      The Classic sources live in Classic/packages/<name>/.
    - 13 family bundles installed in the live desktop profile
      (~/.dsh/profiles/desktop/node_modules/@playform/, wired through
      ~/.dsh/profiles/desktop/cordis.patch.yml).
    - The site: Site/ (Astro, 21 pages), with the build command `cd Site && pnpm prepublishOnly`
      (outDir ./Target). The site is verified against the BUILT output only.
    - The smokes: 207 suites across the Classic and ETS twins, run via the aggregate runner
      (Maintain/Run/Smokes/Index.mjs). Each folder's README records its expected PASS count, and the
      runner compares printed against expected (the vacuously-green guard).
    - The harness docs repo: ~/Developer/Documentation/Module/deepseek-harness/, NOT
      ~/Developer/Documentation/deepseek-harness, because that path does not exist.
    - The running harness implementation, read in place and NEVER extracted: /Applications/DeepSeek
      Harness.app/Contents/Resources/app.asar/dsh/.
- **WHAT IS PENDING** (nothing is implemented yet):
    - The central panel package @playform/client-dsh-panel-family does not exist.
    - No family bundle has a browser half, so there is no dsh.client and no ./client export.
    - Zero family knobs are editable in the UI today.
    - The interaction improvements R1-R10 are unimplemented.

## 2. The order (the seven phases, summarized)

- Phase 0 - Orientation + the mount-failure investigation + live inspect
- Phase 1 - The site commit + push (READY-TO-COMMIT package; the user commits)
- Phase 2 - The panel contract (@playform/client-dsh-panel-family)
- Phase 3 - The first adapter: hook-dsh-tool-coach (ladder + its form POC)
- Phase 4 - The options forms (all volatile rows via whileServed)
- Phase 5 - The remaining adapters + the ledger tails (host/Typert endpoint)
- Phase 6 - The interaction improvements R1-R10
- Phase 7 - The plain-field bridge + the Option B trajectory sections

## 3. The routing (the law, from Documentation/Skill/task-routing and

Documentation/Skill/worker-strains)

- EVERY subagent delegation uses the provider cloudflare-workers-ai, the model
  @cf/zai-org/glm-5.3-flash, and reasoningEffort low.
- The explicit triple is ALWAYS passed.
- Exploration runs at low, coding runs at low then high, and planning runs on DeepSeek V4 Flash at
  max.
- Escalate ONLY on explicit ESCALATION markers or verification failures.

## 4. The arbiters (what proves each step done)

- **THE BUILD**: the serialized build exit 0 (the family's per-package Source/prepublishOnly.sh
  chain).
- **THE SMOKES**: "All 207 smoke suites passed" plus the per-folder expected-PASS-count comparison
  (Maintain/Run/Smokes/Index.mjs; vacuously-green guard).
- **THE SITE**: the site build, `cd Site && pnpm prepublishOnly`, then grep the BUILT Target/ HTML.
  NEVER use a dev server, and NEVER judge the source alone.
- **THE DRIFT** (the declare-then-verify discipline): the exact declared acceptance lines of EACH
  phase, checked ONE by ONE.
- **THE LIVE INSPECT**: cordis_inspect_query against the CLIENT providers (Slots.listSubTree,
  Service.listService). These queries REQUIRE the Web GUI page open (the GUI URL is
  http://127.0.0.1:52252 as of 2026-10-20). A closed page makes EVERY client query time out (see the
  risk register).

## 5. The disciplines (non-negotiable)

- **THE GIT LAW**: NEVER mutate git, and use checks ONLY
  (status/log/diff/show/rev-parse/ls-files/fetch). Every deliverable that needs a commit is reported
  READY-TO-COMMIT with the exact file list and the suggested message. The user commits and pushes.
- **THE FILE-WRITE LAW**: ALL file writes go through the write, raw-write, or edit tool API, and
  NEVER through terminal content edits. The normalize hooks are active, so prefer ASCII, and use
  raw-write or edit for ANY real unicode glyph.
- **NO DEV SERVERS** anywhere. The site verifies via its built output, and the harness GUI verifies
  via the live inspect plus the open page.
- **THE HARNESS CHECKOUT** (the .asar path) is read-only ground truth. NEVER modify it and NEVER
  extract it, and everything the family adds lives in family packages.
- **THE TOOL-COACH IS LIVE AND WATCHING**. The terminal runs COMMANDS (builds, tests, git, package
  managers), and the tools handle CONTENT (read, grep, and glob for file reads and searches, not
  head, cat, or terminal grep).

## 6. The naming arbitration (decided here; do not re-litigate)

- R-UI-1 sketched @playform/dsh-family-panel, and R-UI-3 sketched the panel-family name with the
  contract design.
- **THE DECISION**: the central package is @playform/client-dsh-panel-family, because the
  contract-first design wins and R-UI-1's registration surface folds into it as phase 2's first
  consumer.
- **THE 2026-10-21 SUPERSESSION**: the role-prefix contract
  (Documentation/Plans/Workspace-Family/NAMING-BY-ROLE.md) put the central panel package under the
  `client-` role prefix, so the name is now @playform/client-dsh-panel-family and its companion host
  package is @playform/client-dsh-panel-family-host. The arbitration's substance stands: one central
  contract package, with the client role prefix only. Do not re-litigate the role prefix.
- ONE central package, 13 per-bundle adapters, and NO second panel package.
