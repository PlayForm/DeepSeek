---
title: Harness UI Trajectory Research (R-UI-3)
category: Researches
kind: research-output
date: 2026-10-20
status: complete
registry: Documentation/Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: the trajectory verdict (no additive slots; the images slot only)
    state: resolved
    evidence: the asar sources and slots.md agree
  - name: the adapter architecture (the central panel + the 13 adapters)
    state: resolved
    evidence: section 3 - the architecture formalized
  - name: Option A (the sibling family tab via conversation.view)
    state: resolved
    evidence: designed, no harness changes needed
  - name: Option B (the upstream trajectory.sections declaration)
    state: open
    evidence: requires the upstream owner-only change
  - name: the POC (the tool-coach ladder)
    state: open
    evidence: planned in Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md
---

HARNESS-UI-TRAJECTORY-RESEARCH
==============================

Agent: R-UI-3
Date: 2026-10-20
Question: can the harness TRAJECTORY screen (dsh-client-ui-trajectory) be modified/extended through the plugin system?
How should the family's per-plugin panel adapters + central panel plugin be architected?

Sources read in place (never extracted):
- /Applications/DeepSeek Harness.app/Contents/Resources/app.asar
	-> dsh/node_modules/@deepseek-ai/dsh-client-ui-trajectory/{package.json,lib/client.js}
	-> dsh/node_modules/@deepseek-ai/dsh-client-ui-plugin-manager/lib/client.js
	-> dsh/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js
