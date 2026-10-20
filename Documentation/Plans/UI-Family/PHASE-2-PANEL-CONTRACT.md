---
title: The UI Family Implementation Plan - phase 2 (the panel contract)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-2-PANEL-CONTRACT.md
index: Documentation/INDEX.md
statuses:
	- name: the central panel package @playform/dsh-panel-family
		state: open
		evidence: this document - the contract types, the registry service, the mount points, zero adapter logic
---

# PHASE 2 - THE PANEL CONTRACT: @playform/dsh-panel-family

> Granular document of the UI Family Implementation Plan.
> The parent hub: Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

THE GOAL: create the central package that owns the PANEL CONTRACT (the types, the registry service, the mount points) and nothing else.
NO adapter logic.
This is R-UI-3 section 2.2 verbatim, made concrete.

## 1. Exact locations

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

## 2. Exact steps

1. Scaffold the package following the family conventions (copy the structure
	of Classic/packages/hook-dsh-tool-coach: Configuration/, cordis.patch.yml,
	package.json, Source/{Function,Interface,Variable,Test}, tsconfig.json).
2. Write the contract types first (Source/Interface/Panel.ts).
	They are the ONLY shared artifact in the whole design.
3. Implement the client half: the registry service + the two mount-point
	slot registrations.
	Hand-write the lazy-CJS client file (small).
	If the volume grows, add a clientBundle build step to Source/prepublishOnly.sh
	(modeled on <DSH>/packages/client/tsdown.client.ts - the R-UI-2 build gap).
4. The locale: Source/Variable/locale strings via ./locale/*.json.
	EVERY visible string routes through the client locale service (A6 of R-UI-1).
5. Write the smoke suite (fake-ctx + real-factory pattern per the smoke-writing skill).
	Add the folder to the runner's expected counts.
6. Build (Source/prepublishOnly.sh) and run the smokes.
7. Install into the desktop profile via plugin_manager install_bundle with the absolute package directory.
	Verify NO restart is needed (pure client package - R-UI-1 finding).
	Verify the mount-failure class from phase 0 does NOT reproduce (if it does: STOP, diagnose against the phase 0 findings, record in the risks document before continuing).
8. Live-verify with the GUI open: Slots.listSubTree root:"conversation.view"
	shows id=playform-family next to id=chat and id=trajectory.
	The empty family tab renders (no sections yet).
9. Publish decision: keep at 0.0.1 in-tree until phase 3 proves the contract.
	Then bump and note in Documentation/Plugins/PLUGIN-FAMILY.md.

ANCHORS: R-UI-3 sections 2.1-2.2 and 3; <DOCS>/docs/subsystems/slots.md
("Declaration and lifecycle", "Component inputs", the extension rules incl.
"import type only"); conversation.view declared by
<DSH>/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js;
the registry pattern precedent: plugin-manager client.js ~4307-4321 and
pluginNavigation ~4465.

## 3. Acceptance

A2.1 The package exists with the contract types, the registry service, the
	family-tab and shell.overlay mount points, and zero adapter logic.
A2.2 The smoke suite passes and the aggregate runner prints the expected
	total (the 207 baseline + 1 new folder, both trees updated).
A2.3 The empty family tab renders in the GUI between Trajectory and chat
	(order verified via the live slot tree), removable by uninstalling the
	bundle with zero residue.
A2.4 No runtime import exists between the central package and any adapter
	(verified by grep: only `import type` from the contract).
