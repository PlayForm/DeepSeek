# Git: Checks Only, Never Mutate

> Source: SKILL.md, Section 1d. User-mandated 2026-10-10 after live slips 2026-10-09/10.

## The Rule

The git discipline is a hard rule mirroring the tool discipline: the
orchestrator and every agent NEVER mutate the repository through the
terminal.

FORBIDDEN git operations:

- `git add`, `git commit`
- `git reset` (soft or hard)
- `git push`, `git tag`, any release creation
- `git rm`
- `git checkout`/`git switch`/`git branch`/`git merge`/`git stash`
- `git clean`

ALLOWED (read-only checks, plus one sanctioned update):

- `git status`
- `git log` (including `--diff-filter=D` for history evidence)
- `git diff`, `git show`
- `git rev-parse`, `git ls-files`
- `git fetch` - explicitly allowed, because updating remote-tracking
  refs does not mutate the working tree or the index

## The Rationale: The Live Slips of 2026-10-09/10

During a session close-out, the orchestrator committed `23a313d` and
`c920617` and ran `git rm`. The user's decree, verbatim: "never again
do a `git reset` or anything git related (save that to code authoring)
only git checks."

Why the user owns every mutation:

1. **The user commits and pushes MID-SESSION.** Their editor shows them
   prompts and staged state; their commits are interleaved with the
   agent's work deliberately. An agent committing concurrently steals
   the staging area, splits or mixes their changes, and produces
   commits the user never saw or authored.
2. **The commit is the user's signature.** Authorship, message, and
   timing are expressions of the user's intent. An agent's commit is
   the user's name on work they did not approve at that granularity.
3. **Mutations are irreversible in practice.** A `reset --hard` or a
   pushed tag cannot be undone by an apology; `git rm` of an untracked
   file is not even in git's history to recover.
4. **Read-only checks carry none of this risk.** `status`, `log`,
   `diff`, `show` inform the agent's work without touching anything the
   user owns. The asymmetry is total: all of the information, none of
   the liability.

## The Deliverable Pattern: READY-TO-COMMIT

A deliverable that needs a commit is reported as READY-TO-COMMIT:

- the files changed (paths, and why each changed),
- the suggested commit message,
- nothing executed.

The user then performs the commit (and any push) themselves. The
report's job is to make the user's commit effortless, not to perform
it.

## Where the Rule Applies

- Inside any repository the agents work in (the DSH checkout, plugin
  families, client repos).
- It does NOT apply to the `~/.dsh` skills folder, which is not a git
  repository - but the same spirit governs it: skills are changed only
  through the tool API, per this skill's sections 1 and 1c.

## Failure Modes

- "Just a small fixup commit" - no such thing; the user owns all
  commits.
- `git stash` to "clean up" before work - it mutates state the user may
  be relying on; if work needs stashing, report the situation instead.
- `git checkout <file>` to discard local changes - that discards the
  USER's uncommitted work, which is the worst mutation of all.
- `git fetch` confusion - fetching is fine; it updates remote-tracking
  refs only, and the rule explicitly permits it.

## Arbiters

- Session-log review: the git command surface contains only the allowed
  check list (plus `fetch`).
- Any READY-TO-COMMIT deliverable appears as a report, never as commit
  events in the log.
- A commit by the agent is a violation regardless of the quality or
  urgency of the change.
