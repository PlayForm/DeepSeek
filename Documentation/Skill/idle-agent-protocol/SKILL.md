---
name: idle-agent-protocol
description:
    "The contract for an agent that is launched IDLE: it retains the full spec, performs no work
    until it is activated, executes the spec exactly when the activation arrives, and returns a
    result that names the files, the arbiter output, and the commit or the ready-to-commit state."
whenToUse:
    Whenever launched with a paused-status instruction and a spec to retain, and whenever the parent
    amends or activates an idle lane; also when a batch appears to stall because a lane was
    activated but did not execute.
version: 3.1.0
updated: 2026-10-28
---

# Idle Agent Protocol

An idle lane is a held spec, not a paused worker.

It costs nothing until it is activated, and it starts from the exact spec it retained.

This contract is what makes a queue of idle lanes safe: no lane acts on a stale reading of the
conversation, no lane prepares against a tree that will change before it runs, and every activation
is an explicit message from the parent rather than an inference from the lane's own reading.

When you are launched with a paused status, treat the spec as your only authority, retain it in
full, and end your turn without a tool call, because the next thing that happens is the parent's
activation and not your own investigation.

## When to use

- You are launched with `STATUS: PAUSED` and a spec to retain.
- You receive an amendment while idle.
- You receive an activation with a current-state block.
- Do not use for: the parent's queue (`orchestrator-batch`) or the spec's content
  (`worker-strains`).

## The contract while idle

1. **The retained spec.**

    Retain the full spec verbatim.

    It is your only authority, and it holds the scope, the surface, the exclusions, the arbiter, the
    acceptance check, and the current-state block exactly as they were given.

    Do not summarize it, reinterpret it, or start preparing for it.

2. **The no-work rule.**

    Do no work.

    No reads, no writes, no builds, no git commands, no investigation.

    Each of those actions would be work against a tree that may change before your slot opens, and
    the plan built from that stale reading is exactly what the idle queue exists to prevent.

3. **No acknowledgment.**

    The idle turn holds no tool call and no status line, because the acknowledgment is not work.

    The parent does not need a line to know that you wait.

4. **The amendment.**

    An amendment replaces the conflicting part of the base spec.

    The rest stands.

    It never authorizes work before the activation: it changes what will be executed, not when the
    execution begins.

## The execution on activation

1. **The current state.**

    Read the current-state block in the activation; it is part of the spec.

2. **The tree.**

    Check the tree state before writing: `git status --short`, `git log --oneline -5`, and
    `git -C Site status --short` when the site is in scope.

3. **The execution.**

    Execute the spec exactly: the scope, the exclusions, the sequence, and the acceptance check are
    constraints.

    Where the spec is silent on a detail, choose the reading that keeps the spec's intent and name
    the assumption in the result.

4. **The conditional.**

    Where the spec says "if X exists, verify and adjust", verify first, then adjust minimally.

5. **The arbiter.**

    Run the arbiter named in the spec; report its printed result.

6. **The conflict.**

    Flag, do not silently fix, any conflict: a contradiction with the shared facts, a stale claim, a
    file another lane owns or has already modified, or a spec item that cannot be satisfied as
    written.

    A silent fix hides a decision that the parent needed to make.

7. **The report.**

    End with the report the spec names: the files and their `file:line` anchors, the arbiter command
    and its printed output, the flags and the decisions still open, and the commit hash or
    READY-TO-COMMIT.

## The laws that still apply

- File content only through the write/raw-write/edit tools (`code-authoring`).
- A lane uses only the read, write, and edit tools; it does not run bash, node, git, prettier,
  python, or any other command, and the parent runs the verifiers read-only.
- Git is checks only unless the spec explicitly says to commit, in which case you stage only your
  own files and run `git gcommit`; the retired variants of the commit alias must never be used.
- The route is the one in the spec; do not re-route yourself (`task-routing`).
- Stay in your scope; other lanes are working beside you, and `worker-strains` explains how to read
  before editing and how to coordinate through the result.

## Decision table

| Situation                         | Action                                      |
| --------------------------------- | ------------------------------------------- |
| Launched paused with a spec       | Retain the spec and produce no tool call    |
| Amendment arrives while idle      | Retain the amended spec; still no tool call |
| Amendment arrives while working   | Apply only if compatible; flag if not       |
| Activation arrives                | Execute the retained spec; run the arbiter  |
| The spec conflicts with the tree  | Verify the tree, flag the conflict          |
| A shared file is already modified | Read before edit; report the conflict       |

## Verification

- The idle turn is done when it holds no tool call.
- The activation turn runs the spec's arbiter and prints its result.
- The report has the `file:line` anchors, the printed arbiter output, and the commit hash or
  READY-TO-COMMIT, so that the parent can match the work to the spec and the user can decide what
  happens next.
- No work happened before activation; if any did, the contract is violated even when the eventual
  work was correct.

## Anti-patterns

| Mistake                                 | Cost                                                   | Do instead             |
| --------------------------------------- | ------------------------------------------------------ | ---------------------- |
| Starting work before activation         | Works on a spec that may change                        | Wait for ACTIVATE      |
| Acknowledging an amendment and stopping | The queue looks busy; nothing executes                 | Execute at ACTIVATE    |
| Deviating from the spec silently        | The deviation enters the record as if it were intended | Name the deviation     |
| Paraphrasing the spec in the report     | The parent cannot match work to spec                   | Quote the spec's items |
| Silently fixing a conflict              | The change is invisible to the parent                  | Flag it in the report  |

## The amendment that does nothing

An amendment is a new instruction, and a reply that restates the previous report is not an execution
of it. On 2026-10-27 a child received the compiler's errors with a request for a signature change
and answered with the summary it had already sent; the file was untouched.

A child that cannot act on an amendment says so in one line and names what blocks it. A child that
acts reports the diff, not the summary. The parent checks the artifact either way, so the honest
answer is also the cheap one.

## References

| File                      | Covers                                                           | Read when             |
| ------------------------- | ---------------------------------------------------------------- | --------------------- |
| `references/contract.md`  | The idle contract, the no-acknowledgment rule, the amendments    | You are launched idle |
| `references/execution.md` | Activation, the pre-work checks, execution, flagging, the result | You are activated     |
