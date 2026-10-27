---
title: The Pass-On and the Ingester - the batch decision flow
category: Plans
kind: queued-plan
date: 2026-10-21
status: implemented (PoC)
registry: Documentation/Plans/PASS-ON-AND-INGESTER.md
index: Documentation/INDEX.md
statuses:
    - name: the architectural decision (two directions plus a thin decision workflow)
      state: resolved
      evidence: this document - not one monolith; the batch is the shared contract
    - name: the batch contract (the proposal, the decision, the result)
      state: implemented (PoC)
      evidence:
          plugin-dsh-pass-on + plugin-dsh-ingester + hook-dsh-batch-decision under
          Classic/packages/; the PoC-vs-plan grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the pass-on (the prepare direction, read-only)
      state: implemented (PoC)
      evidence: plugin-dsh-pass-on; the grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the ingester (the apply direction, the only writer)
      state: implemented (PoC)
      evidence: plugin-dsh-ingester; the grades in Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the decision workflow and the live view
      state: implemented (PoC)
      evidence:
          hook-dsh-batch-decision + plugin-dsh-batchstate; the grades in
          Documentation/Reports/POC-GAP-ANALYSIS.md
    - name: the relation to the batch edit tool, the suggester, the workspace, and the panel
      state: resolved
      evidence: section 7
    - name: the phases P0-P6
      state: planned
      evidence: section 8
---

# The Pass-On and the Ingester

The search suggester proposes **what** to change, the pass-on turns that into a prepared batch, the
decision approves it, the ingester applies it, and the live view shows it.

The question is whether this is one plugin or several.

This document decides: **the batch is the shared contract, the pass-on and the ingester are its two
directions, the decision is a thin workflow plugin, and the live view is a panel section.**

One monolith would couple the knowledge, the proposal, the write path, and the UI in one package,
which is exactly the shape that the atomization of the family and the governance rules of the
workspace reject.

## 1. The flow

```text
Suggester            Pass-On                 Decision              Ingester             Live View
(intent + targets) -> (batch proposal:     -> (approve/deny,   -> (apply per target, -> (panel section:
                       targets, operations,    auto-policy or       version-fenced,      state, preview,
                       preview, digest)       user)               journaled)           approve/deny)
```

The pass-on is the **outbound** direction, where the suggestion or a user intent becomes a batch
proposal.

The ingester is the **reverse**, where the approved batch becomes file operations.

They share the batch contract and nothing else, the decision is the gate between them, and the live
view is the presentation.

## 2. The batch contract

The shared artifact is owned by the batch package, and it reuses the Batch-Edit-Tool schema where
that schema fits:

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

The digest is the fence, because the ingester applies only the proposal whose digest and versions
still match.

A target that is edited between the preview and the apply is a conflict and not a silent overwrite.

## 3. The pass-on (the prepare direction)

- **Read-only.** The pass-on never writes a file, and it resolves the targets, computes the
  operations, renders the preview, and computes the digest.
- **Inputs**: a suggestion from the suggester, a user or agent intent such as "bump the version", or
  a batch authored by hand.
- **Target resolution**: the target subgraph of the intent with the standard files per intent, the
  current versions, and the current content, where each target carries its version and its reason.
- **Operation synthesis**: the deterministic transforms per intent for the version fields, the pins,
  the doc figures, and the path strings, where the operations are declarative and not executed.
- **Preview**: the bounded before and after per target as the diff and not the full files, the count
  of changes, and the skipped targets with their reason.
- **Digest**: the content-derived id and the version snapshot.
- **Output**: the `BatchProposal` handed to the decision, a ledger line for the proposal, and
  nothing written.

The pass-on is where the **locate** result of the suggester becomes a **prepare** result, and it is
also where the abstention ends, because an empty or ambiguous proposal returns no batch and not an
empty one.

## 4. The ingester (the apply direction)

- **The only writer.** The ingester is the write path of the batch, and it must go through the write
  executor of the factory (`writeText(replaceIfVersion)` or the shared `Write`), the gate, and the
  journal.
- **Validation**: the decision is approved and unexpired, the digest of the proposal matches, the
  version of each target matches the observed version, and the operations are within the approved
  set.
- **Apply**: per target and in the order of the proposal, with the version fence, the conflict on a
  mismatch, the journal record before and after, and the ledger line per target.
- **Failure**: a conflict or a write failure stops at that target and reports `conflict` or
  `recovery-required`, the applied targets are reported honestly, and no invisible intermediate
  state remains.
- **Output**: the `BatchResult`, an update of the live view, and the ledger record of the outcome.

## 5. The decision workflow

