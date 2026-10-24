# Threshold-And-Cooldown

The plan's suite 2: the gate arithmetic, the cooldown window, the dedupe,
and the per-turn cap. Every refusal is a byte-exact ledger line; the
counters are judged calls, never a clock.

## Scenarios

- T1: the weak Version call (0.84) abstains under the pack's 0.85 gate; the
  strong call (0.92) emits.
- T2: a second note within the six-call cooldown is suppressed
  (`suppressed cooldown Version`); after the cooldown expires the same
  candidate set is held by the dedupe (`suppressed dedupe Version`).
- T3: a zero cooldown window reaches the dedupe directly.
- T4: the per-turn cap (`maxNotesPerTurn: 1`) suppresses the second intent's
  note (`suppressed cap Test`), the Test lane reaching 0.76 through the
  context + loop credits.
- T5: the destructive intent keeps its 0.85 pack gate even when the config
  floor is 0.6 (`Math.max` - the config can only raise).

## Expected ledger strings (byte-exact, `hook-dsh-search-suggester: ` prefix)

`abstained low-confidence Version 0.84`,
`suggest Version 0.92 7 candidates`,
`suppressed cooldown Version`, `suppressed dedupe Version`,
`suppressed cap Test`.

## Expected count

7 PASS.
