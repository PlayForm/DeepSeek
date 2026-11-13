# SuggestRing

This test verifies the following behavior.

## Intent

`SuggestRing` is the per-agent cooldown and dedupe machine the suggester hooks share: a WeakMap keyed on the Agent object (one shared default key when a call carries no agent) holding which families are cooling, which dedupe keys were already noted this turn, how many notes and calls the agent has, and the open note the follow-through watches. The state and the companion predicate are the caller's own; the window is the caller's per call, counted in judged calls, never in time.

It is its own folder because the ring is the state machine behind the suggester family's cooldown, dedupe and follow-through verdicts, where a drift between the family's copies silently changes which note is emitted, followed or rejected.

## Scenario

- Group: SuggestRing - the per-agent ring (keyed per agent, the caller's state and predicate).
    - Check (one ok group): the eight-method contract over the caller's own state and predicate.
        - Leaf: the same agent returns the same state, distinct agents hold distinct states, and a call without an agent shares the one default state.
        - Leaf: Touch records the judged path and increments the call count.
        - Leaf: Mark cools a family at age zero, keeps the dedupe key and moves the note count.
        - Leaf: Tick ages every cooling family by one judged call and drops the entries whose age passes the window.
        - Leaf: Open stores the open note, Follow answers only when the judged path names a companion (through the caller's predicate) and closes the note, and Age closes the note when its age reaches the window.
        - Leaf: Reset clears the ring back to its fresh shape.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The ring writes no line.

## Edge cases

- A `undefined` or `null` key shares the one default state, so the no-agent path still works.
- The window is counted in calls, never in time: the test passes the window as an argument, and no clock or timer exists.
- The state and the companion predicate are the caller's own: the core never imports the packages' `Match` or their state types.

## Expected count

1 PASS.
