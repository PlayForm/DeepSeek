---
name: orchestrator-batch
description: "The parent's batch orchestration: the incremental delegation loop, two-active queue regime, no-blocking-wait law, information-broker protocol, spec-reconfiguration authority, idle-amendment law, verification by the lanes' arbiters, report-as-claim rule, and resume protocol."
whenToUse: When running a multi-agent batch in this repository, when deciding lane order or concurrency, when user feedback amends a lane's spec, when a lane needs recorded history from earlier sessions, or when resuming a batch in a new session.
version: 2.4.0
updated: 2026-10-25
---

# Orchestrator Batch

The parent's discipline for running several lanes without losing control of the tree. The core
split: the lanes execute and verify their own work; the parent formalizes, dispatches, relays, and
spot-checks read-only.

## When to use

- A request that lands as several delegated tasks (site work, docs, corrections, scans).
- The user asks to launch, pause, re-pause, or amend an idle lane.
- A batch resumes in a new session.
- Do not use for: a single delegation (`worker-strains`), the child's idle contract
  (`idle-agent-protocol`), or the route itself (`task-routing`).

## The loop

1. **Receive** the request as it arrives.
2. **Formalize** the brief: scope, surface, exclusions, sequence, arbiter, report format, shared
   facts.
3. **Pick the strain and the route** (`worker-strains`, `task-routing`).
4. **Delegate**: an active lane, or an idle lane with a retained spec.
5. **Continue** the parent's own next unit of work. The lanes are NOT monitored: each report arrives
   as a message, and the queue is read only when the parent has a reason to act (the
   no-blocking-wait law).
6. **Verify** the lanes' printed arbiter results, grep the artifact for every remediation the report
   claims, and run only read-only spot checks yourself.
7. **Report** results, residuals, decisions, and READY-TO-COMMIT.
8. **Pair the record** (`worker-strains`, rule 8) in the slot the lane vacated.

## The two-active regime

- Exactly two lanes are active at any moment; all others are paused with retained specs. The cap is
  the API throttle, not a preference.
- The next pair releases only when the current pair has delivered both reports.
- Every feedback delivery pauses the receiving lane first. It executes only when its slot opens.
- An amendment ACK is not work. A lane that stops at the ACK gets a "CONTINUE + deliver the report"
  nudge.
- "RE-PAUSE" stops all work now; partial state persists for the resume.

## The no-blocking-wait law

A delegated lane is never waited on. It runs, finishes, and reports; the report arrives as a
message. The parent does not call `wait_agent`, sleep, or poll the task board.

- Inactivity is not a result: it says nothing about success, failure, or progress.
- The parent's next action after a dispatch is its own next unit of work. If none is left, it
  reports progress to the user and ends its turn.
- The board is read when the parent has a reason to act, never on a timer.
- **No progress inspection.** The parent does not `ls`, `git status`, `find`, or read a lane's
  output path to learn whether the lane started. That is the same wait in a different coat: it costs
  a turn, returns no result, and reads as stress. The report is the only progress signal.
- **The user's stop ends the batch.** When the user says stop waiting and execute, the batch is
  over: `interrupt_agent` every running lane, message each one "STAND DOWN - do not write", check
  the tree ONCE at the takeover, and then do the work. Never monitor a handover.
- The incident that made this a law is recorded in `references/queue.md`. The second incident, on 25
  October 2026, is recorded here: the Lead dispatched three lanes, then called `wait_agent` twice
  and inspected the lanes' output paths between waits while its own code work sat undone; the user
  stopped it with "STOP WAITING FOR AGENTS". Stage 5 ("Monitor") licensed that shape; it is now
  "Continue".

## The information broker

A lane cannot ask the parent a question mid-flight: a subagent has no addressable mailbox in this
harness (`send_message` rejects it), and it does not wait. Recorded history reaches a lane only
through the parent, in two forms:

- **Pre-supply** in the brief: the facts the lane will need from prior sessions, the ledgers, or
  earlier agent attempts, with their coordinates.
- **On a reported NEED**: pull the exact slice from the session corpus with the session tools
  (`session_search`, `session_event_search`, `session_trace`, `session_event_read`) - never a whole
  corpus read, never a guess.

Shape the slice with a reformatter lane when the requester needs a specific form (a table, a
timeline, a diff of what changed), verify the shaped output against the slice, then re-dispatch the
requester with the shaped data as a continuation lane. A NEED report is not a failure and not a
stall: it is a request the parent answers with a new dispatch.

The broker never edits the requester's files and never paraphrases a record: the shaped data keeps
its coordinates.

When a lane is expected to need mid-flight steering or a decision, spawn it as a durable teammate
(`spawn_teammate`), which has an addressable mailbox; reserve `subagent` lanes for work that cannot
be interrupted. A subagent lane that asks a question has already lost: it waits for an answer that
cannot arrive, and the parent must re-dispatch a continuation that redoes part of its work.

## Spec reconfiguration

The parent may amend an idle lane's spec ("SPEC AMENDED - IDLE"), amend a working lane mid-flight
only when the change is compatible, re-apply changed requirements to lanes that have not started,
and re-dispatch a failed lane. Amendments override the base spec where they conflict.

**The idle-amendment law:** a new idea, suggestion, or improvement never amends a working lane
mid-flight. It becomes a new idle lane, and the improvement folds into a later dispatch. Working
lanes finish against the spec they started with.

