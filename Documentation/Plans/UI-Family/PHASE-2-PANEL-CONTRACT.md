---
title: The UI Family Implementation Plan - phase 2 (the panel contract)
category: Plans/UI-Family
kind: queued-plan
date: 2026-10-20
status: planned
registry: Documentation/Plans/UI-Family/PHASE-2-PANEL-CONTRACT.md
index: Documentation/INDEX.md
statuses:
	- name: the central panel package @playform/client-dsh-panel-family
		state: open
		evidence: this document - the contract types, the registry service, the mount points, zero adapter logic
---

# PHASE 2 - THE PANEL CONTRACT: @playform/client-dsh-panel-family

> This is a granular document of the UI Family Implementation Plan. The parent hub is
> Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md.

---

- **THE GOAL**: create the central package that owns the PANEL CONTRACT, which is the types, the
  registry service, and the mount points, and nothing else.
- **NO ADAPTER LOGIC**: this rule is R-UI-3 section 2.2 verbatim, made concrete.

## 1. Exact locations

- **THE NEW PACKAGE**: Classic/packages/client-dsh-panel-family/
    - package.json (name @playform/client-dsh-panel-family)
    - cordis.patch.yml (one row named after the package, disabled:false)
    - Source/... (the family's standard layout: Source/Library.ts entry, Source/prepublishOnly.sh,
      Source/Run.sh, Source/Test/)
    - Target/ (built output, produced by the build and never hand-written)
    - index exports: "." -> types only (zero runtime), "./client" -> the built lazy-CJS client,
      "./locale/*.json", "./icon"
    - package.json "dsh": { "bundle": { "patch": "./cordis.patch.yml" }, "client": { "platform":
      "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-locale",
      "@deepseek-ai/dsh-client-ui-layout", "@deepseek-ai/dsh-api-remotes"] } }
- **THE CONTRACT TYPES** (Source/Interface/Panel.ts): type PanelMount = "family-tab" | "overlay" |
  "sidebar" type PanelSection = { id; bundle; title; order; mount; render: (props: SectionProps) =>
  ReactNode } type SectionProps = { sessionId?; useTrajectory?; open: (LaunchTarget) => void } type
  LaunchTarget = { view: string; focus?: string }
- **THE CLIENT HALF** (built ./client, lazy-CJS factory: window.**ModuleLoader**.load({id,
  factory(require)})):
    - ctx.reflect.provide("playformFamilyPanel", { register, entries, subscribe, getVersion, open })
    - ctx.slots.inject("conversation.view", ...) -> the family tab (id "playform-family", order 20,
      scope session), rendering all registered sections with mount "family-tab" ordered by (order,
      id).
    - ctx.slots.inject("shell.overlay", ...) -> overlay panels (mount "overlay") opened via open().
    - All registrations live inside ctx.effect, so they unwind with the plugin.
- **THE HOST HALF**: the Source entry exports apply() {} as empty, and the row exists so the client
  module system serves the half.
- **THE SMOKE**: Source/Test/ holds a fake-ctx suite that asserts the registry contract (register
  and entries and subscribe ordering, plus the cascade on unregister).

## 2. Exact steps

1. **Scaffold the package.**

    Follow the family conventions and copy the structure of Classic/packages/hook-dsh-tool-coach:
    Configuration/, cordis.patch.yml, package.json, Source/{Function,Interface,Variable, Test},
    tsconfig.json.

2. **Write the contract types first.**

    Put them in Source/Interface/Panel.ts, because they are the ONLY shared artifact in the whole
    design.

3. **Implement the client half.**

    Build the registry service and the two mount-point slot registrations. Hand-write the lazy-CJS
    client file, which is small. If the volume grows, add a clientBundle build step to
    Source/prepublishOnly.sh, modeled on <DSH>/packages/client/tsdown.client.ts (the R-UI-2 build
    gap).

4. **Add the locale.**

    Put the strings in Source/Variable/locale via ./locale/*.json, and route EVERY visible string
    through the client locale service (A6 of R-UI-1).

5. **Write the smoke suite.**

    Use the fake-ctx plus real-factory pattern per the smoke-writing skill, and add the folder to
    the runner's expected counts.

6. **Build and run.**

    Run Source/prepublishOnly.sh and then the smokes.

7. **Install into the desktop profile.**

    Use plugin_manager install_bundle with the absolute package directory, and verify that NO
    restart is needed, because this is a pure client package (the R-UI-1 finding). Verify that the
    mount-failure class from phase 0 does NOT reproduce; if it does, STOP, diagnose against the
    phase 0 findings, and record the result in the risks document before you continue.

8. **Live-verify with the GUI open.**

    Slots.listSubTree root:"conversation.view" shows id=playform-family next to id=chat and
    id=trajectory, and the empty family tab renders with no sections yet.

9. **Decide the publish step.**

    Keep the package at 0.0.1 in-tree until phase 3 proves the contract, then bump it and note the
    change in Documentation/Plugins/PLUGIN-FAMILY.md.

ANCHORS: R-UI-3 sections 2.1-2.2 and 3; <DOCS>/docs/subsystems/slots.md ("Declaration and
lifecycle", "Component inputs", the extension rules incl. "import type only"); conversation.view
declared by <DSH>/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js; the registry
pattern precedent: plugin-manager client.js ~4307-4321 and pluginNavigation ~4465.

## 3. Acceptance

- A2.1 The package exists with the contract types, the registry service, the family-tab and
  shell.overlay mount points, and zero adapter logic.
- A2.2 The smoke suite passes, and the aggregate runner prints the expected total (the 207 baseline
  plus 1 new folder, with both trees updated).
- A2.3 The empty family tab renders in the GUI between Trajectory and chat, with the order verified
  via the live slot tree, and it is removable by uninstalling the bundle with zero residue.
- A2.4 No runtime import exists between the central package and any adapter, verified by grep for
  only `import type` from the contract.
