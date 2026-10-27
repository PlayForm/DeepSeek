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
> work in any repository. The family's own plans stay the intent owners, and this file specifies the
> completion delta for each package and the new trace and pack layer.

## 1. The trace bus and the indexer (D5)

The indexer is not a process and it is not a package, because it is the composition of the trace
bus.

- `lib-dsh-trace` (new, Classic + ETS twin): the pure vocabulary, which holds the event names, the
  envelope, the coalescing key, the detached-loop contract, and the adapter registry. It has no
  harness dependency.
- Each plugin carries `Source/Trace/Contract.ts` (the events that it emits and consumes),
  `Source/Trace/Adapter.ts` (the hook-up), and, when it needs deferred work,
  `Source/Trace/Detach.ts`. The adapter lives in the source of the adapting plugin.
- The sources are `fs/observed` (the fs service), `tool/executed` (the tools pipeline),
  `session/started` (the session service), the stamps of the observe hook, and the pre-images of the
  journal.
- The consumers are the graph (the index), the live view, the context packet, the graph suggester,
  and the sweeps of the monitor.
- The detached loop is a coalescing queue keyed by path, with one in-flight task per key, no timers
  in the hot path, fail-open behavior, a `Flush` promise for deterministic smokes, and a disposer
  via `ctx.effect`.
- Acceptance: an event that one plugin emits reaches the adapter of another plugin without either
  one importing the other, the loop coalesces duplicate events, and a disabled plugin wires nothing.

## 2. The packs (D2, D3, D4)

- The layers resolve from `~/.dsh/playform/workspaces/<repo-slug>.yml` (user layer) to
  `<repo>/.dsh/pack.yml` (repo layer) to the `extends:` chains, and they merge per section with a
  cycle guard.
- A pack carries `signature`, `families` (id, signals, targets, thresholds), `indexer` (scope,
  excludes, languages, maxFiles), `policy` (per action: auto | approve), and `learning`.
- The built-in packs for this monorepo ship as data, where the current packs of the six suggesters
  become the `playform-deepseek` pack, and a repo without a pack stays silent while the learner may
  propose one.
- Acceptance: the same note in this repo from the built-in pack and from the extracted pack, a
  foreign repo with no pack stays silent, and a pack with `extends` resolves the inherited families.

## 3. The per-package deltas

### plugin-dsh-workspace-graph (A after the trigger landed)

- Now: the W1 contract, `indexWorkspace(root?, {maxFiles})`, the `fs/observed` re-index listener,
  `neighborhood(path, limit)`, the KV store, and the v0 line/regex scanner.
- Target: the trace adapter that emits `graph/indexed` and `graph/invalidated` and consumes the
  observation trace instead of registering `ctx.root.on` directly, the deferred edge kinds
  (`references`, `calls`, `tests`, `ConfigKey`) behind the same query API, a cached neighborhood
  index, deletion events that call `removeFile`, the listener disposer via `ctx.effect`, and the
  `indexer` section of the pack that drives scope, excludes, languages, and maxFiles.
- Acceptance: a real temp tree indexes, the four deferred edges are honestly empty or real and never
  faked, the trace round-trip works, and the disabled gate stays byte-exact.

### plugin-dsh-workspace (A)

- Now: five tools (map, find, expand, context, index), cursor pagination, and honest budget
  clamping.
- Target: the tools read the indexer policy of the pack, `workspace_index` accepts the scope of the
  pack, the `expand` focus-in-neighbors decision is documented as intended or gains a `focus: false`
  option, and the trace adapter consumes `graph/invalidated` to invalidate its cached packet.
- Acceptance: the five tools over a real graph (landed), the invalidation path, and the refusal
  shape.

### hook-dsh-workspace-observe (A)

- Now: version stamps, the ring, the own-actor and excluded guards, and the sequence.
- Target: emit the observation trace as the first source of the indexer, let the stamps become the
  coalescing key, and keep the guards of the ring.
- Acceptance: an observed write reaches the adapter of the graph, the guards still silence own-actor
  events, and the ledger strings stay unchanged.

### hook-dsh-workspace-operate (A)

- Now: the typed proposals, the full refusal vocabulary, the fence, and the tools.
- Target: the proposals feed the batch-edit machine through the caller-side wiring that the plan
  defers, and the policy allowlist decides auto versus approve per proposal kind.
- Acceptance: a proposal becomes a batch-edit process, and a refusal stays byte-exact.

### hook-dsh-workspace-govern (A)