**The moving-law case:** when the parent edits a law file that a working lane is reading, the lane
must re-read it and may align its own output. On 21 October 2026 a lane detected that the standard
changed under it, did not claim the parent's edit as its own, re-read the law, and aligned two of
its files. That is correct behaviour, not drift.

## Verification and the non-execution law

- Each lane runs its own arbiter and reports the printed numbers. The counts live in
  `smoke-writing`, not here.
- The parent does not execute the project: no builds, no site edits, no measurement runs, no
  pre-investigation of feedback surfaces.
- The parent's hands-on work is limited to relaying feedback verbatim, keeping the records, and
  read-only spot checks over committed or built output.
- Printed totals beat prose. A claim that contradicts the printed result is wrong.
- **A report is a claim, not evidence.** Before accepting, grep the artifact for every remediation
  the report claims. On 21 October 2026 a lane reported that its workflow used a command that
  appeared nowhere in the tree; the sentence read as "already handled" and was false twice over.
- **Coverage is a fraction, never a boolean.** A reviewer prints `covered N of M` and prints partial
  as partial. A reviewer that can only report "done" will report done.
- **A report without a state transition is an unfinished task.** If a lane reports and its task is
  still open, close it as Lead when the owner is inactive, then dispatch its record lane.

## Resume

The durable record is `Documentation/Plans/` (the active plan and the process record), not a handoff
file. Handoff documents are temporary and may be erased at the session's close. On resume:

1. Read the active plan and the queue record.
2. Check the tree state in the root and in `Site/`.
3. Re-verify every count before repeating it.
4. Re-read the owner skill for any law that changed.

## Decision table

| Situation                                  | Action                                               |
| ------------------------------------------ | ---------------------------------------------------- |
| More than two lanes ready                  | Seat the rest idle; release as a pair                |
| Feedback for a working lane                | Pause first, then attach the amendment               |
| A new idea mid-batch                       | New idle lane, not a mid-flight amendment            |
| A report claims a fix                      | Grep the artifact before accepting it                |
| A lane reports with its task still open    | Close it as Lead if the owner is inactive            |
| The parent edits a law mid-batch           | Expect working lanes to re-read and align            |
| A lane reports a NEED for recorded history | Pull the exact slice, shape it, re-dispatch the lane |
| A subagent must be steered mid-run         | It cannot be; amend the spec and re-dispatch         |
| A lane stalls                              | Nudge with its last verified checkpoint              |
| A lane is running and no own work is left  | Report progress and stop; never wait or poll         |
| A lane fails                               | Verify the tree, then re-dispatch with the fix       |
| The pair finishes                          | Release the next pair only after both reports        |
| A resumed session                          | Read the plan and the queue, re-verify counts        |

## Verification

- The queue record shows at most two active lanes at every point.
- Every feedback delivery shows the pause before the amendment.
- Every relayed report cites printed totals.
- Every accepted report has at least one claimed remediation grepped against the artifact.
- No build, edit, or measurement run appears under the parent's name.
- No blocking wait, sleep, or polling loop appears after a dispatch; the parent's turn ends with its
  own work or a progress report.
- No progress inspection of a lane's output appears after a dispatch: no `ls`, `git status`, `find`,
  or read of the lane's target path until its report arrives (or the user's stop triggers the
  one-time takeover check).
- Every NEED report is answered with a shaped slice that keeps its coordinates, or is recorded as
  unresolved.
- The resume starts from the durable plan, not from a deleted handoff.

## Anti-patterns

| Mistake                                  | Cost                                               | Do instead                                   |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| Activating a third lane "because small"  | API-limit errors multiply; the batch slows         | Hold the two-active cap                      |
| Releasing the next pair early            | Overlapping surfaces and interleaved reports       | Wait for both reports                        |
| Feedback without the pause               | The lane builds on a spec about to change          | Pause, amend, execute at ACTIVATE            |
| Amending a working lane with a new idea  | Rework and a lost spec boundary                    | New idle lane                                |
| Paraphrasing feedback                    | The lane fixes something the user did not say      | Relay verbatim                               |
| Accepting prose "all pass"               | A broken tree reported as done                     | Read the printed totals                      |
| Accepting a claimed remediation          | A phantom fix enters the record                    | Grep the artifact for it                     |
| Reporting coverage as a boolean          | A partial record reads as complete                 | Print `covered N of M`                       |
| Messaging a subagent mid-run             | The harness has no mailbox; the call fails         | Pre-supply in the brief, or re-dispatch      |
| `wait_agent` after a dispatch            | Costs a turn, adds no information, reads as stress | Do the parent's own work; the report arrives |
| `ls`/`git status` on a lane's output     | The same wait in a different coat; no result       | Continue your own work; the report arrives   |
| Monitoring a handover after a stand-down | The takeover is one check, not a watch             | Interrupt, stand down, check once, execute   |

## References

| File                                       | Covers                                                  | Read when                          |
| ------------------------------------------ | ------------------------------------------------------- | ---------------------------------- |
| `references/loop.md`                       | The seven stages, formalization, and the report shape   | Running or reviewing a batch       |
| `references/queue.md`                      | Two-active, pair release, ack trap, re-pause, stalls    | Managing active and idle lanes     |
| `references/verification.md`               | The lanes' arbiters, the non-execution law, spot checks | Verifying a report                 |
| `references/reconfiguration-and-resume.md` | Spec amendments, the idle-amendment law, the resume     | Feedback arrives, or a new session |
