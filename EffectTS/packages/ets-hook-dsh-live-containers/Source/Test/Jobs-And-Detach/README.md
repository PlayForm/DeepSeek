# Jobs-And-Detach - the J-series smoke tests

The live tool-call transform (CAN-1, I1 acceptance additions, I2 AWAIT-MARKER): the pre-execute
decision arm + the execute carrier arm, the exact re-dispatch spec, the fabricated result contract,
the dedup, the live-timeout, the awaited skip, the capacity path, the history heuristics and the
`{"__await":true` first-key marker.

## Scenarios

- J1: a `cargo build` bash call under `mode: "long-running"` detaches - the
  fake registry gained one `start` with the exact re-dispatch spec (command,
  resolved workdir, dshEnv, sandboxPolicy, `onExpiry: "none"`), the fabricated
  result's text is the byte-exact inline marker, `isError: false`, and the
  downstream `next` was NOT called by the execute arm (the veto).
- J2: the write/edit family under `mode: "all"` runs INLINE synchronously -
  the pre-execute arm passes through (no start), the execute arm passes
  through, the downstream decision is untouched (the I1 12.1 acceptance).
- J3: a detached command inherits the sandbox - the resolved spec carries the
  SAME policy object the policy service resolves for the session, and the
  producer outcome maps the process's own settled status (the I1 12.2
  acceptance (a), smoke-side pin: the harness renders the denial; the plugin
  preserves the governed path).
- J4: a start failure yields inline execution + `start failed <tool> ->
  inline` and no orphan job; a thrown post-start error (the tag write fails)
  yields `marker failed <job-id> -> inline` + `transform failed <tool> ->
  inline` + the just-started job killed with reason `marker-failed` (the I1
  12.2 acceptance (b)).
- J5: no completion frame ever appears without a settled event; one settled
  event -> exactly one completed frame in the pending text; the logged
  snapshot drains it (withdrawal), the next provider read returns the stable
  delivered tail (the I3/I4 carrier).
- J6: a re-issued identical command while live returns the SAME job id with
  the already-running line and starts NO second job (dedup).
- J7: the fake clock advanced past `liveTimeoutMs` -> the registry's kill
  received reason `live-timeout` (fired at the next assemble checkpoint).
- J8: a settled event with `awaited: true` -> no frame, ledger
  `completion skipped <job-id> (awaited)`.
- J9: the capacity path - `maxLivePerAgent` reached -> inline +
  `capacity full <owner> -> inline`.
- J10: the min-latency/history heuristics - a recorded short duration keeps
  the same-prefix command inline; a recorded long duration detaches it with
  no marker (the pure history path).
- J11: the `{"__await":true` first-key marker -> inline +
  `await marker -> inline <tool>`; the marker key survives in the arguments
  (nothing stripped); a first-key `{"__await":false` is NOT a marker.
- Owner-gone/teardown: `owner gone <job-id>`, nothing pending.

## Fixtures

The shared Harness (the fake ctx + the REAL factory + the REAL built Target + the fake clock) plus
the wave-2 fixtures: `FakeJobsHub` (the registry with the captured specs and the settle trigger),
`FakeShell` + `FakeProcess` (the observed streams), `FakePolicy`, `MakeWave` (the services attached),
and `Pending` (the completion provider read through the registered dynamic context).

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`detached bash -> <job-id>`, `dedup bash -> <job-id>`, `start failed bash ->
inline`, `marker failed <job-id> -> inline`, `transform failed bash -> inline`,
`capacity full agent-a -> inline`, `await marker -> inline bash`, `escalation
-> inline bash`, `completion rendered <n> bytes`, `completion skipped <job-id>
(awaited)`, `withdrawn <job-id> (completed)`, `owner gone <job-id>`.

## Expected count

27 PASS.
