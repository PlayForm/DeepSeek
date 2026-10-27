# Watch-Sweep-Clock - the clock discipline tests

This folder covers the monitor's only time source (the module's own Clock seam through the `State.Now` probe), the sweep's event-driven deadline scan, the byte-exact sweep line, the 0-interval rule, the quiet-ledger discipline, the watch cap, the volatile flip, and the no-timer invariant over the BUILT library.

## Scenarios

- C1: without an override the Clock falls back to the real clock (a finite stamp; production leaves `State.Now` undefined).
- C2: with a fake clock the watch stamps come from the module's Clock (not the wall clock), the overdue entry is swept at the next event with the byte-exact `sweep <path> (<age>ms)` line (logger and durable file), the entry's `lastSweepAt`/`nextSweepAt`/`sweeps` advance and the pass counts once (`Sweeps`, `LastSweepAt`), a fresh watch re-arms the deadline, and two overdue entries sweep oldest-first in one pass.
- C3: with a 0 debounce and a 0 interval the first event sweeps its own entry (age 0) and every checkpoint sweeps again, which is "0 sweeps at every checkpoint".
- C4: the quiet-ledger discipline holds: an all-quiet tree costs no sweep lines and no pass count.
- C5: the watch cap drops the OLDEST entry (the map head) and ledgers each drop byte-exactly (`capped <path> (maxWatch <n>)`, logger and durable).
- C6: the volatile flip commits a new `maxWatch` into the config cell and dispatches `loader/volatile-update`, which refreshes `State.MaxWatch` in place (no remount) and applies the new bound on the next events.
- C7: the built `Target/Library.js` contains NO setTimeout / setInterval / setImmediate (the no-real-timers rule) while the clock fallback to `Date.now()` is present.

## Fixtures

The fixtures use the shared Harness plus the `State.Now` clock seam and `Flip` (the cosmokit volatile-cell write symbol).

## Expected ledger strings (byte-exact, `monitor: ` prefix)

`sweep <path> (<age>ms)`, `capped <path> (maxWatch <n>)`.

## Expected count

15 PASS.
