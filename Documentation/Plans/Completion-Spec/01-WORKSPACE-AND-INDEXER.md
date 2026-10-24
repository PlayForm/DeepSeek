---
title: The completion spec - the workspace family and the indexer
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/01-WORKSPACE-AND-INDEXER.md
index: Documentation/INDEX.md
statuses:
    - name: the workspace family deltas
      state: draft
      evidence: the per-plugin sections below; the graph trigger landed (POC-LEDGER section 7)
---

# THE COMPLETION SPEC - THE WORKSPACE FAMILY AND THE INDEXER

> The 16 workspace packages, the trace bus that connects them, and the packs that make the family
> work in any repository. The family's own plans stay the intent owners; this file specifies the
> completion delta per package and the new trace/pack layer.

## 1. The trace bus and the indexer (D5)

The indexer is not a process and not a package: it is the composition of the trace bus.

- `lib-dsh-trace` (NEW, Classic + ETS twin): the pure vocabulary - the event names, the envelope,
  the coalescing key, the detached-loop contract, the adapter registry. No harness dependency.
- Per plugin: `Source/Trace/Contract.ts` (the events emitted/consumed) + `Source/Trace/Adapter.ts`
  (the hook-up) + optionally `Source/Trace/Detach.ts` (the deferred work). The adapter lives in the
  adapting plugin's source.
- Sources: `fs/observed` (the fs service), `tool/executed` (the tools pipeline), `session/started`
  (the session service), the observe hook's stamps, the journal's pre-images.
- Consumers: the graph (the index), the live view, the context packet, the graph suggester, the
  monitor's sweeps.
- The detached loop: a coalescing queue keyed by path, one in-flight task per key, no timers in the
  hot path, fail-open, a `Flush` promise for deterministic smokes, a disposer via `ctx.effect`.
- Acceptance: an event emitted by one plugin reaches another plugin's adapter without either
  importing the other; the loop coalesces duplicate events; a disabled plugin wires nothing.

## 2. The packs (D2, D3, D4)

- `~/.dsh/playform/workspaces/<repo-slug>.yml` (user layer) -> `<repo>/.dsh/pack.yml` (repo layer)
  -> `extends:` chains. Merge per section; cycle-guarded.
- A pack carries `signature`, `families` (id, signals, targets, thresholds), `indexer` (scope,
  excludes, languages, maxFiles), `policy` (per action: auto | approve), `learning`.
- The built-in packs for this monorepo ship as data (the six suggesters' current packs become the
  `playform-deepseek` pack); a repo without a pack is silent and the learner may propose one.
- Acceptance: the same note in this repo from the built-in pack and from the extracted pack; a
  foreign repo with no pack stays silent; a pack with `extends` resolves the inherited families.

## 3. The per-package deltas

### plugin-dsh-workspace-graph (A after the trigger landed)

- Now: the W1 contract + `indexWorkspace(root?, {maxFiles})`, the `fs/observed` re-index listener,
  `neighborhood(path, limit)`, the KV store, the v0 line/regex scanner.
- Target: the trace adapter (emit `graph/indexed`, `graph/invalidated`; consume the observation
  trace instead of registering `ctx.root.on` directly); the deferred edge kinds (`references`,
  `calls`, `tests`, `ConfigKey`) behind the same query API; a cached neighborhood index; deletion
  events call `removeFile`; the listener disposer via `ctx.effect`; the pack's `indexer` section
  drives scope/excludes/languages/maxFiles.
- Acceptance: a real temp tree indexes, the four deferred edges are honestly empty or real (never
  faked), the trace round-trip works, the disabled gate stays byte-exact.

### plugin-dsh-workspace (A)

- Now: five tools (map, find, expand, context, index), cursor pagination, honest budget clamping.
- Target: the tools read the pack's indexer policy; `workspace_index` accepts the pack's scope; the
  `expand` focus-in-neighbors decision (the frozen contract carries the start node first - either
  document it as intended or add a `focus: false` option); the trace adapter consumes
  `graph/invalidated` to invalidate its cached packet.
- Acceptance: the five tools over a real graph (landed), the invalidation path, the refusal shape.

### hook-dsh-workspace-observe (A)

- Now: version stamps, the ring, the own-actor/excluded guards, the sequence.
- Target: emit the observation trace (the first source of the indexer); the stamps become the
  coalescing key; the ring's guards stay.
- Acceptance: an observed write reaches the graph's adapter; the guards still silence own-actor
  events; the ledger strings unchanged.

### hook-dsh-workspace-operate (A)

