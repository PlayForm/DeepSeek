---
name: idle-agent-protocol
description:
    "Contract for an agent launched IDLE: retain the spec verbatim, do no work until activated,
    confirm with the exact line, execute the spec, and report against its arbiter."
whenToUse:
    Whenever launched with a paused-status instruction and a spec to retain, and whenever the parent
    amends or activates an idle lane; also when a batch stalls because a lane acknowledged an
    amendment but did not execute.
version: 2.0.0
updated: 2026-10-20
---

# Idle Agent Protocol

An idle lane is a held spec, not a paused worker. It costs nothing until it is activated, and it
starts from the exact spec it retained. This contract is what makes a queue of idle lanes safe: no
lane acts on a stale reading of the conversation, and every activation is explicit.

## When to use

- You are launched with `STATUS: PAUSED` and a spec to retain.
- You receive an amendment while idle.
- You receive an activation with a current-state block.
- Do not use for: the parent's queue (`orchestrator-batch`) or the spec's content
  (`worker-strains`).

## The contract while idle

1. **Retain the full spec verbatim.** It is your only authority. Do not summarize it, reinterpret
   it, or start preparing for it.
2. **Do no work.** No reads, no writes, no builds, no git commands, no investigation. The only
   output is the confirmation line.
3. **Confirm exactly.** Reply:

    ```text
    <NAME> SPEC RETAINED - IDLE
    ```

    For an amendment:

    ```text
    <NAME> SPEC AMENDED - IDLE
    ```

4. **An amendment replaces the conflicting part of the base spec.** The rest stands.

## The execution on activation

1. Read the current-state block in the activation; it is part of the spec.
2. Check the tree state before writing: `git status --short`, `git log --oneline -5`, and
   `git -C Site status --short` when the site is in scope.
3. Execute the spec exactly: the scope, the exclusions, the sequence, and the report format are
   constraints.
4. Where the spec says "if X exists, verify and adjust", verify first, then adjust minimally.
5. Run the arbiter named in the spec; report its printed result.
6. Flag, do not silently fix, any conflict: a contradiction with the shared facts, a stale claim, a
   file another lane owns.
7. End with the report format the spec names, plus READY-TO-COMMIT.

## The laws that still apply

- File content only through the write/raw-write/edit tools (`code-authoring`).
- Git is checks only; never commit.
- The route is the one in the spec; do not re-route yourself (`task-routing`).
- Stay in your scope; other lanes are working beside you (`worker-strains`).

## Decision table

| Situation                         | Action                                     |
| --------------------------------- | ------------------------------------------ |
| Launched paused with a spec       | Retain; reply the exact IDLE line          |
| Amendment arrives while idle      | Retain; reply the exact AMENDED line       |
| Amendment arrives while working   | Apply only if compatible; flag if not      |
| Activation arrives                | Execute the retained spec; run the arbiter |
| The spec conflicts with the tree  | Verify the tree, flag the conflict         |
| A shared file is already modified | Read before edit; report the conflict      |

## Verification

- The idle turn contains exactly one line: the confirmation.
- The activation turn runs the spec's arbiter and prints its result.
- The report has `file:line` anchors and READY-TO-COMMIT.
- No work happened before activation.

## Anti-patterns

| Mistake                                 | Cost                                   | Do instead             |
| --------------------------------------- | -------------------------------------- | ---------------------- |
| Starting work before activation         | Works on a spec that may change        | Wait for ACTIVATE      |
| Acknowledging an amendment and stopping | The queue looks busy; nothing executes | Execute at ACTIVATE    |
| Paraphrasing the spec in the report     | The parent cannot match work to spec   | Quote the spec's items |
| Silently fixing a conflict              | The change is invisible to the parent  | Flag it in the report  |

## References

| File                      | Covers                                             | Read when             |
| ------------------------- | -------------------------------------------------- | --------------------- |
| `references/contract.md`  | The idle contract, the exact lines, and amendments | You are launched idle |
| `references/execution.md` | Activation, verification, flagging, and the report | You are activated     |
