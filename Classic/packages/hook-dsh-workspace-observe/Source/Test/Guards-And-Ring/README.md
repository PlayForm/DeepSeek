# Guards-And-Ring - the guard chain and the bounded ring tests

The listener's guard chain (the own-actor identity check, the exclusion, the
include allowlist), the latest-overwrite rule, the ring cap with its
byte-exact ledger line, the malformed-event containment, and the volatile
flip of the ring bound.

## Scenarios

- G1: an excluded path is ignored with the byte-exact
  `ignored <path> (excluded)` line (logger and durable file); the event
  records nothing and moves no counter; the plain segment form (no glob)
  excludes too.
- G2: an event whose actor IS the hook's own actor object is ignored with
  the byte-exact `ignored <path> (own actor)` line.
- G3: with a non-empty include list, a non-matching path is ignored
  (`not included`) and a matching path records normally; an empty include
  list restricts nothing.
- G4: the ring caps at `maxStamps`, the oldest stamps are dropped, each
  drop is ledgered byte-exactly (`capped <path> (maxStamps <n>)`), the
  latest map keeps every path, and the counter keeps running.
- G5: the latest stamp per path overwrites; both stamps stay in the ring,
  newest first.
- G6: a malformed event (no target, no observation) never throws - it is
  ledgered byte-exactly as `failed unknown (malformed event: displayPath is
  not a string)` and the listener keeps working after it.
- G7: the volatile flip - committing a new `maxStamps` into the config cell
  and dispatching `loader/volatile-update` refreshes `State.MaxStamps` in
  place (no remount) and the new bound applies on the next events.
- G8: the repeat-event guard (Function/Duplicate) - a repeat event for the
  same path carrying the same version within the coalescing window is
  dropped silently (one stamp, the sequence does not move, the latest stamp
  is untouched); a different version is processed normally; the same version
  after the window (via the `State.Now` clock seam) is processed again.

## Fixtures

The shared Harness plus `Flip` (the cosmokit volatile-cell write symbol, the
same mechanism the live loader uses) and the `State.Now` clock seam (the
monitor's pattern; no real timer anywhere).

## Expected ledger strings (byte-exact, `observe: ` prefix)

`ignored <path> (excluded)`, `ignored <path> (own actor)`, `ignored <path>
(not included)`, `capped <path> (maxStamps <n>)`, `failed unknown (malformed
event: displayPath is not a string)`.

## Expected count

18 PASS.