- Now: the four independent means-checks, the fail-open and fail-closed table, and the loop guard.
- Target: the actions of the recovery table are wired to the journal and the merge, and the policy
  reads the section of the pack.
- Acceptance: each recovery row is exercised by a smoke, and the fail-open path never throws.

### plugin-dsh-workspace-authority (A)

- Now: the three records, the five dispositions, and the shields, in memory.
- Target: KV persistence through `ctx.storage`, a lease and residency that survive a restart, and
  eviction events on the trace.
- Acceptance: a restart preserves the records, and an expired lease evicts.

### hook-dsh-workspace-approve (A)

- Now: the exact-candidate bindings, the check chain, and the invalidation.
- Target: the bindings connect to the handoff of the batch decision, and an approval resolves the
  pending proposal in batchstate.
- Acceptance: an approved proposal becomes an applied batch, and a stale candidate is invalidated.

### hook-dsh-workspace-merge (A)

- Now: the gates, the commits, the CommitReply union, and the read-back.
- Target: the three-way merge that v4.1 defers as a later-stage item, and the policy allowlist that
  gates auto-merge.
- Acceptance: a two-parent merge commits, and a conflict refuses byte-exactly.

### hook-dsh-workspace-journal (A)

- Now: open, seal, revert, and recover, plus the reverse replay.
- Target: KV persistence, the trace that emits the pre-image events, and a revert that is reachable
  from the govern recovery table.
- Acceptance: a restart recovers an open journal, and a revert restores the pre-image.

### hook-dsh-workspace-audit (A)

- Now: the audit lines and the recursion-prevention fields.
- Target: the audit chain consumes the write events of the trace, and the sequence stays monotonic.
- Acceptance: the chain is gap-free under concurrent writes.

### plugin-dsh-workspace-context (A)

- Now: the eight-section packet, the budget clamp, and the lenses.
- Target: graph-relevance ranking of NEIGHBORS (D7), an EVIDENCE section of the packet that cites
  the fingerprints of the graph, and a trace that invalidates a stale packet.
- Acceptance: the packet ranks a near node above a far one, and a stale version sets the STALE line.

### hook-dsh-workspace-monitor (A)

- Now: the timerless watch, the sweep, and the classification.
- Target: the check sets come from the pack, the invalidation of the trace drives the sweep, and a
  watch survives a restart via KV.
- Acceptance: a check-set change fires once, and the sweep classifies correctly.

### plugin-dsh-workspace-evidence (A)

- Now: the four truth kinds, the invalidation, and the supersede.
- Target: the evidence objects carry the timestamps of the trace, and the invalidation consumes
  `graph/invalidated`.
- Acceptance: an invalidated evidence is superseded and is never silently kept.

### plugin-dsh-workspace-semantics (B - RE-SPEC CANDIDATE)

- Now: ONE lexical TypeScript adapter, dotted-word references that are not scope-resolved, and no
  injection of the service.
- Target: the other adapters (JSON, YAML, Markdown links, package.json dependency graph), the
  consumer wiring of the `references` edge of the graph and the rename of the reflect plugin, and
  the harness LSP/AST service when it is present, with the lexical adapter kept as the fallback.
- Acceptance: resolve, references, and rename on a fixture per adapter, and a consumer that receives
  the service.

### plugin-dsh-workspace-reflect (B - RE-SPEC CANDIDATE)

- Now: textual whole-word span replacement, with no AST engine and no block fingerprint targeting.
- Target: the AST-aware engine or the harness AST/LSP service, the block-fingerprint targeting, and
  the `Symbol` family of the edit suggester that feeds it.
- Acceptance: a rename rewrites only the intended span, and a block target resolves by fingerprint.

### lib-dsh-workspace-live (A)

- Now: the shared section and render library.
- Target: a renderer of the live view that consumes the trace, where the section types gain a live
  feed, and a library that stays harness-free.
- Acceptance: a render from a trace event is byte-stable.

### client-dsh-workspace-live (C - RE-SPEC CANDIDATE, wave 4)

- Now: the stable-until-event store and the tab contract, with nothing that feeds them.
- Target: ingest from the trace bus, a render of the stored tail, and the child-slot model.
- Acceptance: a live event renders in the tab.

## 4. The workspace family's acceptance gate

The family is complete when the trace round-trip works between the observe hook and the graph, the
graph answers the four tools over a real workspace, the pack layer supplies the indexer policy, and
every plan item of every package outside "later stage" is implemented with a smoke folder each.
