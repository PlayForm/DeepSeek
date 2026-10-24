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
> board, the guard, the routing, the queue, the feedback loop, the handoff and the pattern service.
> The user's automation decision (D6: per-plugin allowlists, fully automatic inside the policy)
> governs every "auto" below.

## 1. The policy block (D6)

Every package in this family gains a `policy` config block (schema + Interface + patch row + the
pack's `policy` section): one key per action the plugin can take, valued `auto` or `approve`.
Defaults:

| Action class                      | Default                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| read-only, index, record, suggest | auto                                                              |
| write a file, commit a batch      | approve (unless the path is inside the pack's `policy.autoPaths`) |
| spawn an agent, start a job       | approve                                                           |
| send a message to another agent   | auto inside the same session, approve across sessions             |

## 2. The per-package deltas

### plugin-dsh-batch-edit (A v1)

- Now: ranks 1-3 + 11 (the Process<File> machine, the 6 verbs, the op grammar + executor, the
  governed write path, the atomic gate, the deadline/jobs continuation, the capped-LCS preview).
- Target: rank 4 the undo journal (reuse hook-dsh-workspace-journal), rank 6 the live view (reuse
  the batchstate board + the client tab), rank 7 the confirmations (the approve binding), rank 9 the
  dependency edges (the batchstate queue projection), rank 10 the leases (the authority), rank 12
  the event sourcing (the trace bus), rank 14 the escape tracking (the tool-coach's counts); rank 5
  the review stage (preview -> review -> apply); rank 8 the monitors as real check sets; rank 13 the
  constraint + audit chain.
- Acceptance: one batch crosses every rank in a single smoke scenario; the ledger stays byte-exact.

### plugin-dsh-batchstate (B - RE-SPEC CANDIDATE)

- Now: the service + the compiled context + the JSON fallback; no inbox splice.
- Target: the inbox splice onto the harness agent-team inbox events (D5 trace adapter); the Gates
  block; the queue projection (the seats from plugin-dsh-queue); the templates; `ctx.storage`
  instead of the plain JSON file.
- Acceptance: a batch proposal reaches the board; the board survives a restart; the queue projection
  matches the queue's seats.

### plugin-dsh-gitguard (A)

- Now: the classifier + the deny/allow lists + the strict mode + the ledger.
- Target: the typed `tools/pre-execute` payload against the real dsh-tools shapes; the policy block
  (strict mode is `approve` for writes); the trace emits the denial.
- Acceptance: a denied git command is refused with the byte-exact line; a strict-mode allow is
  refused before the allow-list.

### plugin-dsh-route (A)

- Now: the resolver + the keyword classifier + the escalation + the silent injection.
- Target: the real launch seam (the subagent pre-execute fallback); the policy block (the route
  auto-injects only when the pack allows); the model catalog from `list_subagent_models`.
- Acceptance: a routed prompt injects the hint silently; an escalation marker routes to the ladder.

### plugin-dsh-queue (B - RE-SPEC CANDIDATE)

- Now: the seat/release + the deterministic schedule + the tools; assigns but never launches.
- Target: the SPAWN through the harness subagent service (never a private spawn); the idle-slot
  automation (a released seat pulls the next task); the restart reconcile; the policy block (spawn =
  approve unless the pack's policy says auto).
- Acceptance: a queued task actually starts a subagent; a restart reconciles the seats; the policy
  gate is proven both ways.

### plugin-dsh-feedback (A)

- Now: the inbox listener + Push + the journal + the summary.
- Target: the queue/batch integration (caller-side): a batch result feeds the feedback journal; the
  summary is a packet section; the trace emits the feedback.
- Acceptance: a batch outcome appears in the feedback summary; the journal survives a restart.

### plugin-dsh-pass-on (A)

- Now: the prepare/resolve/preview + the kinds.
- Target: the real batch-contract wiring (caller-side): a pass-on produces a batch proposal that
  batchstate can splice; the preview is the batch preview.
- Acceptance: a pass-on round-trips through the batch machine.

### plugin-dsh-ingester (A)

- Now: the validate/apply + the content fence.
- Target: the trace adapter consumes the batch decisions; the content fence covers the pack files;
  the policy block gates the apply.
- Acceptance: an ingested change is validated then applied; a fenced path refuses.

### plugin-dsh-pattern (A)

- Now: the match/record/decay + the JSON snapshot; ships disabled.
- Target: `ctx.storage` instead of the JSON snapshot; the offline session mining (a later stage, now
  reachable through the trace bus); the decision weights (D8) as the pattern service's data; the
  learning loop (the accepted/rejected suggestions feed `record`).
- Acceptance: a recorded pattern decays; a restart preserves the store; the suggester's weights come
  from the service.

### hook-dsh-batch-decision (A)

- Now: the conservative policy + the tool + the handoff.
- Target: the policy block (auto vs approve per batch kind); the handoff to batchstate's inbox; the
  expired-sweep (already fixed) stays.
- Acceptance: an auto-approved batch applies; an approval-required batch waits in the board.

## 3. The orchestration family's acceptance gate

The family is complete when: a batch can be proposed, queued, spawned, applied, journaled and
reverted in one live scenario; the queue actually starts a subagent; the board reflects every
transition; and the policy block gates each action class with a smoke per gate.
