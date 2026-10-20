# The Environment: Concurrency, Scope, and Edit Discipline

A delegated lane works inside a tree that other lanes and the user are
also changing. This file states the assumptions that keep that safe.

## You are never alone

- Other lanes may be editing the same repository at the same time.
- The user commits mid-session, so HEAD can move under you.
- The current-state block in your spec is part of the spec: read it, and
  check the tree again before you write.

## Verify the environment

Before work, and again when something looks off:

```sh
git status --short
git log --oneline -5
git -C Site status --short   # when the site is in scope
```

Uncommitted changes may be yours, another lane's, or the user's. Do not
"clean up" what you did not create.

## Stay in scope

- The spec's surface is a boundary, not a suggestion.
- Other lanes' files are off-limits even when a fix looks obvious.
- Read before edit, always.
- Coordinate through the report: name the conflict, do not resolve it by
  editing someone else's region.

## Concurrency is earned

Two lanes may run at once only when their file sets are provably disjoint.
The proof is a list: the files lane A will touch, the files lane B will
touch, and no intersection. "They touch different things" is not a proof;
"they touch different files" with the list is.

When in doubt, serialize. A lost update is more expensive than a queue.

## The edit discipline

1. Read the file (and its neighbours) first.
2. Make one logical change per call through the write/raw-write/edit
   tools. Never a terminal content operation (`code-authoring`).
3. Run the relevant arbiter after each touched file:
   - package code: the bundle's smoke suite (`smoke-writing`);
   - site: `cd Site && pnpm prepublishOnly`, then grep the built HTML;
   - docs: re-read the changed span.
4. If the arbiter fails, fix it before the next file. Never leave the tree
   broken and continue.

## The build-verified rule

"Build-verified" means the arbiter for the touched surface has passed
after the last change, not that a build was run at some point. A lane that
reports success without the printed result has not verified anything.

## Failure modes

- **Assuming a clean tree**: overwriting another lane's edit.
- **Scope creep**: fixing a neighbour because it was "right there".
- **Optimistic concurrency**: two lanes on one file; the later write wins
  silently.
- **Unverified continuation**: a failing arbiter left for the next file,
  then reported as a residual.
