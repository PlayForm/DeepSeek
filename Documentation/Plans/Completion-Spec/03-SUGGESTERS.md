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
> gate, the base-aware existence filter, the `foreign-workspace`/`no-companions` abstentions, the
> headless log paths, and the `~` expansion.

## 1. The shared contract (already landed, do not regress)

- The gate: no note outside a workspace carrying the pack's `signature`; the abstention is ledgered.
- The filter: a companion is kept iff it exists under the repo root, the package root or the package
  parent; `<...>` placeholders and the replay history are exempt.
- The delivery (D9): one note per family, at most three per turn per agent, every knob configurable.
- The ledger vocabulary is byte-exact; new reasons are documented in SCHEME + README.

## 2. The relevance and decision layer (D7, D8)

New shared modules (one per consumer package until the core extraction, then `lib-dsh-suggest`):

- `Rank.ts`: score = graph distance (the `neighborhood` from the graph service) + prior + recency +
  the learned accept rate. Deterministic; no LLM.
- `Decide.ts`: the pickable heuristics table (`scope`, `graph`, `literal`, `history`, `accept`) with
  weights; every decision records `{ heuristic, weight, value, outcome }` for later learning.
- `Incept.ts` (optional add-on, off by default): the AI inception is a CONFIGURABLE PROVIDER CHAIN
  (D7) - the harness's own LLM call is the first rung, an external provider the next, then the
  profile-level override, and a local-first-model option; the chain is extendable and may hook back
  into the task routing. The answer enters as candidates, never as an emission.
- `Learn.ts`: the accepted/rejected outcome of every note feeds the pattern service; the weights are
  read back on load (persisted through `ctx.storage` in wave 3).
- Acceptance: a note's ranking is reproducible from the recorded decision; the learned weights move
  a threshold across a fixture; the inception is provably off unless configured.

## 3. The per-package deltas

### hook-dsh-search-suggester (B - RE-SPEC CANDIDATE)

- Now: the 10 intents, the sigmoid/gate algebra, the sticky section, the online learning (atomic
  0600), the workspace gate.
- Target: the P2 generated repo index becomes a GRAPH PROJECTION (the graph supersedes the hand
  generated index); the offline seed from the repo's own history; the replay benchmark; the
  `dismiss` tool; the six missing suites; the pack's families replace the embedded intents.
- Acceptance: the benchmark prints the precision/recall delta; a dismissed suggestion is not
  repeated; the sticky section is gated like the note.

### hook-dsh-edit-suggester (B)

- Now: the 7 conventions, the notes, the gate, the base-aware filter.
- Target: the learning/persistence layer (the decision records + the accept rate); the graph
  relevance (the `Symbol` family ranks the test and the doc by graph distance); the pack source.
- Acceptance: an accepted note raises its companion's rank on the next call; a rejected one lowers
  it; the persistence survives a restart.

### hook-dsh-doc-suggester (B)

- Now: the 7 doc families, the notes, the gate, the filter; the reference implementation.
- Target: the same learning layer; the pack extraction; the Index family reads the real
  Documentation/INDEX.md row instead of the static companion; the Site family reads the site tree.
- Acceptance: the INDEX-row companion is derived from the actual index file; the learning moves a
  threshold.

### hook-dsh-convention-suggester (C - RE-SPEC CANDIDATE)

- Now: the gate + the notes; the plan's defining mechanism (the convention compiler) is absent.
- Target (proposed re-spec): the PACK LEARNER - it reads the repo's index (Documentation/INDEX.md,
  the package layout, the observed edits) and PROPOSES the repo's pack; it refines the pack from the
  accepted suggestions; it never writes a pack silently.
- Acceptance: a bootstrap on a fixture repo proposes a pack that reproduces the built-in pack's
  notes; an accepted suggestion moves one companion's weight.

### hook-dsh-graph-suggester (B)

- Now: the service inject + the neighborhood query; the real-graph folder landed.
- Target: the graph relevance drives the candidate order; the trace invalidates a stale
  neighborhood; the policy gates the note.
- Acceptance: the real graph's component becomes the note (landed); a stale graph re-queries.

### hook-dsh-replay-suggester (C - RE-SPEC CANDIDATE)

- Now: the recall reader; the store has no producer, so recall is always empty.
- Target (proposed re-spec): the recall store is FED BY THE TRACE BUS (session history + accepted
  notes + the journal's pre-images); the recall ranks by recency and outcome; the note names the
  recalled companions.
- Acceptance: a session's history produces a recall; the note cites the recall; an empty store
  abstains honestly.

### hook-dsh-test-suggester (C)

- Now: 2 intents + the note path; no reconciliation, no learning.
- Target: the reconciliation against the graph's `Test` nodes + the smoke READMEs (read-only); the
  learning layer; the pack source.
- Acceptance: a missing smoke folder is named; a count drift is detected; the reconciliation never
  writes.

## 4. The suggesters' acceptance gate

The family is complete when: every note is pack-driven and gate-protected; every note carries a
recorded decision; the learned weights persist and move a threshold in a smoke; the four re-specs
(convention learner, replay trace feed, search graph index, test reconciliation) are either landed
or explicitly deferred by the user; and the delivery budget is enforced with a smoke.
