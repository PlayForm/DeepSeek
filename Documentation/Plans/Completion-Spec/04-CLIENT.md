---
title: The completion spec - the client family
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/04-CLIENT.md
index: Documentation/INDEX.md
statuses:
    - name: the client family deltas
      state: draft
      evidence: the per-package sections below; wave 4 (last)
---

# THE COMPLETION SPEC - THE CLIENT FAMILY

> The three packages that put the family on screen. They ship last (the user's decision), and they
> are the most exposed to the harness's client SDK - the re-spec candidates below exist because the
> plans predate the current client bundle and slot model.

## 1. The client bundle contract (binding)

- A client package's entry is a closure-factory bundle built by the shared tsdown client preset:
  `window.__ModuleLoader__.load({ id, factory(require) })`; `exports["./client"]` points at
  `Target/Client.bundle.js`; the ESM `Target/Client.js` stays the dev/test surface.
- The factory returns `{ inject: ["slots", "locale"], apply, default }`.
- A client package must not import host packages at runtime; the injected `require` resolves the
  externals.
- The build is `Maintain/Build-Client-Bundle.mjs`; the two-step build (`prepublishOnly`) includes
  it.

## 2. The per-package deltas

### client-dsh-panel-family (B - RE-SPEC CANDIDATE)

- Now: the panel contract types, the registry, both mounts, the locale, the closure-factory bundle.
- Target: the v4.1 CHILD-SLOT model (the plan's side registry is the old model); the 13 per-bundle
  adapters (one per host bundle: normalize, governor, tool-coach, suggesters, workspace, batch,
  client-live, ...); the `configForms` (each plugin's options rendered from its schema); the panel
  accepts the trace events (D5) as its live source.
- Acceptance: every adapter registers and renders its plugin's status; a config form edits a
  volatile knob and the change lands without a remount; the child-slot model is proven by two nested
  panels.

### client-dsh-panel-family-host (C - RE-SPEC CANDIDATE)

- Now: a plain `ctx.provide` tail/stats service.
- Target: the Typert remote endpoints (the current Typert registry + gateway), every consumer, the
  adapters' host side; the policy block gates a panel's write actions.
- Acceptance: the browser half fetches the host half's status through Typert; a denied action
  surfaces in the panel.

### client-dsh-workspace-live (C - RE-SPEC CANDIDATE)

- Now: the stable-until-event store + the tab contract; nothing feeds it.
- Target: ingest from the trace bus (the graph's indexed/invalidated, the observe stamps, the batch
  transitions); render the stored tail; the tab obeys the child-slot model.
- Acceptance: a live event renders in the tab within the same session; a restart replays the tail.

## 3. The client family's acceptance gate

The family is complete when: the three packages build as closure-factory bundles; the 13 adapters
render every host plugin's status; a config form edits a live knob; the live tab is fed by the
trace; and the panel's write actions obey the policy block.
