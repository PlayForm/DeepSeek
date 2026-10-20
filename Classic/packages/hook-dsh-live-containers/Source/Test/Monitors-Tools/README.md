# Monitors-Tools - the wave-3 M-series tool tests

The two monitor tool surfaces (the escape hatch, R3 point 6): live_monitor
and live_monitor_check. Read-only semantics - the tools enroll, list, opt
out and dispatch; they never gate an edit.

## Scenarios

- T1: `live_monitor path=<p>` with an empty watchlist classifies from the
  catalog globs and logs `monitor enrolled <path> (by <agent>)` byte-exact;
  the rendered text is `monitored <path> (<n> checks) - the band renders in
  the live section.`
- T2: `agent=<sessionId>` targets another session - the enrollment lands in
  the named session's monitor set (the parent-into-child mechanics).
- T3: `off=<glob>` retires every matching enrolled file (the closing lines
  render at the next assembly) and logs `monitor off <glob>` byte-exact;
  the glob joins the per-agent opt-outs.
- T4: `list=true` renders the enrolled files with their primary outcome
  one-liners.
- T5: `live_monitor_check` starts one job per check set, bypassing the
  debounce, and the rendered text carries the job ids:
  `[monitor] deep check started <path> (<n> checks) - job_output <ids> for
  the full tail.`
- T6: at full admission the deep check coalesces into pending records and
  answers `[monitor] deep check pending <path> (<n> checks) - admission
  full; the band updates when it runs.`
- T7: the deep check dispatches despite an unelapsed debounce window.

## Fixtures

The shared Harness (the registering tools service captures the
definitions, so the tests invoke the tools exactly as the registry would)
plus the wave-3 fixtures.

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`monitor enrolled <path> (by <agent>)`, `monitor retired <path>`,
`monitor off <glob>`.

## Expected count

11 PASS.
