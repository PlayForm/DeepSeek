---
title: The UI Family Implementation Plan
category: Plans
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md
index: Documentation/INDEX.md
statuses:
  - name: the implementation plan (the expanded brief)
    state: open
    evidence: this document - awaiting the user's dispatch
  - name: the four research inputs (R-UI-1/2/3 + R-INTERACT)
    state: resolved
    evidence: Documentation/Researches - all four delivered
  - name: the central @playform/dsh-panel-family package
    state: open
    evidence: planned, no package exists
  - name: the 13 per-plugin client adapters
    state: open
    evidence: planned, no package exists
  - name: the tool-coach adapter (the first, with the marker-usage rule)
    state: open
    evidence: planned as the POC
  - name: the trajectory family tab (Option A)
    state: open
    evidence: planned; the upstream trajectory.sections declaration is Option B
---

UI-FAMILY-IMPLEMENTATION-PLAN
=============================
The expanded, exact, step-by-step plan for implementing the researched DeepSeek
Harness UI features for the @playform plugin family. Written 2026-10-20 by the
PLAN-EXPANDER explorer agent. ASCII + tabs. This file is the handoff document
for a NEW conversation that begins implementation.

Foundations (read these first, in this order):
	Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md      (R-UI-1: the Plugins page slots)
	Documentation/Researches/HARNESS-UI-OPTIONS-RESEARCH.md     (R-UI-2: the volatile config chain)
	Documentation/Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md  (R-UI-3: the panel contract + adapters)
	Documentation/Researches/FAMILY-INTERACTIONS-RESEARCH.md    (R-INTERACT: the ccr truth + R1-R10)

================================================================================
0. THE NEW-CONVERSATION BRIEF (paste/read this section first)
================================================================================

0.1 THE STATE

What exists and is committed (git working tree clean at the time of writing;
HEAD ef58564):
- The four research documents above (all committed).
- The published family: 25 @playform packages at 0.0.1 (Classic + EffectTS +
	ets-base-dsh); the Classic sources live in Classic/packages/<name>/.
- 13 family bundles installed in the live desktop profile
	(~/.dsh/profiles/desktop/node_modules/@playform/, wired through
	~/.dsh/profiles/desktop/cordis.patch.yml).
- The site: Site/ (Astro, 21 pages), build = `cd Site && pnpm prepublishOnly`
	(outDir ./Target), verified against the BUILT output only.
- The smokes: 207 suites across the Classic/ETS twins, run via the aggregate
	runner (Maintain/Run-Smokes.mjs); each folder's README records its expected
	PASS count and the runner compares printed vs expected (the vacuously-green
	guard).
- The harness docs repo: ~/Developer/Documentation/Module/deepseek-harness/
	(NOT ~/Developer/Documentation/deepseek-harness - that path does not exist).
- The running harness implementation, read in place, never extracted:
	/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/.

What is PENDING (nothing is implemented yet):
- The central panel package @playform/dsh-panel-family does not exist.
- No family bundle has a browser half (no dsh.client, no ./client export).
- Zero family knobs are editable in the UI today.
- The interaction improvements R1-R10 are unimplemented.

0.2 THE ORDER (the seven phases, summarized; full detail in section 1)

	Phase 0  Orientation + the mount-failure investigation + live inspect
	Phase 1  The site commit + push (READY-TO-COMMIT package; the user commits)
	Phase 2  The panel contract (@playform/dsh-panel-family)
	Phase 3  The first adapter: hook-dsh-tool-coach (ladder + its form POC)
	Phase 4  The options forms (all volatile rows via whileServed)
	Phase 5  The remaining adapters + the ledger tails (host/Typert endpoint)
	Phase 6  The interaction improvements R1-R10
	Phase 7  The plain-field bridge + the Option B trajectory sections

0.3 THE ROUTING (the law, from Documentation/Skill/task-routing and
Documentation/Skill/worker-strains)

	Every subagent delegation: provider cloudflare-workers-ai, model
	@cf/zai-org/glm-5.3-flash, reasoningEffort low. The explicit triple is
	ALWAYS passed. Exploration = low; coding = low then high; planning =
	DeepSeek V4 Flash max; escalate only on explicit ESCALATION markers or
	verification failures.

0.4 THE ARBITERS (what proves each step done)

	- The serialized build exit 0 (the family's per-package
		Source/prepublishOnly.sh chain).
	- "All 207 smoke suites passed" + the per-folder expected-PASS-count
		comparison (Maintain/Run-Smokes.mjs; vacuously-green guard).
	- The site build: cd Site && pnpm prepublishOnly, then grep the BUILT
		Target/ HTML - never a dev server, never the source alone.
	- The Drift (the declare-then-verify discipline): the exact declared
		acceptance lines of each phase, checked one by one.
	- The live inspect: cordis_inspect_query against the CLIENT providers
		(Slots.listSubTree, Service.listService) - these REQUIRE the Web GUI
		page open (the GUI URL is http://127.0.0.1:52252 as of 2026-10-20; a
		closed page makes every client query time out - see the risk register).

0.5 THE DISCIPLINES (non-negotiable)

	- NEVER mutate git. Checks only (status/log/diff/show/rev-parse/ls-files/
		fetch). Every deliverable that needs a commit is reported
		READY-TO-COMMIT: the exact file list + the suggested message; the user
		commits and pushes.
	- All file writes go through the write/raw-write/edit tool API - never
		terminal content edits. The normalize hooks are active: prefer ASCII;
		use raw-write/edit for any real unicode glyph.
	- No dev servers anywhere. The site verifies via its built output; the
		harness GUI verifies via the live inspect + the open page.
	- The harness checkout (the .asar path) is read-only ground truth - never
		modified, never extracted. Everything the family adds lives in family
		packages.
	- The tool-coach is live and watching: the terminal runs COMMANDS (builds,
		tests, git, package managers); the tools handle CONTENT (read/grep/glob
		for file reads and searches - not head/cat/terminal grep).

