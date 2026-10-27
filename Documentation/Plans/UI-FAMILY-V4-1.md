---
title: The Visual Panel / UI Family - v4.1 distilled plan
category: Plans
kind: living-plan
date: 2026-10-21
status: active
registry: Documentation/Plans/UI-FAMILY-V4-1.md
index: Documentation/INDEX.md
statuses:
    - name: the distillation of the 14-document UI corpus
      state: resolved
      evidence:
          this document - the best ideas kept, the five load-bearing errors corrected, the slot
          model restored
    - name: the corrected contribution model (slots plus a host-side data registry)
      state: open
      evidence: section 3; the render-function registry is replaced by child-slot injection
    - name: the two-package probe (the smallest slice)
      state: planned
      evidence:
          section 6; proves client-half loading, cross-package injection, runtime child declaration,
          cleanup
    - name: the tool-coach adapter (the first real contribution)
      state: planned
      evidence: section 7; the ladder section plus the first config form
    - name: the trust, state, accessibility, and test contracts
      state: open
      evidence: sections 3.4-3.7; the corpus had none of them
    - name: the phased delivery P0-P9
      state: planned
      evidence: section 8
    - name: the research agenda U1-U10
      state: planned
      evidence: section 9
---

# The Visual Panel / UI Family - v4.1

This document is the distillation of the UI epic.
It keeps the plan's best ideas, which are the panel contract, the cascade gates, the volatile-config chain, the tool-coach proof, and the additive-smoke law.
It also corrects the five errors that would have blocked implementation.
The old granular documents stay as the detailed record, and where they disagree with this document, this one wins.

## 1. The verdict on the corpus

The plan is technically detailed and grounded in the harness's client surface, but five load-bearing errors would stop it on day one:

1. **The counts are wrong.**

    The live profile has 14 `@playform` rows, not 13, and `lib-dsh-core` is a library with no loader row that cannot carry a client half.
    The family is 15 Classic + 16 EffectTS packages, not "25 at 0.0.1" as the brief says.

2. **The routing law is dead.**

    The brief mandates `@cf/zai-org/glm-5.3-flash`, but the live profile records that model as removed on 2026-10-20, with `deepseek-v4.1-flash-1017` as the sole model.
    A plan that hardcodes the removed route fails its first delegation.

3. **The central architecture bypasses the documented slot model.**

    The plan registers render functions through `ctx.reflect.provide("playformFamilyPanel", ...)`.
    The harness's supported mechanism is a child slot declared by the entry that owns the render site.
    A side registry loses the locale `t`, the store, the inject face, the priority, and the session scope, and it stays invisible to `Slots.listSubTree`, which is the very arbiter the plan's acceptance uses.

4. **The restart story contradicts itself.**

    Phase 2 says no restart is needed, and phase 3 says restart once.
    The loader discovers a client half on composition, so the rule is one restart on install and then HMR.

5. **The form POC is missing its inject.**

    The tool-coach client half declares `dsh-client-locale` but uses `ctx.configForms`, which comes from `dsh-client-ui-settings`.

The whole set also has no theme, accessibility, state, or client-test story, and the only client verification is a manual GUI look.

## 2. The best ideas, kept

1. **The panel contract as the one shared artifact.**

    The section shape, the mount points, and the launch target are shared, with zero adapter logic in the central package.

2. **The cascade gates.**

    The central bundle off hides the tab, an adapter off hides its section, and the adapter's own `panel.enabled` off hides only its section.

3. **The volatile-config chain.**

    It combines `configForms.whileServed` with the revision-fenced save, the patch override, the no-remount update, and the restart persistence.

4. **The tool-coach POC.**

    One bundle proves the whole chain: the ladder section, the first form, and the marker rule.

5. **The additive-smoke law.**

    Every change keeps the ledger strings byte-identical, and new behavior gets new assertions.

6. **The single trusted write surface.**

    One path writes the config, and one path writes the ledger.

