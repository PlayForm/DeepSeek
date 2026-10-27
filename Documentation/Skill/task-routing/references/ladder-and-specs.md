# The Ladder, the Failure Signals, and the Spec

## The ladder

1. **The first attempt.**

    Attempt 1 runs at the task's tier: `low` for mechanical, `high` for semantic.

2. **The second attempt.**

    Attempt 2 runs at `high`, only if attempt 1 failed.

3. **The escalation.**

    The parent re-delegates to the DeepSeek lane at `max` (`deepseek-v4.1-flash-1017`, fallback
    `deepseek-v4-flash-0731`), carrying the failed run's workspace files, build logs, and a failure
    summary.

    At most once per task.

4. **The stop.**

    If the escalation fails, report both summaries to the user.

    No fourth attempt.

The parent owns the ladder.

A child may signal failure; it may not re-delegate itself.

## The failure signals

An attempt failed when any of these holds:

- The report contains a section starting exactly with `ESCALATION: <concrete reason>`.
- The child silently gave up: no build, no tests, no artifacts, an empty workspace, or a report that
  describes intent instead of results.
- The parent's own verification failed, even if the child claimed success.

A run that "seemed off" without one of these signals is not a failure; escalating it burns the one
escalation.

## The spec template

Every coding prompt contains:

```text
Task: <one paragraph, the outcome, not the steps>

Files: <the surfaces in scope; the exclusions>

Build: <the exact command>
Tests: <the exact command>

Cases:
1. <input> -> <expected output / exit code>
2. <adversarial: non-repo dir, permissions, empty input, stale lock,
   binary or UTF-8 input> -> <expected>

Rules:
- File content only through the write/raw-write/edit tools. Never sed,
  awk, perl, python in-place, or heredoc. Never cat/head/tail for content.
- Read before edit. Git is checks only; report READY-TO-COMMIT.
- Do not read the reference implementation. (Replication tasks only.)

If you cannot complete this task, do not silently give up. End your
report with a section starting exactly with:
ESCALATION: <concrete reason>
```

## Why the edge cases are mandatory

The v1 high-effort replica passed its own test suite while carrying a lock flaw: false timeouts on
non-repo directories.

Only an edge case beyond the spec's list found it.

The adversarial classes are the cheapest bug catchers in the pipeline because they run
deterministically and cost no LLM tokens.

## Why the marker is verbatim

`ESCALATION:` is a protocol string the parent greps for.

A paraphrased instruction ("tell me if you get stuck") produces a silent give-up that is harder to
detect than a failure.

## Failure modes

- Skipping attempt 2 and jumping to the escalation: pays the premium for a failure a `high` retry
  usually fixes.
- Escalating without the artifacts: reproduces the same failure.
- Looping past stop: runaway spend, and the user never learns the spec is the problem.
- Losing the summaries: the next session repeats the failure.
