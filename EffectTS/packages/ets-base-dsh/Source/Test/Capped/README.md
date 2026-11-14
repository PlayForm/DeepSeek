# Capped

This test verifies the following behavior.

## Intent

`Capped` composes the byte-exact `capped <id> (max<Name> <cap>)` line a bounded module writes when its ring drops an entry.

It is its own folder because the template is a contract string shared by five modules, where a wording change here silently changes every module's eviction line at once.

## Scenario

- Group: Capped - the eviction line (id, bound name, cap).
    - Check (one ok group): the three shapes.
        - Leaf: a path id with the stamp bound.
        - Leaf: an id with the binding bound.
        - Leaf: a zero cap still renders.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

- `capped /repo/src/a.ts (maxStamps 3)`
- `capped ap-1 (maxBindings 2)`
- `capped b1 (maxBatches 0)`

## Edge cases

- The bound name is spliced after `max`, so the caller passes `Stamps`, not `maxStamps`.
- A zero cap renders as `0`.

## Expected count

1 PASS.
