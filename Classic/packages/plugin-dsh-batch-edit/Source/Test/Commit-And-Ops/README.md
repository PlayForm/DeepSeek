# Commit-And-Ops - the commit path and the op executor tests

The two-phase commit with its byte-exact ledger lines, the write through the
factory's executor with the replaceIfVersion intent, the governed-basename
re-route, the stale halt, the strict-mode error, the designed no-op
silence, the atomic gate, and the op executor / diff units.

## Scenarios

- C1: a commit replaces through Factory.Write, closes the one-shot machine,
  and logs the byte-exact running / applied / committed / closed lines; the
  write carries the replaceIfVersion intent and the factory's stash gets the
  fresh version.
- C2: a package.json write re-runs the registered governance steps exactly
  once through Factory.Govern with the fresh version.
- C3: an externally touched file halts stale and is protected, not written.
- C4: a search-not-found under strict mode errors the file loudly.
- C5: a zero-change commit is the designed no-op - nothing written, no
  transition lines.
- C6: a failed write stops the apply loop - the remainder returns to
  observed (the atomic gate).
- C7: the op executor units - replace with first/count/all, regex search,
  insert-before/after, remove-line, append/prepend newline padding, and the
  bounded diff.

## Expected count

13 PASS.