- Now: the typed proposals + the full refusal vocabulary + the fence + the tools.
- Target: the proposals feed the batch-edit machine (the caller-side wiring the plan defers); the
  policy allowlist decides auto vs approve per proposal kind.
- Acceptance: a proposal becomes a batch-edit process; a refusal stays byte-exact.

### hook-dsh-workspace-govern (A)

- Now: the four independent means-checks + the fail-open/fail-closed table + the loop guard.
- Target: the recovery table's actions are wired to the journal and the merge; the policy reads the
  pack's section.
- Acceptance: each recovery row is exercised by a smoke; the fail-open path never throws.

### plugin-dsh-workspace-authority (A)

- Now: the three records + the five dispositions + the shields, in memory.
- Target: KV persistence through `ctx.storage`; the lease/residency survive a restart; the eviction
  events go on the trace.
- Acceptance: a restart preserves the records; an expired lease evicts.

### hook-dsh-workspace-approve (A)

- Now: the exact-candidate bindings + the check chain + the invalidation.
- Target: the bindings connect to the batch decision's handoff; an approval resolves the pending
  proposal in batchstate.
- Acceptance: an approved proposal becomes an applied batch; a stale candidate is invalidated.

### hook-dsh-workspace-merge (A)

- Now: the gates + the commits + the CommitReply union + the read-back.
- Target: the three-way merge (deferred by v4.1) as a later-stage item; the policy allowlist gates
  auto-merge.
- Acceptance: a two-parent merge commits; a conflict refuses byte-exactly.

### hook-dsh-workspace-journal (A)

- Now: open/seal/revert/recover + the reverse replay.
- Target: KV persistence; the trace emits the pre-image events; the revert is reachable from the
  govern recovery table.
- Acceptance: a restart recovers an open journal; a revert restores the pre-image.

### hook-dsh-workspace-audit (A)

- Now: the audit lines + the recursion-prevention fields.
- Target: the audit chain consumes the trace's write events; the sequence stays monotonic.
- Acceptance: the chain is gap-free under concurrent writes.

### plugin-dsh-workspace-context (A)

- Now: the eight-section packet + the budget clamp + the lenses.
- Target: graph-relevance ranking of NEIGHBORS (D7); the packet's EVIDENCE cites the graph's
  fingerprints; the trace invalidates a stale packet.
- Acceptance: the packet ranks a near node above a far one; a stale version sets the STALE line.

### hook-dsh-workspace-monitor (A)

- Now: the timerless watch + the sweep + the classification.
- Target: the check sets come from the pack; the sweep is driven by the trace's invalidation; a
  watch survives a restart via KV.
- Acceptance: a check-set change fires once; the sweep classifies correctly.

### plugin-dsh-workspace-evidence (A)

- Now: the four truth kinds + the invalidation + the supersede.
- Target: the evidence objects carry the trace's timestamps; the invalidation consumes
  `graph/invalidated`.
- Acceptance: an invalidated evidence is superseded, not silently kept.

### plugin-dsh-workspace-semantics (B - RE-SPEC CANDIDATE)

- Now: ONE lexical TypeScript adapter; dotted-word references (not scope-resolved); nothing injects
  the service.
- Target: the other adapters (JSON, YAML, Markdown links, package.json dependency graph); the
  consumer wiring (the graph's `references` edge, the reflect's rename); adopt the harness LSP/AST
  service if present, keep the lexical adapter as the fallback.
- Acceptance: resolve/references/rename on a fixture per adapter; the consumer receives the service.

### plugin-dsh-workspace-reflect (B - RE-SPEC CANDIDATE)

- Now: textual whole-word span replacement; no AST engine, no block fingerprint targeting.
- Target: the AST-aware engine (or the harness AST/LSP service), the block-fingerprint targeting,
  the edit-suggester's `Symbol` family feeding it.
- Acceptance: a rename rewrites only the intended span; a block target resolves by fingerprint.

### lib-dsh-workspace-live (A)

- Now: the shared section/render library.
- Target: the live view's renderer consumes the trace (the section types gain a live feed); the
  library stays harness-free.
- Acceptance: a render from a trace event is byte-stable.

### client-dsh-workspace-live (C - RE-SPEC CANDIDATE, wave 4)

- Now: the stable-until-event store + the tab contract; nothing feeds it.
- Target: ingest from the trace bus; render the stored tail; the child-slot model.
- Acceptance: a live event renders in the tab.

## 4. The workspace family's acceptance gate

The family is complete when: the trace round-trip works between the observe hook and the graph; the
graph answers the four tools over a real workspace; the pack layer supplies the indexer policy; and
every package's plan items outside "later stage" are implemented with a smoke folder each.
