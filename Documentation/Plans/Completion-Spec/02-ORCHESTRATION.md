---
title: The completion spec - the orchestration family
category: Plans/Completion-Spec
kind: living-plan
date: 2026-10-23
status: active
registry: Documentation/Plans/Completion-Spec/02-ORCHESTRATION.md
index: Documentation/INDEX.md
statuses:
    - name: the orchestration family deltas
      state: draft
      evidence: the per-plugin sections below; the gap analysis rows
---

# THE COMPLETION SPEC - THE ORCHESTRATION FAMILY

> The 10 packages that turn the workspace into a working surface: the batch edit machine, the live
> board, the guard, the routing, the queue, the feedback loop, the handoff, and the pattern service.
> The automation decision of the user (D6: per-plugin allowlists, fully automatic inside the policy)
> governs every "auto" below.

## 1. The policy block (D6)

Every package in this family gains a `policy` config block, which holds the schema, the Interface,
the patch row, and the `policy` section of the pack.

The block has one key per action that the plugin can take, and each key is valued `auto` or
`approve`.

The defaults:

| Action class                      | Default                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| read-only, index, record, suggest | auto                                                              |
| write a file, commit a batch      | approve (unless the path is inside the pack's `policy.autoPaths`) |
| spawn an agent, start a job       | approve                                                           |
| send a message to another agent   | auto inside the same session, approve across sessions             |

## 2. The per-package deltas

### plugin-dsh-batch-edit (A v1)

- Now: ranks 1 to 3 and 11, which hold the Process<File> machine, the 6 verbs, the op grammar and
  its executor, the governed write path, the atomic gate, the deadline and jobs continuation, and
  the capped-LCS preview.
- Target: rank 4 the undo journal that reuses hook-dsh-workspace-journal, rank 6 the live view that
  reuses the batchstate board and the client tab, rank 7 the confirmations through the approve
  binding, rank 9 the dependency edges through the batchstate queue projection, rank 10 the leases
  through the authority, rank 12 the event sourcing through the trace bus, and rank 14 the escape
  tracking through the counts of the tool coach.
- Target: rank 5 the review stage (preview, review, apply), rank 8 the monitors as real check sets,
  and rank 13 the constraint and audit chain.
- Acceptance: one batch crosses every rank in a single smoke scenario, and the ledger stays
  byte-exact.

### plugin-dsh-batchstate (B - RE-SPEC CANDIDATE)

- Now: the service, the compiled context, and the JSON fallback, with no inbox splice.
- Target: the inbox splice onto the agent-team inbox events of the harness through the D5 trace
  adapter, the Gates block, the queue projection that takes the seats from plugin-dsh-queue, the
  templates, and `ctx.storage` instead of the plain JSON file.
- Acceptance: a batch proposal reaches the board, the board survives a restart, and the queue
  projection matches the seats of the queue.

### plugin-dsh-gitguard (A)

- Now: the classifier, the deny and allow lists, the strict mode, and the ledger.
- Target: the typed `tools/pre-execute` payload against the real dsh-tools shapes, the policy block
  where strict mode is `approve` for writes, and a trace that emits the denial.
- Acceptance: a denied git command is refused with the byte-exact line, and a strict-mode allow is
  refused before the allow-list.

### plugin-dsh-route (A)

- Now: the resolver, the keyword classifier, the escalation, and the silent injection.
- Target: the real launch seam through the subagent pre-execute fallback, the policy block that
  auto-injects the route only when the pack allows it, and the model catalog from
  `list_subagent_models`.
- Acceptance: a routed prompt injects the hint silently, and an escalation marker routes to the
  ladder.

### plugin-dsh-queue (B - RE-SPEC CANDIDATE)

- Now: the seat and release operations, the deterministic schedule, and the tools, which assign but
  never launch.
- Target: the SPAWN through the subagent service of the harness and never a private spawn, the
  idle-slot automation where a released seat pulls the next task, the restart reconcile, and the
  policy block where a spawn needs approval unless the pack says auto.
- Acceptance: a queued task actually starts a subagent, a restart reconciles the seats, and the
  policy gate is proven both ways.

### plugin-dsh-feedback (A)

- Now: the inbox listener, Push, the journal, and the summary.
- Target: the caller-side queue and batch integration where a batch result feeds the feedback
  journal, the summary as a packet section, and a trace that emits the feedback.
- Acceptance: a batch outcome appears in the feedback summary, and the journal survives a restart.

### plugin-dsh-pass-on (A)

- Now: the prepare, resolve, and preview operations, plus the kinds.
- Target: the real caller-side batch-contract wiring where a pass-on produces a batch proposal that
  batchstate can splice, and a preview that is the batch preview.
- Acceptance: a pass-on round-trips through the batch machine.

### plugin-dsh-ingester (A)

- Now: the validate and apply operations, plus the content fence.
- Target: a trace adapter that consumes the batch decisions, a content fence that covers the pack
  files, and a policy block that gates the apply.
- Acceptance: an ingested change is validated and then applied, and a fenced path refuses.

### plugin-dsh-pattern (A)

- Now: the match, record, and decay operations, plus the JSON snapshot, and the plugin ships
  disabled.
- Target: `ctx.storage` instead of the JSON snapshot, the offline session mining as a later stage
  that the trace bus now makes reachable, the decision weights (D8) as data of the pattern service,
  and the learning loop where the accepted and rejected suggestions feed `record`.
- Acceptance: a recorded pattern decays, a restart preserves the store, and the weights of the
  suggester come from the service.

### hook-dsh-batch-decision (A)

- Now: the conservative policy, the tool, and the handoff.
- Target: the policy block that decides auto versus approve per batch kind, the handoff to the inbox
  of batchstate, and the expired sweep that is already fixed.
- Acceptance: an auto-approved batch applies, and an approval-required batch waits in the board.

## 3. The orchestration family's acceptance gate

The family is complete when a batch can be proposed, queued, spawned, applied, journaled, and
reverted in one live scenario, the queue actually starts a subagent, the board reflects every
transition, and the policy block gates each action class with a smoke per gate.
