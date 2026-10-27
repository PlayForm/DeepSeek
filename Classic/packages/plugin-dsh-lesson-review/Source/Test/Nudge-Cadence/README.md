# Nudge-Cadence

When a review becomes due: the counter, the interval, the disabled service and
the per-agent reset.

## Intent

The cadence is what makes an unattended review invisible. It must fire often
enough to learn from a session and rarely enough to cost nothing, and it must be
answerable without a clock - so the service counts TICKS the caller supplies
(one per idle transition) rather than reading wall time. This folder pins the
four states of that counter.

## Scenario

- Check: "N1: a disabled service never comes due" - `enabled: false` with
  `intervalTurns: 1` answers three ticks with `due: false` and a zero count.
- Check: "N2: the interval fires exactly on its turn and resets" - with
  `intervalTurns: 3` the third tick is due (`count: 3`), the next tick is early
  again, and the counter restarts from one.
- Check: "N3: intervalTurns 0 disables the nudge without disabling the service"
  - no interval means no review, and `Status()` still answers.
- Check: "N4: Reset clears one agent's counter and leaves the other alone" - a
  reset agent restarts at one; its next tick reaches the interval.
- Check: "N5: each agent counts independently" - two agents on one service do
  not share a counter.

## Fixtures

The shared Harness: the real built `Target/Library.js` class, the fake ctx, and
the `Make` constructor mount. The agents are bare object identities - the
counter is keyed by the agent, so an object is all it needs.

## Expected ledger strings (byte-exact)

The firing tick logs `lesson: due after 3 turns` (the message-only form; the
service appends ` (logFile <logFile>)`). The folder asserts the behavior, not
the line - the line is pinned in `Apply-And-Pending`.

## Expected count

5 PASS.
