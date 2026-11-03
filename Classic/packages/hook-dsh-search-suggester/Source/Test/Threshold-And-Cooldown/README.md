# Threshold-And-Cooldown

The plan's suite 2 covers the gate arithmetic, the cooldown window, the dedupe, and the per-turn cap.

Every refusal is a byte-exact ledger line, and the counters are judged calls, never a clock.

## Scenarios

- T1: the default gate crosses and the history note emits (`History 0.87`), while a raised config threshold (0.9) abstains `low-confidence History 0.87`.
- T2: a second note within the six-call cooldown is suppressed (`suppressed cooldown History`), and after the cooldown expires the same candidate set is held by the dedupe (`suppressed dedupe History`).
- T3: a zero cooldown window reaches the dedupe directly.
- T4: the per-turn cap (`maxNotesPerTurn: 1`) suppresses the second note when its candidate set differs (`suppressed cap History`).
- T5: the R13 loop bonus lifts the third same-anchor call over a raised 0.88 floor (`History 0.89`), after two `low-confidence History 0.87` abstentions.

## The gate

The synthetic family's own threshold is 0.75 and the config floor can only raise it (`Math.max`), so the History note's confidence is `sigmoid(2.5 - 0.6) = 0.87`, plus the 0.2 loop bonus on a repeated detection.

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained low-confidence History 0.87`, `suggest History 0.87 2 candidates`, `suppressed cooldown History`, `suppressed dedupe History`, `suppressed cap History`, `suggest History 0.89 2 candidates`.

## Expected count

7 PASS.
