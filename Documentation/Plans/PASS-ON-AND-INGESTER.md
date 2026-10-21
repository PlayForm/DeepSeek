---
title: The Pass-On and the Ingester - the batch decision flow
category: Plans
kind: queued-plan
date: 2026-10-21
status: planned
registry: Documentation/Plans/PASS-ON-AND-INGESTER.md
index: Documentation/INDEX.md
statuses:
  - name: the architectural decision (two directions plus a thin decision workflow)
    state: resolved
    evidence: this document - not one monolith; the batch is the shared contract
  - name: the batch contract (the proposal, the decision, the result)
    state: open
    evidence: section 2; the schema is proposed, not implemented
  - name: the pass-on (the prepare direction, read-only)
    state: open
    evidence: section 3
  - name: the ingester (the apply direction, the only writer)
    state: open
    evidence: section 4
  - name: the decision workflow and the live view
    state: open
    evidence: sections 5-6
  - name: the relation to the batch edit tool, the suggester, the workspace, and the panel
    state: resolved
    evidence: section 7
  - name: the phases P0-P6
    state: planned
    evidence: section 8
---

# The Pass-On and the Ingester

The search suggester proposes **what** to change; the pass-on turns that
into a prepared batch; the decision approves it; the ingester applies it;
the live view shows it. The question is whether this is one plugin or
several. This document decides: **the batch is the shared contract, the
pass-on and the ingester are its two directions, the decision is a thin
workflow plugin, and the live view is a panel section.** One monolith
would couple the knowledge, the proposal, the write path, and the UI in
one package - exactly the shape the family's atomization and the
workspace's governance rules reject.

## 1. The flow

```text
Suggester            Pass-On                 Decision              Ingester             Live View
(intent + targets) -> (batch proposal:     -> (approve/deny,   -> (apply per target, -> (panel section:
                       targets, operations,    auto-policy or       version-fenced,      state, preview,
                       preview, digest)       user)               journaled)           approve/deny)
```

The pass-on is the **outbound** direction: the suggestion (or a user
intent) becomes a batch proposal. The ingester is the **reverse**: the
approved batch becomes file operations. They share the batch contract and
nothing else. The decision is the gate between them; the live view is the
presentation.

## 2. The batch contract

The shared artifact, owned by the batch package (reusing the
Batch-Edit-Tool schema where it fits):

```text
BatchProposal = {
  id: string;                  // stable, content-derived
  intent: Searchable<X>;       // from the suggester, or a user intent
  targets: Target[];           // path, version, span, why
  operations: Operation[];     // the deterministic transforms per target
  preview: Preview;            // the rendered before/after, bounded
  digest: string;              // sha256(targets + operations + versions)
  revision: number;            // the batch's own revision
  expiresAt: number;
}

BatchDecision = {
  proposal: string;            // the id
  outcome: "approved" | "denied" | "expired";
  by: "user" | "policy";
  at: number;
}

BatchResult = {
  proposal: string;
  perTarget: { path, outcome: "applied" | "conflict" | "skipped" | "recovery-required", version }[];
  applied: number;
  conflicts: number;
  recovery: number;
}
```

The digest is the fence: the ingester applies only the proposal whose
digest and versions still match. A target edited between the preview and
the apply is a conflict, not a silent overwrite.

## 3. The pass-on (the prepare direction)

- **Read-only.** The pass-on never writes a file; it resolves the targets,
  computes the operations, renders the preview, and computes the digest.
- **Inputs**: a suggestion from the suggester, or a user/agent intent
  (e.g., "bump the version"), or a batch authored by hand.
- **Target resolution**: the intent's target subgraph (the standard files
  per intent), the current versions, the current content; each target
  carries its version and its reason.
- **Operation synthesis**: the deterministic transforms per intent
  (the version fields, the pins, the doc figures, the path strings); the
  operations are declarative, not executed.
- **Preview**: the bounded before/after per target (the diff, not the full
  files); the count of changes; the skipped targets and why.
- **Digest**: the content-derived id; the version snapshot.
- **Output**: the `BatchProposal`, handed to the decision; a ledger line
  for the proposal; nothing written.

The pass-on is where the suggester's **locate** result becomes a
**prepare** result. It is also where the abstention ends: if the proposal
is empty or ambiguous, the pass-on returns no batch, not an empty one.

## 4. The ingester (the apply direction)

- **The only writer.** The ingester is the batch's write path; it must go
  through the factory's write executor (`writeText(replaceIfVersion)` /
  the shared `Write`), the gate, and the journal.
- **Validation**: the decision is approved and unexpired; the proposal's
  digest matches; each target's version matches the observed version; the
  operations are within the approved set.
- **Apply**: per target, in the proposal's order; the version fence; the
  conflict on a mismatch; the journal record before and after; the
  ledger line per target.
