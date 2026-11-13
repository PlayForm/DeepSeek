# Coalesce

This test verifies the following behavior.

## Intent

`Coalesce` is the repeat-event guard every filesystem-observing module shares: it keeps one entry per path in the caller's Seen map (the version plus the clock stamp) and answers whether the incoming event is a repeat of a state that was already processed.

It is its own folder because the window, the cap and the "a missing entry always processes" rule are a contract shared by four workspace packages, where a change here silently changes every module's guard at once.

## Scenario

- Group: Coalesce - the repeat-event guard (window, cap, last-version-wins).
    - Check (one ok group): the four rules.
        - Leaf: the first sighting of a path processes.
        - Leaf: the same version inside the window is dropped.
        - Leaf: a different version processes, and the same version outside the window processes.
        - Leaf: a first sighting of another path processes, the map is capped, and a first sighting past the cap still processes.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The coalescer writes no line: a dropped repeat is silent by design.

## Edge cases

- A different version always processes, so the last distinct version always wins.
- A missing entry always processes, so the cap can never skip a first sighting.
- The clock is injected, so no test depends on the wall clock.

## Expected count

1 PASS.