7. **The spike-plus-fallback discipline.**

    A risky integration is spiked, and a pre-decided fallback exists before the spike starts.

## 3. The corrected architecture

### 3.1 React travels through slots

The central package owns a **render site**, not a registry of render functions.
It injects `conversation.view` with a family tab, and its registration declares a child slot:

```text
conversation.view
  playform-family (the tab)
    playform.panel.section   <- the child slot; each adapter injects here
```

Each adapter's client half injects `playform.panel.section` and registers one section component.
The slot model then gives what the side registry lost: the locale, the store, the inject face, the priority, the session scope, and `Slots.listSubTree` visibility.

The overlay uses `shell.overlay` with the same child-slot pattern.
A sidebar entry uses `sidebar.panellist` only with a real `main` entry, because a missing main throws, so that mount is opt-in after the first two are proven.

### 3.2 The contribution model: data plus slots

A plugin contributes in one of two ways:

| Contribution       | Where it lives                                              | What the client does                                                 |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Section metadata   | the host half (config or a service), data-only              | the adapter's slot component reads it and renders                    |
| A config form      | `configForms.whileServed` (host-described, client-rendered) | the form renders from `describe()` and saves with the revision fence |
| A badge or command | the host half, data-only                                    | the panel's chrome renders it                                        |

The rule is that **data crosses from the host and React crosses through slots**.
A plugin without a browser half can still contribute metadata, and only a plugin with a client half can render a component.
This rule is the "dispersed through the plugins" model made concrete.

### 3.3 The panel contract

```text
PanelSection = {
  id: string;
  bundle: string;          // the owning package
  title: string;           // locale key
  order: number;           // within the family tab
  mount: "family-tab" | "overlay";
  enabled?: () => boolean; // the adapter's own gate
}
```

The section component receives the session scope, the locale, the store, the open(target) callback, and the panel version.
It returns React, and it does not fetch files directly, because the workspace or the host service supplies the data.

### 3.4 Trust and permissions

- The **client half is code**, so the trust boundary is the bundle install and the profile's bundle list.
  The panel does not sandbox React; it limits what a section can do by the props it receives and by the services the client half declares in `dsh.client.inject`.
- **Host contributions are data**, so they cannot execute, and the panel renders them through its own components.
- A section never receives a raw file handle or a raw config writer; it receives the read models and the open/refresh callbacks.
- The UI must not be able to write a manifest or a ledger except through the existing tools and services, and the panel's only write path is the config form's revision-fenced mutate.
- **The `editFull` threat**: the plain-field bridge (phase 7) writes the whole profile config.
  It is the highest-risk surface in the epic and needs an allowlist of namespaces, an audit line per write, a confirmation UX, and secret redaction (`role('secret')`) before it ships.
  The panel must never render a secret value.

### 3.5 State and refresh

- The host-side data carries a version, and the client subscribes to the registry's version or the host service's events and re-renders.
- The section has explicit **loading**, **empty**, **error**, and **stale** states, and a stale section shows the version it holds and one refresh action.
- A section that throws is contained by an error boundary, and the rest of the tab survives.
- The cascade on unregister removes the section and its subscriptions.

### 3.6 Accessibility and theme

- The panel uses the harness's theme tokens (`Theme.listTokens`), with no hardcoded colors.
- Every interactive element is keyboard reachable with a visible focus, and the tab follows the harness's tab semantics.
- Every icon carries a label or is `aria-hidden`, and every section has a heading.
- `prefers-reduced-motion` guards any animation.
- The section's text respects the locale service.

### 3.7 The test harness

- **Host**: the registry and contract smoke (fake ctx) covers ordering, cascade, version, and the empty state.
- **Client**: a jsdom render test of a section covers props, states, and keyboard, plus a snapshot of the empty tab.
- **Live**: `Slots.listSubTree` shows the family tab and the section child, the GUI renders, and uninstalling the adapter removes the section with zero residue.
- The `Slots` and `Theme` inspect queries require an open page, and a closed page times out, which is a known limit and not a failure.