- ~/Developer/Documentation/Module/deepseek-harness/docs/subsystems/slots.md
- Sibling research: Documentation/Researches/HARNESS-UI-PLUGIN-RESEARCH.md
- Family packages: Classic/packages/* (15 dirs, 13 bundles + core + factory)


1. THE TRAJECTORY VERDICT
-------------------------

1.1 What the trajectory package is

	dsh-client-ui-trajectory 0.2.1-rc.2, its own package.json description:
	"Trajectory event ledger with an interactive timing overview:
	 pure-consumer plugin registering into the conversation ViewMap (no service)".

	It is NOT a screen owner. It is itself a guest plugin. In apply() it does:
	- ctx.locale.register("trajectory", {zh, en})
	- ctx.uiConversation.events.register(...) x10 (message/tool/compaction
		definitions - how it reconstructs the ledger from session events)
	- ctx.uiConversation.views.register(trajectoryViewDefinition)
	- ctx.uiSession.provide({hooks:["trajectory"], resolve: ...})
		-> publishes the `trajectory` snapshot source as a SESSION-STANDARD
		HOOK (slots.md:96: any `session`-scoped slot occupant gets
		`useTrajectory` for free)
	- ctx.slots.inject("conversation.view", () => ctx.slots.register({
			name: "conversation.view",
			id: "trajectory", order: 10, locale: NS,
			label: () => t("view.trajectory"),
			children: { "conversation.trajectory.images":
				{ kind: "single", scope: "session" } }, ...}, TrajectoryView))

1.2 The exact seams it declares

	EXACTLY ONE child slot is declared inside the trajectory screen:

	conversation.trajectory.images   single, scope: session

	Used at exactly two render sites (TrajectoryTable client.js:4243 and :4438).
	The sites are the attachment row and the tool-output image blocks.
	Owner props are {images:[{attachment,label}], align, thumbnail, loadImage}.
	It is an IMAGE-RENDERING anchor ONLY.
	A foreign plugin can replace how images render inside trajectory records, nothing more.

	There are NO other foreign slots: no toolbar slots, no details-tab slots, no section/tail/summary slots.
	The trajectory toolbar, the details pane tabs (summary/raw/preview/timing/...), the timeline, and the table are ALL hard-wired React inside TrajectoryView/TrajectoryTable.

1.3 The contrast (the plugin-manager model)

	dsh-client-ui-plugin-manager declares NINE child slots on its "main"
	registration (client.js ~4424-4461, matching the sibling research):

	plugins.add.actions        list,  root
	plugins.tab                list,  root
	plugins.item               list,  root
	plugins.bundle.activation  keyed, root
	plugins.bundle.config      keyed, root
	plugins.row.config         keyed, root
	plugins.detail.actions     list,  root
	plugins.detail.badge       list,  root
	plugins.detail.section     list,  root

	That page was BUILT to be extended.
	The trajectory screen was NOT.

1.4 VERDICT

	The trajectory screen is CLOSED for additive sections/panels through the plugin system as shipped.
	NO plugins.detail.section-style anchor exists inside it.
	What IS available:

	(a) conversation.trajectory.images - the ONLY in-screen anchor.
			Images ONLY; NOT usable for ledgers/knobs/ladders/stats.
	(b) conversation.view - the SCREEN-LEVEL seam.
			It is a list slot (scope: session) declared by dsh-client-ui-conversation on conversation.session.
			Trajectory occupies id=trajectory (order 10), chat occupies id=chat.
			ANY plugin may ctx.slots.inject("conversation.view", ...) and register a SIBLING TAB next to "Trajectory".
			It is a full view inside the session screen, fed by the same data.
	(c) Data seams, ALWAYS on while ui-trajectory is enabled:
			- useTrajectory (session standard hook from ctx.uiSession.provide) - the ledger snapshot source.
			- ctx.sessions paging (session.loadOlder).
			- The raw event stream (session events / transcript) for adapters that keep their own projections (ledgers, tool-coach ladder, ccr stats).
	(d) Priority shadowing: re-registering id=trajectory into conversation.view with higher priority REPLACES the whole screen.
			It is legal per the slot algebra, but there is NO composition.
			The original TrajectoryView unmounts and family code may NOT import its runtime values (slots.md extension rule: import type ONLY).
			NOT recommended.
	(e) Outside the session screen: shell.overlay, sidebar.panellist,
			settings.*.item - detachable family panels.

	The clean conclusion for the user's dictate (d) "the central panel mounts the adapters' sections": the mount surface CANNOT be inside the trajectory screen today.
	Two honest options:
	- Option A (NO harness changes): the central panel mounts adapter sections into a family TAB under conversation.view (sibling of Trajectory).
		Plus optional detached panels (shell.overlay / sidebar).
	- Option B (ONE upstream declaration): the harness would need a new child on the trajectory registration, e.g. "conversation.trajectory.sections" {kind:"list", scope:"session"}.
		It is declared in dsh-client-ui-trajectory's children map and rendered in TrajectoryView (e.g. under the toolbar or as details-pane tabs).
		ONLY the declaring owner may declare a child (slots.md:17,196), so this is a harness-side change, NOT a plugin-side ONE.
		Until then, EVERY family visual lives outside the trajectory screen.


2. THE ADAPTER ARCHITECTURE DESIGN
----------------------------------

2.1 Topology (formalizing the user's dictates)

	Central panel plugin:  @playform/client-dsh-panel-family
	- New package; client half (./client, window.__ModuleLoader__.lazy-CJS, same shape as dsh-client-ui-trajectory) + optional tiny Host half (config ONLY).
	- Owns: the PANEL CONTRACT (types + registry service + mount points).
	Per-plugin adapters: EACH hook-dsh-* bundle gains a client half.
	- Owns: its visuals, its knobs, its config.
	- Imports ONLY the contract TYPES from the central package (import type; slots.md:195).
	- The central plugin extends nothing of the adapters.
	- The adapters extend the central plugin's types. Direction is one-way.

2.2 The central plugin's exported contract

	package.json exports:
	"."        -> ./index.js       (types only, zero runtime)
	"./client" -> ./lib/client.js  (registry + mount components)

	Type surface (one source of truth):

		type PanelMount = "family-tab" | "overlay" | "sidebar"
		type PanelSection = {
			id: string            // "tool-coach.ladder"
			bundle: string        // "@playform/hook-dsh-tool-coach"
			title: string
			order: number
			mount: PanelMount
			render: (props: SectionProps) => ReactNode
		}
		type SectionProps = {
			sessionId?: string
			useTrajectory?: ...   // present when mount is session-scoped
			open: (target: LaunchTarget) => void
		}
		type LaunchTarget = { view: string; focus?: string }

	Registry service (client ctx): the central plugin publishes

		ctx.reflect.provide("playformFamilyPanel", {
			register(section: PanelSection): () => void
			entries(): readonly PanelSection[]
			subscribe(listener): () => void
			getVersion(): number
			open(target: LaunchTarget): void   // launch protocol:
				// layout.selectPanel / activateView, same pattern
				// plugin-manager uses for openBundle (reflect
				// "pluginNavigation", pm client.js ~4456)
		})

	Mount points the central plugin itself registers:
	- ctx.slots.inject("conversation.view", ...) -> family tab
		(id "playform-family", order 20, scope session) rendering ALL
		registered sections with mount "family-tab", ordered by `order`.
	- ctx.slots.inject("shell.overlay", ...) -> overlay panels
		(mount "overlay") when opened via open().

	NO adapter is ever imported by the central plugin.
	Discovery is purely through the registry.

2.3 The per-plugin adapter shape (what each family bundle ships)

	Each hook-dsh-* bundle adds to its package.json:

		"dsh": { "bundle": { "patch": "./cordis.patch.yml" },
			"client": { "inject": [...], "platform": "web" } }
		+ "./client" export -> ./lib/client.js

	The client half (ModuleLoader lazy CJS, exports {inject, apply}):

		inject = []            // NO hard dep on the central plugin
		apply(ctx, config):
			const panel = ctx.reflect.get?.("playformFamilyPanel")
			if (!panel) return            // central disabled -> no-op
			if (!config.panel.enabled) return   // own toggle gate
			ctx.effect(() => panel.register({
				id: "tool-coach.ladder",
				bundle: "@playform/hook-dsh-tool-coach",
				title: "Coach ladder",
				order: 30,
				mount: "family-tab",
				render: LadderSection,     // visuals live HERE
			}))

	Per-bundle contributions map (from the 13 bundles):
	- hook-dsh-tool-coach    -> coach ladder section (visit ladder/knobs)
	- hook-dsh-cargo-governor / package-governor / package-pinner
	                         -> governor tails + activation lines
	- hook-dsh-ccr           -> store stats (CCR ledger tail)
	- hook-dsh-live-containers -> live block board
	- hook-dsh-normalize-* (6 flavors) -> per-flavor counters
	- lib-dsh-core / plugin-dsh-factory -> family roster / build info

2.4 Enable/disable cascade (the toggles)

	Three independent gates, evaluated so the cascade is total:
	1. Central bundle enabled?
		 If not, the "playformFamilyPanel" reflect service does NOT exist -> EVERY adapter's apply() no-ops.
		 Nothing renders; adapters stay dormant but installed (dictate (c)).
	2. Adapter bundle enabled?
		 Cordis already handles this.
		 A disabled bundle's client half NEVER applies (slots/service lifetimes).
	3. Per-adapter toggle?
		 EACH adapter's OWN Config schema carries its panel keys, e.g. (inside hook-dsh-tool-coach ONLY):
			panel: Schema.object({
				enabled:  Schema.boolean().default(true),
				density:  Schema.string().default("compact"),
			})
		 Hot-replace on edit (config.md:98) re-runs apply.
		 The descriptor is withdrawn/re-registered.
		 The central tab re-renders via its subscribe.
	Central master switch: the central plugin's own Config (e.g. family-tab.enabled) unmounts the whole conversation.view registration.
	ctx.slots.inject lifetimes then collapse EVERY declared child (slots.md:21) - the chain unwinds cleanly.

2.5 Config segregation (dictate (e))

	- ZERO shared config.
	- The ONLY cross-package artifact is the central package's TypeScript types (import type, NO runtime dep).
	- EVERY knob lives in the owning bundle's Config schema (Schemastery, "every tunable is a config field").
	- Commonalities reduced to the contract: PanelSection, SectionProps, PanelMount, the registry method names, and the mount-point slot keys the CENTRAL plugin owns.
	- Nothing else is shared.


3. THE CHAIN-OF-EVENTS FLOW
---------------------------

	1. Boot: profile cordis.patch loads the 13 bundles + the central panel bundle.
		 Host halves apply (ledgers etc. unchanged).
	2. Web client boots; ModuleLoader loads each client half lazily in dependency order.
		 The central client half applies FIRST-enough.
		 It reflect-provides "playformFamilyPanel" and injects its conversation.view tab + shell.overlay registrations.
		 Its own children declarations live on ITS registration.
	3. EACH adapter client half applies: reflect-lookup -> gate 1 absent? No-op.
		 Present? -> gate 3 config check -> panel.register(...) inside ctx.effect (unwinds with the plugin).
	4. The central tab component subscribes to the registry (getVersion/subscribe, the plugin-manager "plugins.tab" pattern, pm client.js ~4307-4321).
		 It renders sections ordered by (mount, order).
	5. Toggle propagation: ANY config edit hot-replaces that ONE bundle -> its apply re-runs -> descriptor withdrawn/re-added -> registry version bumps -> central re-renders.
		 Disabling the central bundle removes the reflect service -> ALL adapters no-op on next load.
		 Already-registered effects unwind with the central plugin's fiber.
	6. Launch: a section calls props.open(target) -> central's open() -> layout.selectPanel / view activation (pluginNavigation pattern).
		 Sections NEVER touch layout directly.


4. THE POC PATH (smallest first adapter)
----------------------------------------

	Smallest: the tool-coach ladder. Steps:
	1. Create @playform/client-dsh-panel-family: index.d.ts (contract types), lib/client.js (registry + family-tab registration).
		 NO Host logic beyond a trivial Config.
	2. Add "client" + "./client" to hook-dsh-tool-coach's package.json.
		 Ship lib/client.js with the ladder section (reads its OWN config via the bundle's config plumbing; visuals inline in the adapter).
	3. Install both into the desktop profile as directory links.
		 Plugin-development skill sec.9 dev loop; linked checkouts need their own node_modules via pnpm install --ignore-workspace.
	4. Verify: GUI open -> session screen shows a "Family" tab next to Trajectory with the ladder.
		 Disable the central bundle in the Plugins page -> tab disappears, adapter dormant.
		 Re-enable -> back.
		 Flip hook-dsh-tool-coach's panel.enabled -> section gone, other adapters unaffected.
	5. Inspect: cordis_inspect_query client Slots.listSubTree root:"conversation.view" shows id=playform-family occupying the list next to id=chat and id=trajectory.
		 It requires the page open; the live query timed out during this research - GUI NOT connected.


5. ACCEPTANCE CRITERIA
----------------------

	A1  NO family runtime value is imported by the central plugin.
			NO family adapter imports anything from the central plugin except `import type` contract types.
	A2  With the central bundle disabled, EVERY adapter's client half applies as a no-op.
			Zero visual or console footprint.
	A3  With the central bundle enabled, the family tab renders exactly the sections whose adapter bundle is enabled AND whose per-adapter panel.enabled is true.
			Order is deterministic (order, then id).
	A4  Disabling ANY single adapter removes ONLY that adapter's section.
			The rest keep rendering.
	A5  Disabling the central bundle unmounts the tab and EVERY section in ONE cascade (slot inject lifetime collapse), with NO orphaned listeners (ALL registrations inside ctx.effect).
	A6  EVERY panel knob is a config field of its owning bundle and passes the cordis.yml test (changeable WITHOUT a code edit).
	A7  The family tab coexists with chat (id=chat) and trajectory (id=trajectory) tabs.
			NO priority shadowing of shipped cells.
	A8  Verification uses the smokes as arbiter (fake-ctx + real-factory) for the host halves.
			Plus a LIVE GUI check for the client halves.


RESIDUALS
---------

	- The exact owner-prop bag of conversation.view occupants was read from the trajectory registration (label/locale/order/children/inject).
	- The chat tab's registration was NOT diffed line-by-line.
	- The live Slots.listSubTree confirmation timed out (GUI page NOT connected at query time).
	- The verdict rests on the asar sources + slots.md, which agree.
	- Whether a future harness release adds conversation.trajectory.sections is unknowable from here.
	- Option B requires upstreaming that declaration to dsh-client-ui-trajectory (owner-only child declaration, slots.md:17).
	- Client-side reflect ("ctx.reflect.provide") was verified as the plugin-manager's cross-plugin channel (pluginNavigation).
	- A dedicated client Service was NOT tested (trajectory ships NONE - "no service" per its description).
	- Family adapters' client halves will need EACH linked checkout to carry its own node_modules (pnpm --ignore-workspace) - known dev-loop caveat, NOT a design blocker.