- **The gate**: the `BatchProposal` becomes the `BatchDecision`, where the policy can auto-approve a
  bounded batch with a small target count, a high confidence, an allowlisted intent, and a read-only
  preview, or require the user. The `ctx.approval` service is the policy surface, and the revision
  of the batch is the fence.
- **The plugin**: a thin `hook-dsh-batch-decision` that wires the suggester, the pass-on, the
  decision, the ingester, and the live view, owns the workflow ledger, and exposes the one entry
  point that the user interacts with. It does not implement the pass-on or the ingester, and it
  calls them.
- **The auto-approve policy**: conservative by default, where the user approves the first batch of
  an intent, the policy can learn the allowlist from the accepted batches, and the write path is
  never auto-approved for a new intent class.

The "one decision plugin" is therefore real, but it is the **workflow owner** and not the
implementation, which is the pattern of the family: the factory owns the machinery, the modules own
the leaves, and the decision plugin owns the loop.

## 6. The live view

- **The surface**: a panel section (`playform.panel.section` from the UI v4.1) with the batch state,
  the targets, the preview, the per-target progress, and the approve and deny actions, where a
  live-container block is the prompt-side complement for a model-driven batch.
- **The data**: the batch contract, where the view is read-only except for the approve, deny, and
  retry actions.
- **The states**: prepared, awaiting decision, applying, applied, conflict, recovery-required,
  denied, and expired, where the error boundary and the stale marker of the UI apply.
- **The performance**: the preview is bounded to the diff and not the files, and the updates are
  event-driven by the revision of the batch and not polled.

## 7. The relation to the existing plans

- **The search suggester** supplies the intent and the targets, and the pass-on consumes its
  `Searchable<X>` result.
- **The batch edit tool** already owns the batch schema and the state machine, so the pass-on and
  the ingester reuse it rather than invent a second batch. The `batch_edit` tool remains the
  hand-authored entry, the pass-on is the suggestion-driven entry, and the ingester is the shared
  apply.
- **The workspace v4.1** supplies the representation and the operate and merge semantics, and the
  ingester is the operate leaf of the workspace for the batch case.
- **The panel (UI v4.1)** supplies the live view, and the batch section is a
  `playform.panel.section` contribution.
- **The pattern graph** supplies the intent-to-target patterns that the pass-on resolves, and the
  allowlist of the decision is a property of a pattern.

## 8. The phases

| Phase | Work                                            | Acceptance                                                                             |
| ----- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| P0    | The batch contract + the pass-on + the preview  | a proposal for the version-bump intent; the digest; no writes                          |
| P1    | The decision + the approval policy + the ledger | a batch approved/denied; the revision fence                                            |
| P2    | The ingester + the version fence + the journal  | a batch applied; a conflict; a recovery-required; the honest result                    |
| P3    | The live view (the panel section)               | the batch state renders; approve/deny; the progress                                    |
| P4    | The suggester integration                       | the suggester -> pass-on -> decision -> ingester loop                                  |
| P5    | The auto-approve policy                         | the allowlist learned from accepted batches; the new-intent class still needs the user |
| P6    | The ETS parity + the docs                       | the twins; the site page                                                               |

## 9. The risks

1. **The duplicate batch.**

    A second batch schema sits beside the batch edit tool, and the mitigation is to reuse the schema
    and the state machine of the tool.

2. **The write trust.**

    The ingester is the only writer, and the pass-on and the decision must never write, so the
    mitigation is the type-only contract, the gate, and the review.

3. **The auto-approve overreach.**

    A policy that approves too much, and the mitigation is the conservative default, the
    intent-class rule, and the ledger.

4. **The stale proposal.**

    A target is edited between the preview and the apply, and the mitigation is the digest, the
    version fence, and the explicit conflict.

5. **The live view scope.**

    The panel could become a mini-IDE, and the mitigation is the batch section only, the read-only
    preview, and the approve and deny actions.

6. **The one-decision-plugin temptation.**

    The workflow plugin could grow into the implementation, and the mitigation is that the pass-on
    and the ingester stay separate packages while the decision calls them.

## 10. The open decisions

1. **The batch schema owner.**

    The batch edit tool package, or a shared `lib-batch`.

2. **The pass-on and ingester names and archetypes.**

    `plugin-dsh-pass-on` and `plugin-dsh-ingester` are the primary names, and the earlier "or hooks"
    alternative is superseded by the role contract, because a prepared batch and its apply path are
    services and not event listeners.

3. **The decision plugin.**

    `hook-dsh-batch-decision`.

4. **The live view.**

    The panel section first and the live-container later, or both.

5. **The auto-approve policy.**

    The default allowlist and the first-batch rule.

6. **The suggester integration.**

    The pass-on consumes the suggestion directly, or through the pattern service.
