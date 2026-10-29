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

> The three packages that put the family on screen. They ship last, by the decision of the user, and
> they are the most exposed to the client SDK of the harness, so the re-spec candidates below exist
> because the plans predate the current client bundle and slot model.

## 1. The client bundle contract (binding)

- The entry of a client package is a closure-factory bundle that the shared tsdown client preset
  builds, where `window.__ModuleLoader__.load({ id, factory(require) })` runs and
  `exports["./client"]` points at `Target/Client.bundle.js`, and the ESM `Target/Client.js` stays
  the dev and test surface.
- The factory returns `{ inject: ["slots", "locale"], apply, default }`.
- A client package must not import host packages at runtime, and the injected `require` resolves the
  externals.
- The build is `Maintain/Build/Client-Bundle/Index.mjs`, and the two-step build (`prepublishOnly`)
  includes it.

## 2. The per-package deltas

### client-dsh-panel-family (B - RE-SPEC CANDIDATE)

- Now: the panel contract types, the registry, both mounts, the locale, and the closure-factory
  bundle.
- Target: the v4.1 CHILD-SLOT model, because the side registry of the plan is the old model, the 13
  per-bundle adapters (one per host bundle: normalize, governor, tool-coach, suggesters, workspace,
  batch, client-live, and the rest), the `configForms` where the options of each plugin render from
  its schema, and a panel that accepts the trace events (D5) as its live source.
- Acceptance: every adapter registers and renders the status of its plugin, a config form edits a
  volatile knob and the change lands without a remount, and two nested panels prove the child-slot
  model.

### client-dsh-panel-family-host (C - RE-SPEC CANDIDATE)

- Now: a plain `ctx.provide` tail and stats service.
- Target: the Typert remote endpoints through the current Typert registry and gateway, every
  consumer, the host side of the adapters, and a policy block that gates the write actions of a
  panel.
- Acceptance: the browser half fetches the status of the host half through Typert, and a denied
  action surfaces in the panel.

### client-dsh-workspace-live (C - RE-SPEC CANDIDATE)

- Now: the stable-until-event store and the tab contract, with nothing that feeds them.
- Target: ingest from the trace bus of the indexed and invalidated events of the graph, the observe
  stamps, and the batch transitions, a render of the stored tail, and a tab that obeys the
  child-slot model.
- Acceptance: a live event renders in the tab within the same session, and a restart replays the
  tail.

## 3. The client family's acceptance gate

The family is complete when the three packages build as closure-factory bundles, the 13 adapters
render the status of every host plugin, a config form edits a live knob, the trace feeds the live
tab, and the write actions of the panel obey the policy block.
