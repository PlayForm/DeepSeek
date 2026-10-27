# Refusal

What this test verifies.

## Intent

`Refusal` is the guard every package-rewriting module calls before it writes a new package.json: only the sections listed in `Section` (the dependency sections) may differ between the current and the proposed file.

It is its own folder because it is the write-permission contract of the family, where a loosened guard would let any module rewrite arbitrary package fields.

The refusal line it emits is a byte-identical ledger string.

This is section 4 of the ETS suite (the Classic arbiter section, byte-identical), moved verbatim.

## Scenario

- Group: Refusal - only the declared dependency sections may differ.
    - Check (one source ok group): "Refusal: the shared refusal guard (sections-only changes allowed)".
        - Leaf: a version bump inside `dependencies` (and nothing else) is allowed, which returns false and leaves the captured refusal lines empty (the negative control).
        - Leaf: a change to `scripts` is refused, which returns true.
        - Leaf: the captured refusal line is the byte-identical REFUSED string, naming the path and the changed section.

## Fixtures

- `RefusalLines` + `RAppend`: the capturing ledger seam.
- `Current` / `NextOk` / `NextBad`: three package.json bodies, identical except that `NextOk` bumps a dependency version (allowed) and `NextBad` changes `scripts.build` from "tsc" to "bun" (refused).
- `Section`: the real exported dependency-section list (imported from the same built Target, so the guard is exercised with the actual section list of the family).

## Expected ledger strings (byte-exact)

- `REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change`

## Edge cases

- Allowed change: a sections-only diff, with zero refusal lines captured.
- Refused change: exactly one refusal line, and it is the first captured line.
- The refusal line names the virtual path "/x/package.json", because no fs is touched and the guard is pure.

## Expected count

1 PASS.