0.6 THE NAMING ARBITRATION (decided here; do not re-litigate)

	R-UI-1 sketched @playform/dsh-family-panel; R-UI-3 sketched
	@playform/dsh-panel-family with the contract design. THE DECISION: the
	central package is @playform/dsh-panel-family (the contract-first design
	wins; R-UI-1's registration surface folds into it as phase 2's first
	consumer). One central package, 13 per-bundle adapters, no second panel
	package.

================================================================================
1. THE MASTER PLAN
================================================================================

--------------------------------------------------------------------------------
PHASE 0 - ORIENTATION, THE MOUNT-FAILURE INVESTIGATION, THE LIVE INSPECT
--------------------------------------------------------------------------------

THE GOAL: start every later phase from verified live state, and close the
mount-failure question before any client half is installed.

EXACT LOCATIONS
- The live profile: ~/.dsh/profiles/desktop/cordis.patch.yml
- The live profile modules: ~/.dsh/profiles/desktop/node_modules/@playform/
- The live ledgers: ~/.dsh/*.log (ccr.log, hook-dsh-tool-coach.log,
	hook-dsh-governor-package.log, hook-dsh-governor-cargo.log,
	hook-dsh-package-pinner.log, hook-dsh-normalize-*.log,
	hook-dsh-normalize-file.log, live-containers log per its config)
- The harness implementation (read-only): /Applications/DeepSeek
	Harness.app/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/
- The docs anchors: <DOCS>/docs/subsystems/slots.md;
	<DOCS>/docs/cookbook/adding-a-settings-card.md sections 3-5;
	<DOCS>/docs/cookbook/adding-a-remote-api.md;
	<DOCS>/docs/subsystems/web-client.md
	(<DOCS> = ~/Developer/Documentation/Module/deepseek-harness)
- Family skill truths: Documentation/Skill/plugin-system,
	Documentation/Skill/plugin-development, Documentation/Skill/smoke-writing
	(repo copies first; ~/.dsh/skills/ fallback).

EXACT STEPS
1. Re-read the four research documents and this plan. Recite section 0.
2. Read the live profile patch (~/.dsh/profiles/desktop/cordis.patch.yml) and
	confirm: which of the 13 bundles carry an explicit disabled flag, the exact
	row ids for every family entry (these ids ARE the plugins.row.config keys
	and the whileServed namespaces later), and whether tool-coach and
	live-containers rows default (R-UI-1 residual: they carry no explicit
	disabled flag).
3. THE MOUNT-FAILURE INVESTIGATION. R-UI-1/R-UI-3 record that a prior client
	install attempt produced live-containers "fiberPhase:failed". Investigate
	the class before writing any client half:
	a. Query the host inspect providers for the live-containers entry's
		pluginManager/fiber status (cordis_inspect_query, host platform).
	b. Read the live-containers bundle's current cordis.patch.yml row and its
		Config (Classic/packages/hook-dsh-live-containers/) for a config-shape
		mismatch (the most likely cause: a patch row whose config does not
		validate against the schema => the fiber fails at mount).
	c. Determine whether the failure was (i) a config validation failure,
		(ii) a client-half load error, or (iii) an apply() throw. Record the
		cause in this file's section 2.3 (the risk register) as RESOLVED with
		the evidence, or as an open risk with the mitigation.
	d. Verify the GUI's error surface: with the GUI open, find where
		fiberPhase:failed is displayed (the Plugins page row status / the
		shell overlay), so every later install failure is diagnosed in the GUI,
		not just in logs. This is also the "apply simulation" surface.
4. THE LIVE INSPECT BASELINE. With the Web GUI open (the page must stay open
	for the duration):
	a. cordis_inspect_query (client) Slots.listSubTree root:"plugins.detail.section"
		- capture the exact owner-prop bag of an existing entry (subject, t,
		and whatever else ships) - the R-UI-1 residual.
	b. Same for root:"plugins.row.config" and "plugins.bundle.config" (expect
		empty - that absence IS the gap).
	c. Same for root:"conversation.view" - capture the chat and trajectory
		entries' full props (label/locale/order/children) - the R-UI-3 residual.
	d. cordis_inspect_query (client) Service.listService - confirm
		ctx.reflect "pluginNavigation" is visible from a client provider.
	e. Save all five captures into this file as an appendix comment block
		(edit this file) so later phases do not re-query.
5. Confirm the plugin_manager install path end-to-end with a THROWAWAY: install
	a minimal do-nothing client package (copy the shape from
	<DSH>/node_modules/@deepseek-ai/dsh-agent-preset/skills/cordis-plugin-
	development/templates/decoration/package.json + client.js), verify the
	row appears in the GUI without a restart, then remove it. This exercises
	install_bundle + HMR + uninstall on THIS profile before real work lands.

ANCHORS: plugins.detail.section/badge/actions, plugins.row.config,
plugins.bundle.config, plugins.item, plugins.bundle.activation (the nine child
slots declared at <DSH>/node_modules/@deepseek-ai/dsh-client-ui-plugin-manager/
lib/client.js:4411-4461; the rowConfigKey at :27; the slot list at :30-34;
pluginNavigation at :4465; the refresh events at :4387-4394).

ACCEPTANCE
A0.1 The five live-inspect captures exist as an appendix in this file.
A0.2 The mount-failure cause is recorded RESOLVED-with-evidence or
	open-with-mitigation in section 2.3.
A0.3 The throwaway client package installed, rendered, and uninstalled cleanly
	(no restart, no residue in the profile patch).

--------------------------------------------------------------------------------
PHASE 1 - THE SITE COMMIT + PUSH
--------------------------------------------------------------------------------

THE GOAL: land the pending site delta (the research-era site changes, if any
remain uncommitted; verify first) so the implementation phases start from a
clean tree, and the site carries the family's new UI story when phases 2-5
land. Per the git law this phase PREPARES; the user commits.

EXACT LOCATIONS
- Site/ (the Astro tree; build outDir Site/Target)
- Site/Documentation/TRACKING.md (the batch feedback ledger)
- Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md, Documentation/Archive/Site/SITE-UPDATE-NOTE.md

EXACT STEPS
1. git status --porcelain and git log --oneline -10 (checks only). If the tree
	is clean and HEAD contains the site work, mark this phase SKIPPED-CLEAN
	with the HEAD hash and move to phase 2.
2. If deltas exist: classify each file (site content / docs / family code) and
	group into ONE READY-TO-COMMIT package per logical unit. Suggested
	messages follow the repo convention seen in git log
	(e.g. "docs: Add UI-FAMILY-IMPLEMENTATION-PLAN for the UI expansion").
3. Verify the site builds BEFORE requesting the commit: cd Site &&
	pnpm prepublishOnly, then grep the built Target/ for the changed content.
4. Report READY-TO-COMMIT to the user: exact file list + message(s) + the
	build evidence. The user commits and pushes. Do NOT run git add/commit/
	push under any circumstances.

ANCHORS: Documentation/Archive/Site/SITE-UPDATE-BLUEPRINT.md (the site's page
inventory and lane laws); session-orientation section 6 (the lane laws).

ACCEPTANCE
A1.1 The working tree is clean (or SKIPPED-CLEAN is recorded) before phase 2
	starts, with the READY-TO-COMMIT evidence in the phase report.
A1.2 Site/Target contains the built verification for any changed content.

--------------------------------------------------------------------------------
PHASE 2 - THE PANEL CONTRACT: @playform/dsh-panel-family
--------------------------------------------------------------------------------

THE GOAL: create the central package that owns the PANEL CONTRACT (the types,
the registry service, the mount points) and nothing else. No adapter logic.
This is R-UI-3 section 2.2 verbatim, made concrete.

EXACT LOCATIONS
- NEW package: Classic/packages/dsh-panel-family/
	- package.json (name @playform/dsh-panel-family)
	- cordis.patch.yml (one row named after the package, disabled:false)
	- Source/... (the family's standard layout: Source/Library.ts entry,
		Source/prepublishOnly.sh, Source/Run.sh, Source/Test/)
	- Target/ (built output, produced by the build - never hand-written)
	- index exports: "." -> types only (zero runtime), "./client" -> the
		built lazy-CJS client, "./locale/*.json", "./icon"
	- package.json "dsh": { "bundle": { "patch": "./cordis.patch.yml" },
		"client": { "platform": "web", "immediately": true,
			"inject": ["@deepseek-ai/dsh-client-locale",
				"@deepseek-ai/dsh-client-ui-layout",
				"@deepseek-ai/dsh-api-remotes"] } }
- The contract types (Source/Interface/Panel.ts):
	type PanelMount = "family-tab" | "overlay" | "sidebar"
	type PanelSection = { id; bundle; title; order; mount;
		render: (props: SectionProps) => ReactNode }
	type SectionProps = { sessionId?; useTrajectory?; open: (LaunchTarget) => void }
	type LaunchTarget = { view: string; focus?: string }
- The client half (built ./client, lazy-CJS factory:
	window.__ModuleLoader__.load({id, factory(require)})):
	- ctx.reflect.provide("playformFamilyPanel", { register, entries,
		subscribe, getVersion, open })
	- ctx.slots.inject("conversation.view", ...) -> the family tab
		(id "playform-family", order 20, scope session), rendering all
		registered sections with mount "family-tab" ordered by (order, id).
	- ctx.slots.inject("shell.overlay", ...) -> overlay panels (mount
		"overlay") opened via open().
	- All registrations inside ctx.effect (unwind with the plugin).
- The host half: Source entry exports apply() {} (empty; the row exists so
	the client module system serves the half).
- The smoke: Source/Test/ - a fake-ctx suite asserting the registry contract
	(register/entries/subscribe ordering, the cascade on unregister).

EXACT STEPS
1. Scaffold the package following the family conventions (copy the structure
	of Classic/packages/hook-dsh-tool-coach: Configuration/, cordis.patch.yml,
	package.json, Source/{Function,Interface,Variable,Test}, tsconfig.json).
2. Write the contract types first (Source/Interface/Panel.ts) - they are the
	only shared artifact in the whole design.
3. Implement the client half: the registry service + the two mount-point
	slot registrations. Hand-write the lazy-CJS client file (small); if the
	volume grows, add a clientBundle build step to Source/prepublishOnly.sh
	(modeled on <DSH>/packages/client/tsdown.client.ts - the R-UI-2 build gap).
4. The locale: Source/Variable/locale strings via ./locale/*.json; every
	visible string routes through the client locale service (A6 of R-UI-1).
5. Write the smoke suite (fake-ctx + real-factory pattern per the
	smoke-writing skill); add the folder to the runner's expected counts.
6. Build (Source/prepublishOnly.sh) and run the smokes.
7. Install into the desktop profile via plugin_manager install_bundle with
	the absolute package directory. Verify no restart is needed (pure client
	package - R-UI-1 finding) and that the mount-failure class from phase 0
	does NOT reproduce (if it does: STOP, diagnose against the phase 0
	findings, record in section 2.3 before continuing).
8. Live-verify with the GUI open: Slots.listSubTree root:"conversation.view"
	shows id=playform-family next to id=chat and id=trajectory; the empty
	family tab renders (no sections yet).
9. Publish decision: keep at 0.0.1 in-tree until phase 3 proves the contract;
	then bump and note in Documentation/Plugins/PLUGIN-FAMILY.md.

ANCHORS: R-UI-3 sections 2.1-2.2 and 3; <DOCS>/docs/subsystems/slots.md
("Declaration and lifecycle", "Component inputs", the extension rules incl.
"import type only"); conversation.view declared by
<DSH>/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js;
the registry pattern precedent: plugin-manager client.js ~4307-4321 and
pluginNavigation ~4465.

ACCEPTANCE
A2.1 The package exists with the contract types, the registry service, the
	family-tab and shell.overlay mount points, and zero adapter logic.
A2.2 The smoke suite passes and the aggregate runner prints the expected
	total (the 207 baseline + 1 new folder, both trees updated).
A2.3 The empty family tab renders in the GUI between Trajectory and chat
	(order verified via the live slot tree), removable by uninstalling the
	bundle with zero residue.
A2.4 No runtime import exists between the central package and any adapter
	(verified by grep: only `import type` from the contract).

--------------------------------------------------------------------------------
PHASE 3 - THE FIRST ADAPTER: hook-dsh-tool-coach
--------------------------------------------------------------------------------

THE GOAL: prove the entire chain with ONE bundle - the coach gets (a) a
client half registering its ladder section into the central registry, (b) the
first plugins.row.config form (its schema is 100% volatile - the easiest
whileServed proof), and (c) the marker-usage teaching rule (R5/R6 from
R-INTERACT, do them here while the bundle is open).

EXACT LOCATIONS
- Classic/packages/hook-dsh-tool-coach/
	- package.json: add "dsh.client" {platform:"web", inject:
		["@deepseek-ai/dsh-client-locale"]} and the "./client" export.
	- NEW Source/Client/ (or Library-side client module) -> built ./client
	- Source/Variable/Config.ts: add the panel block
		(panel: Schema.object({ enabled: boolean().default(true),
			density: string().default("compact") })) - own toggle gate.
	- Source/Variable/Patterns.ts + Source/Function/: the marker-usage rule
		(see step 4) - host-side, no client involvement.
	- Source/Test/: the additive smoke coverage (marker rule + panel gate).
- The form POC rides on the SAME client half:
	ctx.configForms.whileServed(["hook-dsh-tool-coach"], register) with
	ctx.slots.inject("plugins.row.config", ...) keyed
	"@playform/hook-dsh-tool-coach#<row id from the live profile patch>"
	(the row id captured in phase 0 step 2).

EXACT STEPS
1. Add the panel Config block and the client-half scaffold; keep
	inject = [] toward the central package (contract via import type only;
	the adapter no-ops when ctx.reflect.get("playformFamilyPanel") is absent).
2. Implement the ladder section (mount "family-tab", order 30): the coach's
	strike/escalation state rendered from the section's own read of the
	coach's ledger tail via the phase 5 endpoint OR, for this phase, from the
	coach's runtime state exposed through the section props - pick the
	simplest data path that does not require the Typert endpoint yet (the
	ladder can be static-structure + counts in phase 3; live tails arrive in
	phase 5).
3. The form POC (this is the R-UI-2 POC verbatim):
	a. Register the plugins.row.config slot via whileServed.
	b. Render the form from ctx.configForms.describe() for the namespace:
		rehydrate Schema from the descriptor's serialized schema, show
		current value + base + user provenance + revision.
	c. Save via form.mutate(operations, expectedRevision) (revision-fenced).
4. THE MARKER RULE (R5+R6, host-side, while the bundle is open):
	a. Add a detection row: any tool result containing "<<<CCR:" teaches
		"extract the 24-hex hash and call ccr_retrieve {hash, range?}".
	b. Re-scope the "grep ccr.db / sqlite3 ledger" teaching text: point to
		the harness grep tool on the plain-text ~/.dsh/*.log ledgers for
		search intent; ccr_retrieve ONLY when a marker/hash is in hand.
	c. Additive smoke coverage: byte-identical existing ledger strings
		untouched; new rule gets its own assertions.
5. Build; smokes green; install the bundle via install_bundle; restart the
	harness ONCE (the R-UI-2 finding: the client half is discovered on
	composition - one restart, then HMR keeps it live).
6. VERIFY (the R-UI-2 POC verification, all four):
	a. Plugins -> the coach bundle -> row shows Configure; the form renders.
	b. Edit a volatile knob (threshold); save; the profile patch
		(~/.dsh/profiles/desktop/cordis.patch.yml) gains the id-keyed
		override with comments and !!js preserved; the coach's next operation
		uses the new value with unchanged instance identity
		(hook-dsh-tool-coach.log + loader/volatile-update prove it).
	c. An invalid value is refused; file AND live value unchanged.
	d. Restart: the saved value persists and reloads.
7. Cascade verify (R-UI-3 POC steps): disable the central bundle -> the tab
	disappears and the adapter is dormant; re-enable -> back; flip the
	coach's panel.enabled -> only the coach section goes, others unaffected.
8. Ready-to-publish note for the family: the client-half pattern this
	adapter proves is the template for phases 4-5.

ANCHORS: R-UI-3 section 4 (the POC); R-UI-2 section 4 (the POC);
<DOCS>/docs/cookbook/adding-a-settings-card.md sections 3-5;
<DOCS>/docs/subsystems/settings.md ("Plugin Configuration Forms");
the chain anchors: <DSH>/node_modules/@deepseek-ai/dsh-settings/lib/index.js
(describe -> volatileForm), dsh-config-editor/lib/index.js (edit ->
cordis.patch.yml), cordis-plugin-loader/lib/index.js (Entry.update ->
_commitVolatile -> loader/volatile-update);
dsh-api-settings-controller (settings.describe/update/replace/mutate @Remote);
dsh-client-ui-settings/lib/client.js (ctx.configForms, whileServed);
R-INTERACT section 5.2 (R5, R6).

ACCEPTANCE
A3.1 The coach's ladder section renders in the family tab; the cascade gates
	(central off / adapter off / panel.enabled off) each behave per R-UI-3
	A2-A4.
A3.2 The coach's volatile knobs are editable in the GUI with the full
	R-UI-2 acceptance chain (patch override, no remount, revision-fenced,
	restart-persistent).
A3.3 The marker-usage rule fires on a "<<<CCR:" result (observable in
	hook-dsh-tool-coach.log) and the re-scoped ledger-search text is live.
A3.4 The coach's existing smokes stay byte-identical; the new coverage is
	additive; the runner total matches.

--------------------------------------------------------------------------------
PHASE 4 - THE OPTIONS FORMS: ALL VOLATILE ROWS
--------------------------------------------------------------------------------

THE GOAL: every family bundle's volatile knobs become GUI-editable. Phase 3
proved the pattern on one bundle; this phase replicates it across the rest
and adds the aggregate panel.

EXACT LOCATIONS
- The client-half pattern is per-bundle, but the FORM machinery is shared:
	decide (and record here) whether each bundle ships its own ./client or the
	central package registers forms for all rows. THE DECISION: per-bundle
	client halves (the R-UI-3 architecture: visuals/config live in the owner;
	the central package stays contract-only) - the forms use a small shared
	renderer copied per bundle via the family's build (no runtime cross-import).
- The bundles and their volatile coverage (from R-UI-2 section 2):
	hook-dsh-package-governor, hook-dsh-package-pinner,
	hook-dsh-cargo-governor  - shared block knobs (log, logFile,
		updateCooldownMs, mutationTools)
	hook-dsh-normalize-{dash,quotes,ellipsis,spaces,invisible,fullwidth}
		- 4-5 knobs each (log, logFile, replacement, normalizeReasoning,
		normalizeToolArguments where present)
	hook-dsh-normalize-file   - scopes + toolResultsExempt + replacement
	hook-dsh-ccr              - log, logFile, thresholdBytes, multipliers
		(whole object), previewMaxChars
	hook-dsh-tool-coach       - done in phase 3
	hook-dsh-live-containers  - ALL 28 knobs volatile
- The namespace list for whileServed = the family's profile patch ids from
	phase 0 step 2.

EXACT STEPS
1. Per bundle (one at a time, smallest first: normalize flavors -> the
	governors -> ccr -> live-containers):
	a. Add dsh.client + ./client to package.json.
	b. Register the plugins.row.config slot via whileServed for that bundle's
		row id; render the form from the descriptor (same renderer as phase 3).
	c. Additive smoke for the panel gate.
	d. Build; smokes; install; live-verify one knob per bundle end-to-end
		(patch override + no remount + refusal + persistence).
2. THE STATUS STRIP: each form shows form.state (writable/revision), the
	user-vs-base delta, and the applies:"live" marker; subscribe
	settings/document-updated to refresh (R-UI-2 section 3.1 - this is the
	"per-plugin ledger/status display" without any new backend).
3. THE AGGREGATE: one plugins.item entry (id "family-panel") in the central
	package listing all family namespaces under one view (read-only summary +
	deep links via pluginNavigation; editing stays per-row).
4. THE BADGE: plugins.detail.badge (id "playform-family-badge") - the
	"family" tag on each of the 13 bundle pages (R-UI-1).
5. THE SECTION: plugins.detail.section (id "playform-family") - the roster
	card on every @playform bundle page: the 13 bundles grouped (factory /
	governors / normalize flavors / ccr / tool-coach), live enabled states
	from remote.pluginManager + ctx.remote.$on("plugin-manager/changed"),
	deep links via pluginNavigation.openBundle (R-UI-1 section 3 - the
	central package hosts this; it is contract-adjacent UI, not adapter
	logic).
6. Update Documentation/Plugins/PLUGIN-FAMILY.md with the new UI surface;
	bump the affected packages; READY-TO-COMMIT report.

ANCHORS: R-UI-2 sections 2-3 (the gap map + the design); the nine slots
(plugin-manager client.js:4411-4461); the coach's schema qualification as the
model case (R-UI-1 "Data surfaces confirmed live" - every knob x-cordis
volatile); configEditor's Known limitations (active patch only).

ACCEPTANCE
A4.1 Every volatile knob of every family bundle (the R-UI-2 table's volatile
	column, cell by cell) is editable in the GUI and passes the four-point
	verification from phase 3 step 6.
A4.2 The roster section + badge render on all 13 @playform bundle pages;
	non-@playform subjects render nothing.
A4.3 Enable/disable of any family bundle reflects in the roster without a
	reload (plugin-manager/changed).
A4.4 whileServed semantics: switching a row off removes its page; on
	restores it; no orphaned registrations.
A4.5 The aggregate family-panel item lists all namespaces with correct
	provenance and deep links.

--------------------------------------------------------------------------------
PHASE 5 - THE REMAINING ADAPTERS + THE LEDGER TAILS (the host/Typert endpoint)
--------------------------------------------------------------------------------

THE GOAL: the remaining 12 bundles register their visual sections into the
central registry, and the panel gains LIVE data - the ledger tails and
fiberPhases - through a family-host Typert remote endpoint.

EXACT LOCATIONS
- The adapters (each bundle's client half gains a section registration):
	hook-dsh-cargo-governor / hook-dsh-package-governor /
	hook-dsh-package-pinner -> governor tails + activation lines
	hook-dsh-ccr            -> store stats (ccr.log tail; the LRU count via
		the new endpoint)
	hook-dsh-live-containers -> live block board
	hook-dsh-normalize-* (6) -> per-flavor counters
	hook-dsh-normalize-file  -> normalization counts
	hook-dsh-core / plugin-dsh-factory -> family roster / build info
- The endpoint: a family-host service in the central package (or a small
	companion @playform/dsh-panel-family-host) exposing @Remote methods:
	tail(namespace, lines) -> the last N lines of the owning module's
	~/.dsh log; stats() -> the ccr store stats + the fiberPhases from
	remote.pluginManager (already remote - prefer it; no new endpoint for
	fiberPhases).
- The remote contract per <DOCS>/docs/cookbook/adding-a-remote-api.md:
	TypertRemoteService + @Remote decorators + RemoteError codes + generated
	descriptors - an external package must reproduce the generation pipeline
	(the documented caveat; budget real build time for it).

EXACT STEPS
1. Build the Typert endpoint FIRST as a standalone spike (one method:
	tail("hook-dsh-tool-coach", 20)) following adding-a-remote-api.md's five
	steps; prove the descriptor generation from an external package. If the
	generation cannot be reproduced outside the harness repo, record ESCALATE
	or fall back to the v1 shortcut (expose only existing remote namespaces;
	ledgers deferred - the pre-decided fallback from R-UI-1 section 3).
2. On success, extend to the full endpoint: tail(namespace, lines) for each
	family log + storeStats() (ccr) + nothing else (least privilege; the
	endpoint reads ~/.dsh logs ONLY).
3. Wire the endpoint into the central client: ctx.remote.<namespace> +
	ctx.remote.$on for updates; sections consume props.open + the tail data.
4. Implement the 12 adapters' sections (each in its OWN bundle's client
	half; visuals live in the owner; the central package renders whatever is
	registered).
5. Each adapter: additive smoke (panel gate + section data shape), build,
	smokes, install, live-verify (section renders; data refreshes while the
	page stays open; the bundle's disable removes only its section).
6. The live-containers guard: its client half must NOT be enabled by default
	(the bundle's Config.enabled is false by design - idle-forever until
	explicit ACTIVATE). Its adapter section registers but renders an
	"activate to see live blocks" placeholder when the host module is idle.

ANCHORS: R-UI-3 section 2.3 (the per-bundle contributions map);
adding-a-remote-api.md (the five steps); R-UI-1 section 3 (the data sources);
remote.pluginManager / pluginInventory / pluginRegistryProbe (the injected
namespaces, plugin-manager client.js:4360-4366).

ACCEPTANCE
A5.1 All 13 family sections render in the family tab (12 new + the coach),
	each gated by its own bundle's enabled state and panel.enabled.
A5.2 At least one ledger tail (hook-dsh-tool-coach.log's last N lines)
	refreshes in the GUI while the page stays open (R-UI-1 A4).
A5.3 The Typert endpoint reads only ~/.dsh family logs; no write surface.
A5.4 The fallback decision (if step 1 failed) is recorded with evidence and
	the sections degrade to static/registry-only data without errors.

--------------------------------------------------------------------------------
PHASE 6 - THE INTERACTION IMPROVEMENTS R1-R10
--------------------------------------------------------------------------------

THE GOAL: implement the R-INTERACT recommendations, in the section 5 order,
each with additive smoke coverage and zero changes to existing ledger strings.

EXACT LOCATIONS (per recommendation)
- R1  Classic/packages/hook-dsh-ccr/Source/ - a read-only ccr_list tool (or
	a list:true mode on ccr_retrieve): Store stats {count, bytes} + a
	filtered hash/type/age listing. Store already tracks hash/type/size/
	createdAt. Register via Context.tools.register like ccr_retrieve.
- R2  Classic/packages/hook-dsh-ccr/README.md (the retrieval section) - the
	journalPath trade-off documentation; consider a default recommendation.
- R3  Classic/packages/hook-dsh-tool-coach/Source/Variable/Patterns.ts - the
	ledger-search teaching line ("ledgers are plain text - use the grep tool
	on the ~/.dsh log paths"). NOTE: partially done in phase 3 step 4b;
	this is the completion check.
- R4  Classic/packages/hook-dsh-ccr/Source/Variable/Config.ts - evaluate a
	touch/TTL-extend parameter on ccr_retrieve OR the ttlSeconds guidance;
	if the parameter, additive smoke + README.
- R5  (phase 3, step 4a) - completion check here.
- R6  (phase 3, step 4b) - completion check here.
- R7  Classic/packages/hook-dsh-tool-coach/ - terminal coverage: add a
	terminal_send-judging hook (the command text is an available tool
	argument) OR the persistent-section teaching line ("same rules apply in
	terminal_send"). Prefer BOTH: the hook for parity, the line for clarity.
- R8  Classic/packages/plugin-dsh-factory/Source/ (the fs/observed gate
	path) - emit a ledger line when the gate skips an event via the
	`govern` reason with selection=false (deliberate non-governance becomes
	visible).
- R9  Classic/packages/plugin-dsh-factory/ - land the parallel-govern marker
	(sequential by default; parallel only on proven disjointness) OR delete
	the promise from the skill docs. Decide by auditing the registered steps
	for disjointness; if unclear, delete the promise (the cheaper correct
	move).
- R10 Classic/packages/hook-dsh-ccr/Source/Variable/Config.ts - replace the
	hard-coded /Users/nikola/... logFile schema default with "~/.dsh/ccr.log"
	(or the platform-correct equivalent).

EXACT STEPS
1. Work R1-R10 in the order above; each is its own commit-sized unit
	(READY-TO-COMMIT per unit).
2. Every recommendation gets ADDITIVE smoke coverage only: the existing
	byte-identical ledger assertions must not move (the smoke-writing law).
3. R7 and R8 touch hot paths (the coach's waterfall, the factory's gate) -
	run the full 207-suite runner after each, not just the folder.
4. Update the two package READMEs (ccr, tool-coach) for the user-facing
	deltas (R1, R2, R4, R7).
5. READY-TO-COMMIT report per unit.

ANCHORS: R-INTERACT sections 3.5 (the shortcomings), 5.1-5.3 (the
recommendations); hook-dsh-ccr Source (Store Put/Get/Stats; Context.tools
register); plugin-dsh-factory Source (the Wire/gate order; RegisterGovern).

ACCEPTANCE
A6.1 R1, R7, R8, R10 implemented with additive smokes; the runner prints the
	new expected total.
A6.2 R2, R3, R6 documented (README/teaching text) and verified live in the
	coach's note output.
A6.3 R4, R9 have explicit recorded decisions (implemented or rejected with
	reasons).
A6.4 Zero existing ledger strings changed (grep-diff the asserted strings).

--------------------------------------------------------------------------------
PHASE 7 - THE PLAIN-FIELD BRIDGE + THE OPTION B TRAJECTORY SECTIONS
--------------------------------------------------------------------------------

THE GOAL: close the two structural gaps the researches left open - the
governors'/ccr's plain (non-volatile) knobs, and the trajectory screen's
closed seam.

EXACT LOCATIONS
- THE PLAIN-FIELD BRIDGE (R-UI-2 section 3.2 step 5):
	a new family-host service in the central package's host half (or the
	companion host package from phase 5) exposing @Remote editFull(ns, patch)
	that calls ctx.configEditor.edit() directly. Its writes go through the
	same patch + Loader path, but plain-field differences trigger the normal
	update lifecycle (remount) - surfaced in the UI as "applies on remount".
	Coverage: the R-UI-2 table's plain column (strict, policyFile, exclude,
	sections, ncuBin/cargoBin, updateMode, ccr's structural knobs).
- THE OPTION B SECTIONS (R-UI-3 section 1.4): the harness-side change -
	<DOCS>-upstream request to add "conversation.trajectory.sections"
	{kind:"list", scope:"session"} to dsh-client-ui-trajectory's children
	map, rendered in TrajectoryView under the toolbar or as details-pane
	tabs. ONLY the declaring owner may declare a child - this is upstream
	harness work, NOT family work.

EXACT STEPS
1. The bridge service: minimal surface (one method), schema-validated patch
	input, the same revision/higher-layer checks configEditor enforces.
	Record in the README that this is the one place a family package is
	trusted with full-config writes.
2. UI: the phase 4 forms gain a "plain" section per bundle fed by the
	bridge; each plain field carries the "applies on remount" marker; the
	row status shows the remount observably.
3. Verify: edit a plain knob (e.g. package-governor strict) -> the patch
	override lands -> the bundle remounts -> the new value is live -> the
	UI reflects the remount event.
4. OPTION B: write the upstream request as a documented proposal
	(this file's appendix + a note in Documentation/Plans/) with the exact
	declaration, the render sites (TrajectoryTable equivalents), and the
	R-UI-3 section 1.4 reasoning. Do NOT shadow trajectory via priority
	re-registration (explicitly rejected in the research). If the harness
	release adds the slot, the central package adds the in-trajectory mount
	as a phase 8 follow-up.
5. Re-run the full arbiters; final READY-TO-COMMIT + plan-status update
	(mark the phases completed in section 3 below).

ANCHORS: R-UI-2 section 3.2 step 5 and section 5 item 5; R-UI-3 section 1.4
options A/B; configEditor README (Known limitations);
dsh-base/cordis.patch.yml composes config-editor + settings (the bridge's
composition prerequisite).

ACCEPTANCE
A7.1 Every plain knob in the R-UI-2 table is editable via the bridge with
	the remount marker and observable remount.
A7.2 The bridge's write surface is documented as trusted-with-full-config;
	the least-privilege input validation is smoke-covered.
A7.3 The Option B proposal exists as a precise upstream request (exact
	declaration text + render sites), and no priority shadowing of
	id=trajectory exists anywhere in family code.

================================================================================
2. THE RISKS + THE MITIGATIONS
================================================================================

2.1 THE CLIENT-INSPECT TIMEOUT RESIDUAL
	Risk: every client-platform inspect query (Slots.listSubTree,
	Service.listService) times out when the GUI page is not open/connected.
	Mitigation: phase 0 step 4 makes "GUI open" a precondition; every phase's
	live-verify step states it; if a query times out, fall back to the
	asar source + docs anchors (the method all four researches used) and
	retry with the page open. Never treat a timeout as proof of absence.

2.2 THE TYPORT DESCRIPTOR GENERATION
	Risk: the remote descriptor generation pipeline lives in the harness
	repo; an external package must reproduce the build (adding-a-remote-api
	caveat). Mitigation: phase 5 step 1 is a standalone spike BEFORE any
	adapter work depends on it, with the pre-decided fallback (registry-only
	data, ledgers deferred). Budget: if the spike exceeds a session, take
	the fallback and record it.

2.3 THE MOUNT-FAILURE CLASS
	Risk: a prior client install produced live-containers fiberPhase:failed -
	a live example of a client half failing at mount. Phase 0 step 3
	investigates the cause (config-shape mismatch, client load error, or
	apply throw are the candidates). Mitigation: the throwaway install in
	phase 0 step 5 exercises the path before real work; every install step
	phases 2-5 verifies the GUI row status immediately; a reproduced failure
	STOPS the phase (recorded here). [TO BE RESOLVED IN PHASE 0 - the cause
	and the GUI error surface go here.]

2.4 THE MERMAID 12 RENDERER PINNED
	Risk: any diagrams in docs/site content must render through the pinned
	Mermaid 12 renderer. Mitigation: keep plan/diagram authoring ASCII-first
	(this file is ASCII + tabs); when a Mermaid diagram is required (site
	pages), validate via the Line9 CLI per the flowchart-line9 skill before
	the site build.

2.5 THE PLUGIN-TARGET FRESHNESS
	Risk: the family's Target/ trees are build output; stale Target content
	gets installed. Mitigation: every install step runs Source/prepublishOnly.sh
	immediately before install_bundle; never hand-edit Target/; the smokes
	run against the just-built tree.

2.6 THE RESTART-ONCE WINDOW (phase 3)
	Risk: the client-half discovery happens on composition - the first
	client-half install needs exactly one harness restart; a mid-restart
	state can look like the mount-failure class. Mitigation: do the restart
	at a known-good point (after the smokes are green), and verify the row
	status in the GUI immediately after.

2.7 THE SINGLE-CLIENT-FILE LIMIT
	Risk: the lazy-CJS ./client files are hand-written single files; the
	coach's ladder + forms may outgrow hand-rolling. Mitigation: the
	pre-decided escalation path - add a clientBundle build step to the
	factory (the R-UI-2 build gap) once any client file exceeds
	hand-maintainable size, modeled on <DSH>/packages/client/tsdown.client.ts.

2.8 THE PROFILE-PATCH SINGLE POINT
	Risk: all form writes target the active profile patch; a corrupted
	cordis.patch.yml breaks the whole profile. Mitigation: the form writes
	are revision-fenced and comment/!!js-preserving by construction
	(configEditor); keep a pre-phase-3 copy of the patch for manual recovery
	(documented in the phase 3 step 6 verification).

================================================================================
3. THE PLAN STATUS LEDGER (updated as phases complete)
================================================================================

	Phase 0  pending   (the mount-failure cause + the five inspect captures)
	Phase 1  pending   (site commit package - possibly SKIPPED-CLEAN)
	Phase 2  pending   (the central package + the contract)
	Phase 3  pending   (the coach: ladder + form + marker rule)
	Phase 4  pending   (all volatile forms + roster/badge/section)
	Phase 5  pending   (12 adapters + the Typert endpoint or the fallback)
	Phase 6  pending   (R1-R10)
	Phase 7  pending   (the plain-field bridge + the Option B proposal)

================================================================================
4. THE "MORE" - THE EXTENSIONS THE RESEARCHES SUGGEST (beyond the phases)
================================================================================

Ordered by value; each is a candidate follow-up phase, not in the core seven.

E1  THE FAMILY PANEL'S DATA SOURCES, DEEPER
	- The live ledgers' tails via the host + Typert endpoint: phase 5 does
		tails; the extension is FOLLOW mode (streaming updates on append) and
		cross-ledger search view (grep-style filter over the combined tails).
	- The fiberPhases via the pluginManager remote: surface each family
		bundle's fiber status in the roster section (mount/failed/running) -
		turns the mount-failure class from section 2.3 into a VISIBLE signal
		permanently.
	- The knob forms via the config schemas: the generic renderer is already
		built in phase 4; the extension is autoGenerate consumption - if the
		harness later ships a generic auto-form consumer, the per-row
		registrations can collapse to one (a harness-side gap, filed not
		monkey-patched; R-UI-2 residual 1).

E2  THE COACH'S MARKER-USAGE RULE (E=the phase 3 step 4 scope, expanded)
	- Beyond R5/R6: a persistent-section line that teaches the FULL ccr happy
		path (marker -> hash -> ccr_retrieve {hash, range?}), and the
		terminal_send parity (R7) as one grammar block, composed via config
		(the live-containers precedent: the coach README's profile patch
		pattern, R-INTERACT section 2.5).

E3  THE CCR_SEARCH TOOL (R1 expanded)
	- The R1 ccr_list is read-only stats + listing; the expansion is a real
		ccr_search over the STORE's payloads (substring/type filter), keeping
		the ledgers out of it (the ledgers stay grep-tool territory per R3).
		Guard: zero changes to existing ccr smoke assertions; the store's
		LRU semantics untouched (a search must not refresh lastAccessed).

E4  THE INTERACTION DOCUMENTATION
	- R-INTERACT section 2.5's friction (the coach/live-containers coupling
		is invisible in code): a short Documentation/Guides/FAMILY-COMPOSING.md
		describing the load-order conventions (ccr before the normalize hooks,
		the marker guard) and the config-level couplings.

E5  THE DETACHED PANELS
	- R-UI-3's shell.overlay / sidebar.panellist mounts (the contract's
		"overlay"/"sidebar" PanelMounts) - phase 2 builds the mount points;
		the extension is the sidebar panel showing the roster + the coach's
		strikes without opening the Plugins page.

E6  THE ETS PARITY
	- The EffectTS twins get the client halves only after the Classic side is
		proven (the client halves are platform code, identical for both trees;
		only the host halves differ). A phase 8+ candidate; do not mix the
		trees (the 25-package law).

================================================================================
APPENDIX A - THE LIVE INSPECT CAPTURES (phase 0 step 4 fills this)
================================================================================

[Pending phase 0. To be filled with: the plugins.detail.section owner-prop
bag; the plugins.row.config / plugins.bundle.config absence proof; the
conversation.view chat + trajectory entry props; the pluginNavigation
service surface; the profile patch row ids + disabled flags for all 13
bundles.]

================================================================================
APPENDIX B - THE ONE-PARAGRAPH SUMMARY (what a fresh session must recite)
================================================================================

Read the four research docs + this plan; route every subagent to
cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low; never mutate git
(READY-TO-COMMIT reports only); write files only through the tool API; the
arbiters are the serialized build, the 207-suite runner with the
expected-PASS guard, the site build verified on Target/, and the live client
inspect with the GUI page OPEN; phase 0 resolves the mount-failure class and
captures the live slot trees BEFORE any client half is written; the central
package is @playform/dsh-panel-family (contract-only) and the 13 adapters
import its types only; the tool-coach is the first adapter and carries the
marker-usage rule; the Typert endpoint is spiked standalone with the
registry-only fallback pre-decided; and the trajectory screen stays untouched
until upstream ships conversation.trajectory.sections.
