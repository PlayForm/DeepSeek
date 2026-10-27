# Watch-Sweep-Clock - the clock discipline tests

The only time source of the monitor (the own Clock seam of the module through the `State.Now` probe), the event-driven deadline scan of the sweep, the byte-exact sweep line, the 0-interval rule, the quiet-ledger discipline, the watch cap, the volatile flip, and the no-timer invariant over the BUILT library.

## Scenarios

- C1: without an override the Clock falls back to the real clock (a finite stamp, and production leaves `State.Now` undefined).
- C2: with a fake clock the watch stamps come from the Clock of the module (not the wall clock); the overdue entry is swept at the next event with the byte-exact `sweep <path> (<age>ms)` line (logger and durable file); the `lastSweepAt`/`nextSweepAt`/`sweeps` of the entry advance and the pass counts once (`Sweeps`, `LastSweepAt`); a fresh watch re-arms the deadline; and two overdue entries sweep oldest-first in one pass.
- C3: with a 0 debounce and a 0 interval the first event sweeps its own entry (age 0) and every checkpoint sweeps again, which is "0 sweeps at every checkpoint".
- C4: the quiet-ledger discipline, where an all-quiet tree costs no sweep lines and no pass count.
- C5: the watch cap drops the OLDEST entry (the map head) and ledgers each drop byte-exactly (`capped <path> (maxWatch <n>)`, logger and durable).
- C6: the volatile flip, where committing a new `maxWatch` into the config cell and dispatching `loader/volatile-update` refreshes `State.MaxWatch` in place (no remount) and the new bound applies on the next events.
- C7: the built `Target/Library.js` contains NO setTimeout / setInterval / setImmediate (the no-real-timers rule), while the clock fallback to `Date.now()` is present.

## Fixtures

The shared Harness plus the `State.Now` clock seam and `Flip` (the cosmokit volatile-cell write symbol).

## Expected ledger strings (byte-exact, `monitor: ` prefix)

`sweep <path> (<age>ms)`, `capped <path> (maxWatch <n>)`.

## Expected count

15 PASS.
