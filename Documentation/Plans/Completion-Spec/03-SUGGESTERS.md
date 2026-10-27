---
title: The completion spec - the suggesters and the decision layer
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/03-SUGGESTERS.md
index: Documentation/INDEX.md
statuses:
    - name: the suggester deltas
      state: draft
      evidence: the per-package sections below; wave 0 landed (the gate + the base-aware filter)
---

# THE COMPLETION SPEC - THE SUGGESTERS AND THE DECISION LAYER

> The seven hooks that speak to the model, the relevance and decision layer that ranks and gates
> them, and the packs that make them per-workspace. Wave 0 already landed: the workspace signature
> gate, the base-aware existence filter, the `foreign-workspace` and `no-companions` abstentions,
> the headless log paths, and the `~` expansion.

## 1. The shared contract (already landed, do not regress)

- The gate sends no note outside a workspace that carries the `signature` of the pack, and it
  ledgers the abstention.
- The filter keeps a companion if and only if the companion exists under the repo root, the package
  root, or the package parent, and `<...>` placeholders and the replay history are exempt.
- The delivery (D9) sends one note per family and at most three per turn per agent, and every knob
  is configurable.
- The ledger vocabulary is byte-exact, and new reasons are documented in SCHEME and the README.

## 2. The relevance and decision layer (D7, D8)

The new shared modules live in one consumer package each until the core extraction, and then in
`lib-dsh-suggest`:

- `Rank.ts`: the score is the graph distance from the `neighborhood` of the graph service plus the
  prior, the recency, and the learned accept rate. It is deterministic and uses no LLM.
- `Decide.ts`: the table of pickable heuristics (`scope`, `graph`, `literal`, `history`, `accept`)
  with their weights, where every decision records `{ heuristic, weight, value, outcome }` for later
  learning.
- `Incept.ts` is an optional add-on that is off by default. The AI inception is a CONFIGURABLE
  PROVIDER CHAIN (D7), where the own LLM call of the harness is the first rung, an external provider
  is the next, then the profile-level override, and then a local-first-model option, and the chain
  is extendable and may hook back into the task routing. The answer enters as candidates and never
  as an emission.
- `Learn.ts`: the accepted or rejected outcome of every note feeds the pattern service, and the
  weights are read back on load and persisted through `ctx.storage` in wave 3.
- Acceptance: the ranking of a note is reproducible from the recorded decision, the learned weights
  move a threshold across a fixture, and the inception is provably off unless it is configured.

## 3. The per-package deltas

### hook-dsh-search-suggester (B - RE-SPEC CANDIDATE)

- Now: the 10 intents, the sigmoid and gate algebra, the sticky section, the online learning with
  atomic 0600, and the workspace gate.
- Target: the P2 generated repo index becomes a GRAPH PROJECTION, where the graph supersedes the
  hand-generated index, the offline seed comes from the own history of the repo, the replay
  benchmark, the `dismiss` tool, the six missing suites, and the families of the pack that replace
  the embedded intents.
- Acceptance: the benchmark prints the precision and recall delta, a dismissed suggestion is not
  repeated, and the sticky section is gated like the note.

### hook-dsh-edit-suggester (B)

- Now: the 7 conventions, the notes, the gate, and the base-aware filter.
- Target: the learning and persistence layer with the decision records and the accept rate, the
  graph relevance where the `Symbol` family ranks the test and the doc by graph distance, and the
  pack source.
- Acceptance: an accepted note raises the rank of its companion on the next call, a rejected note
  lowers it, and the persistence survives a restart.

### hook-dsh-doc-suggester (B)

- Now: the 7 doc families, the notes, the gate, and the filter, as the reference implementation.
- Target: the same learning layer, the pack extraction, an Index family that reads the real
  Documentation/INDEX.md row instead of the static companion, and a Site family that reads the site
  tree.
- Acceptance: the INDEX-row companion is derived from the actual index file, and the learning moves
  a threshold.

### hook-dsh-convention-suggester (C - RE-SPEC CANDIDATE)

- Now: the gate and the notes, while the defining mechanism of the plan, the convention compiler, is
  absent.
- Target (proposed re-spec): the PACK LEARNER, which reads the index of the repo
  (Documentation/INDEX.md, the package layout, and the observed edits) and PROPOSES the pack of the
  repo, then refines the pack from the accepted suggestions, and never writes a pack silently.
- Acceptance: a bootstrap on a fixture repo proposes a pack that reproduces the notes of the
  built-in pack, and an accepted suggestion moves the weight of one companion.

### hook-dsh-graph-suggester (B)

- Now: the service inject and the neighborhood query, with the real-graph folder landed.
- Target: the graph relevance that drives the candidate order, a trace that invalidates a stale
  neighborhood, and a policy that gates the note.
- Acceptance: the component of the real graph becomes the note (landed), and a stale graph
  re-queries.

### hook-dsh-replay-suggester (C - RE-SPEC CANDIDATE)

- Now: the recall reader, where the store has no producer and the recall is always empty.
- Target (proposed re-spec): the recall store is FED BY THE TRACE BUS from the session history, the
  accepted notes, and the pre-images of the journal, the recall ranks by recency and outcome, and
  the note names the recalled companions.
- Acceptance: the history of a session produces a recall, the note cites the recall, and an empty
  store abstains honestly.

### hook-dsh-test-suggester (C)

- Now: 2 intents and the note path, with no reconciliation and no learning.
- Target: the reconciliation against the `Test` nodes of the graph and the smoke READMEs, read-only,
  plus the learning layer and the pack source.
- Acceptance: a missing smoke folder is named, a count drift is detected, and the reconciliation
  never writes.

## 4. The suggesters' acceptance gate

The family is complete when every note is pack-driven and gate-protected, every note carries a
recorded decision, the learned weights persist and move a threshold in a smoke, the four re-specs
(convention learner, replay trace feed, search graph index, test reconciliation) are landed or
explicitly deferred by the user, and the delivery budget is enforced with a smoke.
