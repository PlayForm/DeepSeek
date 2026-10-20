# The Background Job Tools (job_list / job_output / job_kill)

> Source: SKILL.md, section 3, rule 1. Documented from the live harness, 2026-10-08.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

Long-running work - a bash task moved to the background, a background
workflow - returns a job id, and the job id is the handle for exactly three
tools:

- **job_list** - every background job, running and finished, with their ids,
  kinds, and statuses.
- **job_output** - read a job: output since the previous read for stream
  jobs, or the result of a finished final-output job. With wait: true it
  blocks until the job finishes or the timeout expires; timeout_ms is capped
  by configuration, and a timed-out wait leaves the job RUNNING.
- **job_kill** - request cancellation of a running job, with an optional
  short reason that is recorded in the log and forwarded to the job.

The binding laws: track every job id you start; do not busy-poll or sleep on
a running job - you are notified in-session when it finishes; before a final
answer, collect every still-relevant job (wait: true only when genuinely
blocked) and job_kill the jobs that stopped mattering.

## Why: The Full Philosophy

1. **The job id is the only handle.** A background job's output is not in
   the conversation; it accumulates behind the id. Lose the id and the work
   finishes into the void - job_list recovers the id, but unread stream
   output may scroll away.
2. **The harness notifies; the agent does not poll.** Finishing a job
   generates an in-session notification. Sleeping in a loop or re-reading
   job_output every turn wastes turns and delays everything else; keep
   working on independent steps instead.
3. **wait is for genuine blocking, incremental reads for progress.** Two
   honest modes exist: wait: true when nothing else can proceed without the
   result, and incremental job_output reads when other work runs in
   parallel. A timed-out wait is a scheduling event, not a failure - the
   job keeps running.
4. **Kill what stopped mattering.** Stale jobs consume resources and their
   results are never read; a job whose purpose disappeared (its consumer
   took another path) is noise with a process attached. job_kill's reason
   makes the cancellation auditable.

## Examples

### Good

- Start a long build in the background, note the job id, continue editing
  unrelated files, act on the finish notification, then job_output the
  result once.
- A background workflow becomes irrelevant after a user course change:
  job_kill with a one-line reason, then confirm via job_list that it is no
  longer running.

### Bad

- A sleep/job_output polling loop - wasted turns; the notification arrives
  anyway.
- Finishing the turn with three running jobs whose results the report
  promised - the report is unverifiable and the jobs are orphans.
- Assuming a timed-out wait killed the job - it is still running.

## Exceptions

- A timed-out wait is not a cancellation: the job keeps running and its
  output keeps accumulating; re-read it or kill it explicitly.
- Finished final-output jobs are read once for their result; stream jobs
  give output since the previous read, so gaps between reads are invisible.

## Failure Modes

- Losing a job id: unread output, an orphan process.
- Busy-polling: wasted turns and delayed parallel work.
- Leaving stale jobs running at turn end: resources consumed, results never
  read.
- Reporting a background result without reading its final output: the report
  asserts what was never observed.

## Arbiters

- job_list is the arbiter of what is running: claims about a job's status
  come from it, not from memory.
- The job's own final output is the arbiter of whether the work succeeded;
  for bash results, the exit-code marker in the output decides success.
