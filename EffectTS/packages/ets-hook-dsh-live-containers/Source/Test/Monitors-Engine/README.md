# Monitors-Engine - the wave-3 M-series engine tests

The live file monitor engine: the enrollment through the fs/observed observer (L11, watchlist-gated),
the classification, the debounce coalescing, the admission coalesce (coalesce-not-queue), the
retirement, the overflow collapse and the per-glob opt-out.

Every timing transition is a clock advance plus a checkpoint (an assemble pass or an observed
event), never a sleep.

## Scenarios

- E1: a watchlist-matching write enrolls the file with the entry's check
  sets and the observed version truth; `monitor enrolled <path> (by
  <writer>)` byte-exact.
- E2: a write to a non-watchlisted, non-enrolled file creates NO band (the
  R3 3.1 rule - no scan, no watch-all).
- E3: the classification - the explicit `live_monitor <path>` with an empty
  watchlist classifies from the catalog globs; the most-specific watchlist
  glob wins; tied globs fall to the later entry.
- E4: three edits within the debounce window coalesce into ONE pending
  record; the clock crossing the window dispatches exactly one job (one per
  check set).
- E5: with `maxMonitorJobs: 1` the second pending record STAYS while the
  first job is live (coalesce-not-queue); the freed admission dispatches it
  at the next checkpoint after the settle.
- E6: past `retireMs` the closing line renders once (byte-exact form), the
  ledger logs `monitor retired <path>`, and the next assembly renders
  nothing (withdrawn).
- E7: with `maxMonitors: 1` the overflowed file renders the one-line
  collapsed form and the summary counts all files; `monitors overflow <n>`
  fires when the count changes.
- E8: `live_monitor off <glob>` retires the matches (the closing line at
  the next assembly, `monitor off <glob>` byte-exact) and a later write
  does NOT re-enroll.
- Volatile flips: with `monitors: "off"` nothing enrolls (the IDLE-forever
  posture); the flip to "on" lands without a remount (the P10 volatile
  refresh), and a watchlist entry change lands on the next observed event.

## Fixtures

The shared Harness plus the wave-3 fixtures: `FireObserved` (the fs/observed trigger through the L11
observer), `FlipLive` (the volatile commit plus the loader event), `MonitorConfig` (the wave-3 config
shape), `FakeJobsHub` and `FakeShell` (the registry and the governed path), and the wave-2 assemble
checkpoint (`WaveAssemble`).

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitor enrolled <path> (by <agent>)`, `monitor check dispatched <path>
<setId> -> <job-id>`, `monitor retired <path>`, `monitors overflow <n>`,
`monitor off <glob>`.

## Expected count

22 PASS.
