---
name: orchestrator-batch
description:
    "The parent's batch orchestration: the incremental delegation loop, the two-active queue regime,
    the no-blocking-wait law, the information-broker protocol, the spec-reconfiguration authority,
    the idle-amendment law, verification by the lanes' arbiters, the result-as-claim rule, and the
    resume protocol."
whenToUse:
    When running a multi-agent batch here, deciding lane order or concurrency, when user feedback
    amends a lane's spec, when a lane needs history from earlier sessions, or when resuming a batch
    in a new session.
version: 3.1.0
updated: 2026-10-28
---

# Orchestrator Batch

The parent's discipline for running several lanes without losing control of the tree.

The core split: the lanes execute and verify their own work; the parent formalizes, dispatches,
relays, and spot-checks read-only.

The parent does not become a second coder, a build server, or a monitor: each of those roles would
duplicate a lane, blur the evidence, or consume the parent's turn without producing information.

## When to use

- A request that lands as several delegated tasks (site work, docs, corrections, scans).
- The user asks to launch, pause, re-pause, amend, or resume an idle lane.
- A batch resumes in a new session.
- Do not use for: a single delegation (`worker-strains`), the child's idle contract
  (`idle-agent-protocol`), or the route itself (`task-routing`).

## Size the scope before the spec

The parent counts the files and the lines in the instructed scope before it writes a spec, because a
scope larger than one agent's context window has to be split before any lane starts.

The split is a named file list per batch, not a priority order and not a vague "all", and each batch
fits one agent.

When the scope is larger than one agent, the batches run as a waterfall: one lane finishes its list,
the parent passes the state and the next list to the next lane, and the next lane starts only after
the previous one stops.

Each file in the scope gets a decision, either changed or left alone with a named reason, and "it
has no numbered rows" is not a reason to skip a file when the task is a prose rewrite.

A partial pass is reported as partial with the exact remaining list, and the parent continues the
waterfall until the scope is covered or the user stops it.

## The loop

1. **The receive.**

    The request is received as it arrives.

2. **The formalization.**

    The spec is written: the scope, the surface, the exclusions and the known traps, the sequence,
    the arbiter, the acceptance check, and the shared facts the lane cannot look up.

    The spec also states the tool restriction: the lane uses only read, write, and edit; the parent
    runs the verifiers.

3. **The strain and the route.**

    The strain and the route are picked (`worker-strains`, `task-routing`), and the route is passed
    explicitly, because a lane that is not told its route inherits whatever default the harness
    happens to have.

4. **The delegation.**

    The parent delegates to an active lane, or to an idle lane with a retained spec; in both cases
    the spec is self-contained, because the child does not see the parent's conversation.

5. **The own work.**

    The parent continues its own next unit of work.

    The lanes are NOT monitored: each report arrives as a message, and the queue is read only when
    the parent has a reason to act (the no-blocking-wait law).

6. **The verification.**

    The parent verifies the lanes' printed arbiter results, greps the artifact for every remediation
    the report claims, and runs only read-only spot checks itself.

7. **The report.**

    The parent reports results, residuals, decisions, and READY-TO-COMMIT.

8. **The record.**

    The record is paired (`worker-strains`, rule 8) in the slot the lane vacated.

    The parent commits the integrations with `git gcommit`.

## The two-active regime

- Exactly two lanes are active at any moment; all others are paused with retained specs. The cap is
  the API throttle, not a preference.
- The next pair releases only when the current pair has delivered both reports.
- Every feedback delivery pauses the receiving lane first. It executes only when its slot opens.
- An idle lane does not acknowledge its state with a status line, because the acknowledgment is not
  work. The parent does not need a line to know that the lane waits.
- "RE-PAUSE" stops all work now; partial state persists for the resume.

## The no-blocking-wait law

A delegated lane is never waited on.

It runs, finishes, and reports; the report arrives as a message.

The parent does not call `wait_agent`, sleep, or poll the task board.

- Inactivity is not a result: it says nothing about success, failure, or progress.
- The parent's next action after a dispatch is its own next unit of work. If none is left, it ends
  the turn instead of inventing a reason to watch the lane.
- The board is read when the parent has a reason to act, never on a timer.
- **No progress inspection.** The parent does not `ls`, `git status`, `find`, or read a lane's
  output path to learn whether the lane started. That is the same wait in a different coat: it costs
  a turn, returns no result, and reads as stress. The report is the only progress signal.
- **The user's stop ends the batch.** When the user says stop waiting and execute, the batch is
  over: `interrupt_agent` every running lane, message each one "STAND DOWN - do not write", check
  the tree ONCE at the takeover, and then do the work. Never monitor a handover.
- The incident that made this a law is recorded in `references/queue.md`. The second incident, on 25
  October 2026, is recorded there as well: the Lead dispatched three lanes, then called `wait_agent`
  twice and inspected the lanes' output paths between waits while its own code work sat undone; the
  user stopped it with "STOP WAITING FOR AGENTS". Stage 5 ("Monitor") licensed that shape; it is now
  "Continue".

