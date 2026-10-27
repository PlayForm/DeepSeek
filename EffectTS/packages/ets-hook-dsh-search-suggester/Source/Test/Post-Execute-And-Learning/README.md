Post-Execute-And-Learning - the listener and learning tests

The tools/post-execute and agent/pre-step listeners against the fake ctx: the emit path, the pass-through paths, the no-signal abstention, the online learning loop, the suppress paths, the per-agent ring isolation, and the per-turn reset.

## Scenarios

- E1: the emit path, where a strong Version grep (pattern and manifest path) prepends ONE frozen, identified note (source kind `search-suggester`, form `notice`, summary `Version 0.92`) ahead of every downstream context; the `suggest Version 0.92 7 candidates` ledger line is byte-exact in the logger and durable forms; a weaker Version grep (manifest path only) abstains `low-confidence Version 0.84`; the ring records the cooldown, the recent candidate paths, the open learning window (pending since 1), and the counters; and the knowledge stats move.
- E2: the pass-through paths, where a non-judged tool (webfetch) returns the decision unchanged with zero ledger lines, a bash call is judged through its command text (a version-shaped command alone abstains `low-confidence Version 0.80`), and next() is awaited before any judgment.
- E3: the no-signal abstention, where an unrelated call abstains `no-signal` with the empty-intent double-space line (`abstained no-signal  0.00`, both forms).
- E4: the learning loop, where an edit of a candidate path records `followed Version package.json` (both forms), closes the pending window, moves the knowledge stats, and saves the file, which the next mount reloads; a window closed untouched records `ignored Version` (both forms) after learnWindow judged calls.
- E5: the suppress paths, where a zero cooldown window reaches the `dedupe` suppress, the per-turn cap suppresses a second intent (`suppressed cap Test`) after the R12 context and R13 loop build its confidence, the `agent/pre-step` reset clears the ring so the same call emits again, another agent's ring is independent, and the reset listener is fail-open and returns the downstream decision.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory, the real built Target, a temp knowledge file).

There is no fake clock, because every timing assertion is on the counters of the ring and the learning window.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`suggest Version 0.92 7 candidates`, `abstained low-confidence Version 0.84`, `abstained low-confidence Version 0.80`, `abstained no-signal  0.00`, `followed Version package.json`, `ignored Version`, `abstained low-confidence Test 0.72`, `suppressed dedupe Version`, `suppressed cap Test`.

## Expected count

15 PASS.
