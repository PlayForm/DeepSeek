# Proof

This test verifies the following behavior.

## Intent

`Proof` is the mount proof every module writes once at apply: the `activated (...)` summary when the module is live, the byte-exact `disabled (enabled=false)` marker when its master switch is off.

It is its own folder because the marker is a contract string shared by every package in the family, where a wording change here silently changes every module's cold-mount ledger at once.

## Scenario

- Group: Proof - the mount proof (live summary, disabled marker, pair grammar).
    - Check (one ok group): the three shapes.
        - Leaf: the live summary joins the module's own pairs.
        - Leaf: the disabled marker is byte-exact.
        - Leaf: the pair grammar survives - the bare segment (an empty key), the empty-string value, and the absent (undefined) pair.

## Fixtures

None.

The test makes pure function calls against the REAL built `Target/Library.js`, with no fs, no ctx, and no factory.

## Expected ledger strings (byte-exact)

- `activated (bundle=0.2.1, cap=3)`
- `disabled (enabled=false)`
- `activated (anywhere mode, replacement=)`
- `activated ()`

## Edge cases

- A pair whose value is `undefined` is skipped.
- An empty key renders the value as a bare segment.
- An empty-string value is a PRESENT field, not an absent one.

## Expected count

1 PASS.
