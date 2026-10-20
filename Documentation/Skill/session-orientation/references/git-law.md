# THE GIT LAW (Checks Only - Never Mutate)

> Source: SKILL.md, section 3 ("THE GIT LAW (checks only - never mutate)").
> User-mandated 2026-10-10; codified in the `code-authoring` skill section 1d.
> Converted to the canonical skill structure on 2026-10-20.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The orchestrator and every agent NEVER mutate the repository through the
terminal. Forbidden git operations include (not exhaustive):

- `git add`, `git commit`, `git reset`, `git push`, `git tag`, `git rm`
- checkout, branch, merge, stash
- `git clean`

Allowed git work is read-only CHECKS ONLY:

- `git status`, `git log`, `git diff`, `git show`, `git rev-parse`,
  `git ls-files`, `git log --diff-filter=D`, `git fetch`

Any deliverable that needs a commit is reported as **READY-TO-COMMIT**: the
exact file list plus the suggested commit message - and the user commits it.

User-mandated 2026-10-10; codified in the `code-authoring` skill, section 1d.

## Why: The Full Philosophy

1. **Git mutations are irreversible from the agent's side.** A commit, a
   reset, or a clean performed by an agent can destroy uncommitted user
   work, rewrite history, or push unintended content - actions the user
   cannot always undo and did not authorize. The user owns every git
   mutation; that ownership is the point of the law.
2. **READY-TO-COMMIT preserves the deliverable without stealing the
   decision.** Reporting the exact file list plus the suggested commit
   message gives the user everything needed to commit in seconds, while
   keeping the mutation itself in human hands. The work product is not
   diminished; only the trigger is reserved.
3. **Read-only checks are load-bearing.** The allowed list is not decorative:
   `git status` verifies what changed, `git log --diff-filter=D` finds
   deleted files, `git diff` and `git show` review content, `git rev-parse`
   and `git ls-files` locate state. The law does not blind the agent; it
   only removes the write path.
4. **`git fetch` is allowed but is the outer boundary.** Fetching updates
   remote-tracking refs without touching the working tree or local branches.
   It is the one network-touching git operation the law permits, and its
   inclusion is deliberate: staying current does not require mutation.
5. **Uniformity across the orchestrator and every agent.** The law names
   "the orchestrator and every agent" so no layer believes it is exempt:
   a subagent may not do via delegation what the orchestrator may not do
   directly.

## Examples

### Good

- After finishing a fix, the agent runs `git status` and `git diff` to
  enumerate changes, then reports: READY-TO-COMMIT - files: (list) -
  suggested commit message: (text). The user commits.
- The agent uses `git log --diff-filter=D` to check whether a missing file
  was deleted in history, and `git show` to read its prior content.

### Bad

- The agent runs `git add -A && git commit -m "..."` because the deliverable
  "was obviously ready" - a direct violation; readiness is reported, never
  executed.
- The agent runs `git stash` to "temporarily tidy" the working tree - stash
  is a mutation of working state and is forbidden.
- The agent runs `git clean -fd` to remove build artifacts before a build -
  `git clean` can delete untracked user files; it is forbidden.

## Exceptions

- None documented. The allowed list above is the complete permission surface;
  a git operation not on it is forbidden even if it appears harmless or
  reversible. If a task seems to require a mutation, the correct output is a
  READY-TO-COMMIT report, not an exception.

## Failure Modes

- History mutation by agent: commits, resets, or pushes performed
  autonomously; the user loses control of their repository state and may
  lose uncommitted work.
- Destructive cleanup: `git clean` or `git checkout .` removing untracked or
  modified user files under the guise of tidying.
- Silent deliverable limbo: the agent finishes work but neither reports
  READY-TO-COMMIT nor commits (forbidden), leaving the deliverable
  unrecorded and uncommunicated.
- Edge-case rationalization: treating a mutating command as "basically
  read-only" (e.g. `git stash pop`, `git cherry-pick --no-commit`); the
  allowed list is the arbiter, not intent.

## Arbiters

- The allowed list is exhaustive: `git status`, `git log`, `git diff`,
  `git show`, `git rev-parse`, `git ls-files`, `git log --diff-filter=D`,
  `git fetch`. Anything else is a violation by definition.
- Transcript scan: any `git` invocation in a session is checked against the
  list; a mutating git command in any transcript is a law violation
  regardless of outcome.
- The READY-TO-COMMIT report format: a deliverable needing a commit must
  appear in a session output as an explicit READY-TO-COMMIT entry with the
  file list and suggested message; its absence for a finished deliverable is
  itself a failure.
- Cross-references: user mandate dated 2026-10-10; the `code-authoring`
  skill section 1d carries the codified version - the two must agree.
