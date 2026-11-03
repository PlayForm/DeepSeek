Post-Execute-And-Learning - the listener and learning tests

The tools/post-execute and agent/pre-step listeners against the fake ctx: the emit path, the pass-through paths, the no-history abstention, the online learning loop, the suppress paths, the per-agent ring isolation, and the per-turn reset.

## Scenarios

- E1: the emit path, where a read of the workspace's anchor (the session touched `CHANGELOG.md` and `SCHEME.md` right after it) prepends ONE frozen, identified note (source kind `search-suggester`, form `notice`, summary `History 0.87`) ahead of every downstream context; the note text and the `suggest History 0.87 2 candidates` ledger line are byte-exact in the logger and durable forms; the ring records the cooldown, the recent candidate paths, the open learning window, and the counters; and the knowledge stats move.
- E2: the pass-through paths, where a non-judged tool (webfetch) returns the decision unchanged with zero ledger lines, a bash call with no path and no cwd abstains `foreign-workspace`, and next() is awaited before any judgment.
- E3: the no-history abstention, where a judged call whose anchor has no history abstains `no-history  0.00` (both forms).
- E4: the learning loop, where an edit of a companion records `followed History CHANGELOG.md` (both forms), closes the pending window, moves the knowledge stats, and saves the file, which the next mount reloads; a window closed untouched records `ignored History` (both forms) after learnWindow judged calls.
- E5: the suppress paths, where a zero cooldown window reaches the `dedupe` suppress, the per-turn cap suppresses a second note whose candidate set differs (`suppressed cap History`), the `agent/pre-step` reset clears the ring so the same call emits again, another agent's ring is independent, and the reset listener is fail-open and returns the downstream decision.
- E6: the REAL projection path, with NO seeded state and NO `State` fold. Two `tool/call` events are committed through the fake registry's eager drive (the unit's `apply` folds them into that session's cell), and the test proves the state IS the fold: `Run.State.History` is `undefined`, the cell carries `Seq 2` and the anchor-then-companion touches. The judged call's own `tool/call` is then committed the way the harness commits it before dispatch, and the judged call reads that state through `stateOf`: it emits the `History 0.87` note naming the companion (`suggest History 0.87 1 candidates`) and leaves the cell at `Seq 3` - the call appended nothing.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target, a temp knowledge file, and the fake `sessionProjections` registry: `register` + `stateOf` + the `Commit` drive) plus one temp workspace: the judged call's path is the workspace's absolute anchor, so the gate resolves THAT tree whatever the process cwd is.

Every history setup travels the projection drive (`Commit` -> the unit's `apply` -> `stateOf`); nothing writes a plugin state map.

There is no fake clock, because every timing assertion is on the counters of the ring and the learning window.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest History 0.87 2 candidates`, `suggest History 0.87 1 candidates`, `abstained foreign-workspace  0.00`, `abstained no-history  0.00`, `followed History CHANGELOG.md`, `ignored History`, `suppressed dedupe History`, `suppressed cap History`.

## Expected count

17 PASS.
