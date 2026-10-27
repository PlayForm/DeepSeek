# The Git Law: Checks Only, Never Mutate

The rule: git is a read-only inspection surface for agents.

The user owns every mutation.

## Allowed

```text
git status        git log           git diff          git show
git rev-parse     git ls-files      git fetch         git log --diff-filter=D
```

These answer the questions work actually needs: what changed, what the history says, whether a file
was deleted, where the repository root is.

## Forbidden

```text
git add           git commit        git reset         git push
git tag           git rm            git checkout      git branch
git merge         git stash         git clean
```

The list is exhaustive, not illustrative.

A command that mutates the index, the working tree, refs, or history is forbidden even when it looks
harmless or reversible.

## The deliverable: READY-TO-COMMIT

A finished change is reported, not committed:

```text
READY-TO-COMMIT
Files:
  Documentation/Skill/code-authoring/SKILL.md
  Documentation/Skill/code-authoring/references/tool-discipline.md
Suggested message:
  docs(skills): rewrite code-authoring to the v2 standard
```

The report gives the user everything needed to commit in seconds and keeps the mutation in human
hands.

## Why

1. **The lost work.**

    A commit, reset, or clean can destroy uncommitted work the user has not seen.

2. **The rewrite.**

    History rewrites are not reliably reversible from the agent's side.

3. **The ownership.**

    The user's repository state is the user's decision, not a side effect of a task.

## Two repositories

The monorepo root and `Site/` are separate git repositories.

Check both when the work spans them:

```sh
git status --short
git -C Site status --short
```

A site change is not visible in the root status.

A READY-TO-COMMIT report for site work names the `Site/` files and says which repository they belong
to.

## Edge cases

- `git fetch` updates remote-tracking refs without touching the working tree; it is allowed.
- `git stash` is a mutation of working state; forbidden.
- `git cherry-pick --no-commit` still mutates; forbidden.
- A task that seems to require a mutation produces a READY-TO-COMMIT report, not an exception.