## The information broker

A lane cannot ask the parent a question mid-flight: a subagent has no addressable mailbox in this
harness (`send_message` rejects it), and it does not wait.

Recorded history reaches a lane only through the parent, in two forms:

- **Pre-supply** in the spec: the facts the lane will need from prior sessions, the ledgers, or
  earlier agent attempts, with their coordinates.
- **On a reported NEED**: pull the exact slice from the session corpus with the session tools
  (`session_search`, `session_event_search`, `session_trace`, `session_event_read`) - never a whole
  corpus read, never a guess.

Shape the slice with a reformatter lane when the requester needs a specific form (a table, a
timeline, a diff of what changed), verify the shaped output against the slice, then re-dispatch the
requester with the shaped data as a continuation lane.

A NEED report is not a failure and not a stall: it is a request the parent answers with a new
dispatch.

The broker never edits the requester's files and never paraphrases a record: the shaped data keeps
its coordinates, and the requester must be able to trace each fact back to its source.

When a lane is expected to need mid-flight steering or a decision, spawn it as a durable teammate
(`spawn_teammate`), which has an addressable mailbox; reserve `subagent` lanes for work that cannot
be interrupted.

A subagent lane that asks a question has already lost: it waits for an answer that cannot arrive,
and the parent must re-dispatch a continuation that redoes part of its work.

## Spec reconfiguration

The parent may amend an idle lane's spec by sending the amendment, amend a working lane mid-flight
only when the change is compatible with the work already done, re-apply changed requirements to
lanes that have not started, and re-dispatch a failed lane with the corrected spec and the failure
summary.

The mid-flight amendment message names what changed and what must be re-verified, so that the lane
can align its work without silently merging two specs.

Amendments override the base spec where they conflict; the lane keeps the rest.

**The idle-amendment law:** a new idea, suggestion, or improvement never amends a working lane
mid-flight.

It becomes a new idle lane, and the improvement folds into a later dispatch.

Working lanes finish against the spec they started with.

**The moving-law case:** when the parent edits a law file that a working lane is reading, the lane
must re-read it and may align its own output.

On 21 October 2026 a lane detected that the standard changed under it, did not claim the parent's
edit as its own, re-read the law, and aligned two of its files.

That is correct behavior, not drift.

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
file.

Handoff documents are temporary and may be erased at the session's close.

On resume:

1. Read the active plan and the queue record.
2. Check the tree state in the root and in `Site/`.
3. Re-verify every count before repeating it.
4. Re-read the owner skill for any law that changed.
5. Restore the queue with its active, paused, and queued lanes; finished work is not re-run.

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
| A lane is running and no own work is left  | End the turn; never wait or poll                     |
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
| Messaging a subagent mid-run             | The harness has no mailbox; the call fails         | Pre-supply in the spec, or re-dispatch       |
| `wait_agent` after a dispatch            | Costs a turn, adds no information, reads as stress | Do the parent's own work; the report arrives |
| `ls`/`git status` on a lane's output     | The same wait in a different coat; no result       | Continue your own work; the report arrives   |
| Monitoring a handover after a stand-down | The takeover is one check, not a watch             | Interrupt, stand down, check once, execute   |

## What a report does not prove

Three failures from 2026-10-27, each one a report that was accurate about intent and wrong about the
tree.

**A reply is not a diff.** A child was sent the compiler's two errors and asked for the signature
fix. It replied with its previous summary - the same "created and changed" list - and the file on
disk was unchanged. The parent read the reply, assumed the fix, rebuilt, and met the same two
errors. A report that restates a previous report has done nothing; after any amendment the artifact
is checked before the reply is believed.

**The parent fixes compile-level breakage.** The non-execution law exists so the parent does not
duplicate a lane's work, and it does not cover a two-line type mismatch discovered by the parent's
own build. Re-dispatching a write-only lane for a signature costs a full lane cycle; the parent
makes the fix, records it as the parent's, and re-runs the arbiter. The line is the size of the
change, not the identity of the actor: a signature, a defaulted index access, or an off-by-one in a
fixture is the parent's; a behavior change is the lane's.

**Fan-out is not the two-active cap.** A workflow script seated three read-only lanes whose outputs
were disjoint files, and all three finished without a throttle error. The cap governs the parent's
messageable lanes, where the parent's own attention is the scarce resource; a script's phases are
bounded by their file disjointness instead. The test is the same in both cases: can two lanes write
the same file? If they can, serialize them.

## References

| File                                       | Covers                                                  | Read when                          |
| ------------------------------------------ | ------------------------------------------------------- | ---------------------------------- |
| `references/loop.md`                       | The seven stages, formalization, and the report shape   | Running or reviewing a batch       |
| `references/queue.md`                      | Two-active, pair release, re-pause, stalls, dead lanes  | Managing active and idle lanes     |
| `references/verification.md`               | The lanes' arbiters, the non-execution law, spot checks | Verifying a report                 |
| `references/reconfiguration-and-resume.md` | Spec amendments, the idle-amendment law, the resume     | Feedback arrives, or a new session |
