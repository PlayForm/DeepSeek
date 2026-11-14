# Counter

This test verifies the following behavior.

## Intent

`Counter` is the declared monotonic counter the framework now owns: a sequence or revision that only moves forward, with `Next` the only way to advance and `Restore` the raise-only recovery.

It is its own folder because the counter carries `Resume`'s rule itself - a counter that reissued an id after a restart would corrupt the module's records - and because it replaces the by-hand increment and the by-hand recovery clauses in the packages that adopt it.

## Scenario

- Group: Counter - the declared monotonic counter (Next advances, Restore raises and never lowers).
    - Check (one ok group): the whole contract.
        - Leaf: a counter is born at the initial value (default 0, or the explicit floor).
        - Leaf: Next advances and returns the new value.
        - Leaf: a recovered value above the current one raises it.
        - Leaf: a recovered value below it never lowers it.
        - Leaf: two counters are independent (per instance, never module-level).

## Fixtures

None.

The test makes pure calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

None. The counter writes no line.

## Edge cases

- The initial value is an explicit floor: `Counter(5)` starts at 5.
- The rule is one-directional on purpose: a counter that moved down after a restart would reissue ids.
- Per instance, never module-level: a mount builds its own counter.

## Expected count

1 PASS.