### 3.8 The verified client surface

| Surface                          | Verified shape                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `conversation.view`              | a list, session-scoped; occupants `chat` and `trajectory`                                                 |
| `conversation.trajectory.images` | the only in-trajectory anchor                                                                             |
| `shell.overlay`                  | a root list; click-through until the entry opts into pointer events                                       |
| `sidebar.panellist`              | a root list; an id must match a `main` keyed entry or selection throws                                    |
| `plugins.*`                      | nine slots; `rowConfigKey(bundle, rowId)`                                                                 |
| `ctx.slots.inject/register`      | `children`, `inject`, `store`, `locale`, `priority`; `ctx.slots.subscribe`                                |
| `ctx.reflect.provide`            | the `pluginNavigation` precedent (a service, not a render registry)                                       |
| `ctx.configForms`                | provided by `@deepseek-ai/dsh-client-ui-settings`; `whileServed(namespaces, register)` returns a disposer |
| `dsh.client`                     | `{ platform, inject, immediately }`; attached only to the bare-name Loader row                            |
| The restart                      | the client half is discovered on composition: one restart on install, then HMR                            |

The asar line anchors in the old plan are not reproducible, so v4.1 cites the shipped doc text and the live inspect instead.
The `Slots` and `Theme` client queries require an open page, and a closed page times out, so every phase needs a written source-level fallback.

## 4. The corrected counts and identities

- The live profile has **14 `@playform` rows**, and `lib-dsh-core` is not one of them, because it is a library with no loader row and no client half.
- The loadable bundles are the factory plus the 13 hooks, and the UI adapters are **one per loadable bundle that has something to show**, which gives 14 candidates rather than a fixed 13.
- The family is 15 Classic + 16 EffectTS packages, and the site is 24 content pages.
- The routing is `deepseek-v4.1-flash-1017`, per `task-routing`, with no GLM.

## 5. The panel and the workspace

The panel is the workspace's surface, and the family tab renders the map, the focus, and the neighbors from the workspace graph.
The workspace's `live` package supplies the sections, and the panel supplies the slot and the chrome.
The two epics share one contract, because the panel renders what the graph knows.
This shared contract is why the workspace `live` package and the panel contract are designed together.

## 6. The smallest slice: the two-package probe

Do not start with the registry.
Start with two throwaway packages:

1. **Probe A** declares `dsh.client`, injects `conversation.view`, and registers a tab with a child slot `playform.probe.section` in its registration's children map.

2. **Probe B** injects `playform.probe.section` and registers one cell.

3. **The verification** shows both keys and their occupants in `Slots.listSubTree`, the GUI renders the cell, and uninstalling both leaves zero residue.

4. **The decision** then settles the registry-versus-slots question with evidence, not preference.

This probe proves client-half loading, cross-package injection, runtime child declaration, and cleanup, without the registry, `configForms`, or the Typert endpoint.

## 7. The tool-coach adapter (the first real contribution)

Do this work after the probe:

1. **The ladder section.**

    The coach's client half injects `playform.panel.section` and registers the ladder section (`order 30`), and the data is the coach's strike and escalation state, supplied by the host half as a read model rather than a file read.

2. **The first config form.**

    It uses `configForms.whileServed(["hook-dsh-tool-coach"])` plus the `plugins.row.config` slot, renders from `describe()`, and saves with `mutate(ops, expectedRevision)`.
    The inject list includes `@deepseek-ai/dsh-client-ui-settings`.

3. **The marker rule (host-side).**

    A `<<<CCR:` result teaches `ccr_retrieve`, and the ledger-search text points at the grep tool.

4. **The four-point chain.**

    The form renders, a volatile knob saves to the patch, an invalid value is refused, and a restart persists it.

5. **The cascade.**

    Central off, adapter off, and `panel.enabled` off each behave as section 2 describes.

## 8. The phases