- **Failure**: a conflict or a write failure stops at that target and
  reports `conflict` / `recovery-required`; the applied targets are
  reported honestly; no invisible intermediate state.
- **Output**: the `BatchResult`; the live view updates; the ledger
  records the outcome.

## 5. The decision workflow

- **The gate**: the `BatchProposal` -> the `BatchDecision`. The policy
  can auto-approve a bounded batch (a small target count, a high
  confidence, an allowlisted intent, a read-only preview), or require the
  user. The `ctx.approval` service is the policy surface; the batch's
  revision is the fence.
- **The plugin**: a thin `hook-dsh-batch-decision` that wires the
  suggester -> pass-on -> decision -> ingester -> live view, owns the
  workflow ledger, and exposes the one entry point the user interacts
  with. It does not implement the pass-on or the ingester; it calls them.
- **The auto-approve policy**: conservative by default - the user
  approves the first batch of an intent; the policy can learn the
  allowlist from the accepted batches; the write path is never
  auto-approved for a new intent class.

The "one decision plugin" is therefore real, but it is the **workflow
owner**, not the implementation. This is the family's pattern: the
factory owns the machinery, the modules own the leaves, the decision
plugin owns the loop.

## 6. The live view

- **The surface**: a panel section (`playform.panel.section` from the UI
  v4.1) - the batch state, the targets, the preview, the per-target
  progress, the approve/deny actions. A live-container block is the
  prompt-side complement for a model-driven batch.
- **The data**: the batch contract; the view is read-only except the
  approve/deny and the retry.
- **The states**: prepared, awaiting decision, applying, applied,
  conflict, recovery-required, denied, expired. The UI's error boundary
  and stale marker apply.
- **The performance**: the preview is bounded (the diff, not the files);
  the updates are event-driven (the batch's revision), not polled.

## 7. The relation to the existing plans

- **The search suggester** supplies the intent and the targets; the
  pass-on consumes its `Searchable<X>` result.
- **The batch edit tool** already owns the batch schema and the state
  machine; the pass-on/ingester reuse it rather than invent a second
  batch. The `batch_edit` tool remains the hand-authored entry; the
  pass-on is the suggestion-driven entry; the ingester is the shared
  apply.
- **The workspace v4.1** supplies the representation and the
  operate/merge semantics; the ingester is the workspace's operate leaf
  for the batch case.
- **The panel (UI v4.1)** supplies the live view; the batch section is a
  `playform.panel.section` contribution.
- **The pattern graph** supplies the intent->target patterns the pass-on
  resolves; the decision's allowlist is a pattern property.

## 8. The phases

| Phase | Work | Acceptance |
| --- | --- | --- |
| P0 | The batch contract + the pass-on + the preview | a proposal for the version-bump intent; the digest; no writes |
| P1 | The decision + the approval policy + the ledger | a batch approved/denied; the revision fence |
| P2 | The ingester + the version fence + the journal | a batch applied; a conflict; a recovery-required; the honest result |
| P3 | The live view (the panel section) | the batch state renders; approve/deny; the progress |
| P4 | The suggester integration | the suggester -> pass-on -> decision -> ingester loop |
| P5 | The auto-approve policy | the allowlist learned from accepted batches; the new-intent class still needs the user |
| P6 | The ETS parity + the docs | the twins; the site page |

## 9. The risks

1. **The duplicate batch**: a second batch schema beside the batch edit
   tool. Mitigate: reuse the tool's schema and state machine.
2. **The write trust**: the ingester is the only writer; the pass-on and
   the decision must never write. Mitigate: the type-only contract, the
   gate, the review.
3. **The auto-approve overreach**: a policy that approves too much.
   Mitigate: the conservative default, the intent-class rule, the
   ledger.
4. **The stale proposal**: a target edited between preview and apply.
   Mitigate: the digest + the version fence + the explicit conflict.
5. **The live view scope**: the panel becoming a mini-IDE. Mitigate: the
   batch section only; the read-only preview; the approve/deny.
6. **The one-decision-plugin temptation**: the workflow plugin growing
   into the implementation. Mitigate: the pass-on/ingester stay separate
   packages; the decision calls them.

## 10. The open decisions

1. The batch schema owner: the batch edit tool package, or a shared
   `lib-batch`.
2. The pass-on/ingester names and archetypes: `plugin-dsh-pass-on` +
   `plugin-dsh-ingester` (the primary names; the earlier "or hooks"
   alternative is superseded by the role contract - a prepared batch and
   its apply path are services, not event listeners).
3. The decision plugin: `hook-dsh-batch-decision`.
4. The live view: the panel section first, the live-container later (or
   both).
5. The auto-approve policy: the default allowlist and the first-batch
   rule.
6. The suggester integration: the pass-on consumes the suggestion
   directly, or through the pattern service.
