# Monitors-Jobs - the wave-3 M-series runner tests

The D-series for the check runner: the dispatch through the SHIPPED G2
wrapper (one wrapper, two callers), the settle mapping, the honesty cluster,
the deadline kill, and the fail-open paths.

## Scenarios

- J1: the monitor job carries the spec from the design (kind `monitor`, label
  `monitor <setId> <path>`, the owner, outputLimitBytes 2048, the synthetic
  `monitor-<n>` call id), and the resolved shell spec keeps the governed path
  (the substituted command, workdir = dirname(path), timeoutMs <= 120000,
  `onExpiry: "none"`, the sandbox policy); `monitor check dispatched <path>
  <setId> -> <job-id>` is byte-exact.
- J2: an observed exit 0 folds a live clean result for the exact version;
  `monitor check settled <path> <setId> (<job-id>, exit 0)` is byte-exact.
- J3: the false-pass guard - a version bump with no settle starts no re-run,
  and a settle for an older version renders STALE, never clean.
- J4: a non-zero exit renders the problem with the captured head tail; the
  settled line carries the non-zero exit.
- J5: the head-keep tail mode keeps the earliest bytes (the diagnostic head);
  the default tail mode keeps the newest bytes (unchanged for the detach
  path).
- J6: a killed producer outcome maps to the infrastructure form
  (`producer:signal: SIGTERM`), never a code problem.
- J7: a check that the sandbox denies maps to `sandbox` and renders the
  denial form.
- J8: past `checkTimeoutMs` the registry receives the `monitor-deadline`
  kill; the settle maps to `killed:monitor-deadline`.
- J9: a start failure logs `monitor check failed <path> <setId> (start)`
  byte-exact; with a prior result the band keeps last-known and renders
  STALE; without one it stays `not run yet`.
- J10: a teardown settle records nothing and logs
  `monitor check lost <path> <setId> (teardown)`.
- J11: a check set that a volatile flip removes logs
  `monitor check unknown <setId>` and starts no job.
- J12: the slow schedule dispatches once per `slowCheckIntervalMs` at the
  assemble checkpoint only.
- J13: the fail-loud validation - `checkTimeoutMs` above the inline deadline
  and a watchlist reference to an unknown check set both fail at load.
- J14: the per-check-set `timeoutMs` caps the dispatch deadline.
- J15: the deep check (`live_monitor_check`) dispatches immediately and
  bypasses the debounce.

## Fixtures

The shared Harness plus the wave-3 fixtures: `FireObserved`, `FlipLive`,
`MonitorConfig`, `FakeJobsHub` (whose settled events carry the kind of the
started spec), `FakeShell`, and the wave-2 assemble checkpoint.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitor check dispatched <path> <setId> -> <job-id>`, `monitor check
settled <path> <setId> (<job-id>, exit <n>)`, `monitor check failed <path>
<setId> (start)`, `monitor check lost <path> <setId> (teardown)`,
`monitor check unknown <setId>`.

## Expected count

25 PASS.
