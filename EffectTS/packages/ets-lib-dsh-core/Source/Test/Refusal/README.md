# Refusal

What this test verifies.

## Intent

`Refusal` is the guard every package-rewriting module calls before writing a new
package.json: only the sections listed in `Section` (the dependency sections) may
differ between the current and the proposed file. It is its own folder because it
is the family's write-permission contract - a loosened guard would let any module
rewrite arbitrary package fields. The refusal line it emits is a byte-identical
ledger string. This is the ETS suite's section 4 (the Classic arbiter section,
byte-identical), moved verbatim.

## Scenario

- Group: Refusal - only the declared dependency sections may differ.
    - Check (one source ok group): "Refusal: the shared refusal guard
      (sections-only changes allowed)".
        - Leaf: a version bump inside `dependencies` (and nothing else) is
          allowed - returns false, and the captured refusal lines stay empty
          (the negative control).
        - Leaf: a change to `scripts` is refused - returns true.
        - Leaf: the captured refusal line is the byte-identical REFUSED string,
          naming the path and the changed section.

## Fixtures

- `RefusalLines` + `RAppend`: the capturing ledger seam.
- `Current` / `NextOk` / `NextBad`: three package.json bodies - identical except
  `NextOk` bumps a dependency version (allowed) and `NextBad` changes
  `scripts.build` from "tsc" to "bun" (refused).
- `Section`: the real exported dependency-section list (imported from the same
  built Target - the guard is exercised with the family's actual section list).

## Expected ledger strings (byte-exact)

- `REFUSED rewrite of /x/package.json: non-dependency section "scripts" would change`

## Edge cases

- Allowed change: sections-only diff, zero refusal lines captured.
- Refused change: exactly one refusal line, and it is the first captured line.
- The refusal line names the virtual path "/x/package.json" (no fs is touched -
  the guard is pure).

## Expected count

1 PASS.
