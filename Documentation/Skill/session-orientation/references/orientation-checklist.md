# The Orientation Checklist

Run this checklist once per fresh session.

It takes minutes and prevents the most expensive class of error: acting on a stale map.

## A. Fresh session

1. Read `Documentation/Skill/session-orientation/SKILL.md` (this skill).
2. Read `Documentation/Skill/STANDARD.md` (the corpus standard).
3. Read the first 100 lines of `README.md` and its smoke table.
4. Read the section headings of `Documentation/INDEX.md`.
5. Read the active plans named by the task, or list them:
   `grep -H '^status: active' Documentation/Plans/*.md`.
6. Load the owner skill for each law the task will touch.
7. Run read-only git checks in the root and in `Site/`: `git status --short` and
   `git log --oneline -5` in each.
8. Answer the six questions in the SKILL.md verification section.
9. Then start the task.

## B. Resume or fork

A resumed session inherits files, not memory.

Add these steps:

1. Read the latest handoff document in `Documentation/Handoff/`, if any.
2. Read the queue record in `Documentation/Plans/TOMORROW-REVIEW.md` or the active plan that carries
   the queue.
3. Check the tree state again; the user commits mid-session, so HEAD can move under you.
4. Re-read the owner skill for any law that changed since the last session (check `updated:` in its
   frontmatter).
5. Re-verify every count you plan to repeat.

## C. Delegation

Before launching a subagent:

1. The spec is self-contained: the child cannot see this conversation.
2. The routing triple is explicit and matches `task-routing`.
3. The verification command and its expected output are in the spec.
4. The report format is in the spec: per-item before and after with `file:line` anchors, plus the
   printed arbiter results.
5. The child knows the laws it must follow (file writes, git, no dev server).

## D. Failure modes this checklist prevents

| Failure                        | What it looks like                                                  |
| ------------------------------ | ------------------------------------------------------------------- |
| Acting before orientation      | Edits in the wrong tree; a law violated in step one                 |
| Trusting prose counts          | Repeating 733/746, 1314/1324, or "15 packages" after the tree moved |
| Reading plans as shipped truth | Documenting a planned plugin as if it exists                        |
| Wrong git surface              | Root `git status` missing `Site/` changes                           |
| Delegation without the laws    | A child edits through the terminal, or commits                      |
| Stale model route              | A delegation without the explicit triple                            |

## E. The six answers

You are oriented when you can state, without opening another file:

1. The two release trees and why they never mix.
2. The package count, the version, and the verify command.
3. The smoke manifest totals and the live-containers caveat.
4. The three models and the main agent's model.
5. The file-write law and the git law, in one sentence each.
6. The active plans.

The expected package answer as of 2026-10-22: 51 Classic + 46 EffectTS packages, all 0.1.0,
unpublished; the verify command is `ls Classic/packages EffectTS/packages`.

The expected smoke answer: 359 suites / 5,337 checks via `node Maintain/Run/Smokes/Index.mjs`.

If any answer is a guess, return to the step that owns it.