| Phase | Work                                             | Acceptance                                                       |
| ----- | ------------------------------------------------ | ---------------------------------------------------------------- |
| P0    | Orientation, the live counts, the slot captures  | the corrected inventory; the slot tree captured                  |
| P0.5  | The two-package probe                            | both slot keys, the GUI render, zero residue                     |
| P1    | The contract decision (`DECISIONS.md`)           | one recorded decision with evidence and a rejected alternative   |
| P2    | The panel contract on slots                      | the family tab with the child slot; the empty state; the cascade |
| P3    | The tool-coach adapter + the first form          | the four-point chain; the marker rule; additive smokes           |
| P4    | The forms for the remaining volatile rows        | every row editable; the patch override; the revision fence       |
| P5    | The remaining adapters (one per loadable bundle) | each section; the cascade; the counts                            |
| P6    | The interaction improvements (R1-R10)            | additive smokes only                                             |
| P7    | The plain-field bridge + the trajectory proposal | the bridge; the upstream proposal                                |
| P8    | The ETS parity                                   | the twins' client halves                                         |
| P9    | The site page                                    | the panel documented; the build green                            |

## 9. The research agenda

U1: does the child-slot model carry the section props (locale, store, session) without the registry?

U2: what is the minimum client inject face for a section?

U3: how does a section read host data without a file read?

U4: the refresh and version model under HMR.

U5: the trust boundary, and what a section can reach.

U6: the error boundary behavior.

U7: the form's revision fence under a concurrent edit.

U8: the accessibility of the tab and the forms.

U9: the ETS client-half parity.

U10: the workspace view in the panel, which is the convergence.

## 10. The document upgrade map

- **Keep**: R-UI-1 (the slot inventory), R-UI-2 (the volatile chain), the R-UI-3 POC, PHASE-3 step 6 (the four-point verification), PHASE-5's spike-plus-fallback, PHASE-6's additive-smoke law, and PHASE-7's single write surface.
- **Rewrite**: BRIEF sections 1 and 3 (counts and routing), PHASE-2 (slots, not the registry), PHASE-3 (the inject and the restart), RISKS (add the trust, state, a11y, and test risks), STATUS-LEDGER, and ONE-PARAGRAPH-SUMMARY.
- **Split**: PHASE-3 into adapter and form, PHASE-4 into forms and chrome, PHASE-5 into the endpoint spike and the adapters, and PHASE-7 into the bridge and the upstream proposal.
- **Merge**: PHASE-1 into the site page, and the duplicate restart guidance.
- **Correct**: PHASE-4's per-bundle renderer copies contradict "the only shared artifact", so decide one shared renderer; PHASE-5 lists `lib-dsh-core` as an adapter, but core has no loader row; PHASE-7 promises a phase 8 that did not exist; R-UI-2's "EVERY field shows as user-overridden" is false for the coach and live-containers rows; R-INTERACT says live-containers is `enabled: false`, but the live patch has `enabled: true`; the asar line anchors and the GUI URL are ephemeral and must not be cited as durable facts.
- **New**: `PANEL-CONTRACT.md`, `CONTRIBUTION-CONTRACT.md`, `RUNTIME-MODIFICATION-MODEL.md`, `ADAPTER-REGISTRY.md`, `LAYOUT-AND-MOUNTS.md`, `TRUST-AND-PERMISSIONS.md`, `STATE-AND-REFRESH.md`, `ACCESSIBILITY-AND-THEME.md`, `TEST-HARNESS.md`, `VERSIONING-AND-COMPATIBILITY.md`, `SITE-PAGE.md`, `DECISIONS.md`, and `PHASE-8-ETS-PARITY.md`.

## 11. The decisions this plan needs

1. **The slot model over the side registry.**

    The probe decides this with evidence.

2. **The contribution split.**

    Data comes from the host, and React goes through slots.

3. **The adapter count.**

    It is one per loadable bundle, not a fixed 13.

4. **The trust boundary.**

    The bundle install is the boundary, and the panel limits the props and the inject face.

5. **The workspace coupling.**

    The panel's family tab renders the workspace sections.
