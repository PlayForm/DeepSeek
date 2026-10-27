# Jobs-And-Detach - the J-series smoke tests

The live tool-call transform (CAN-1, I1 acceptance additions, I2 AWAIT-MARKER):
the pre-execute decision arm and the execute carrier arm, the exact re-dispatch
spec, the fabricated result contract, the dedup, the live-timeout, the awaited
skip, the capacity path, the history heuristics, and the `{"__await":true`
first-key marker.

## Scenarios

- J1: a `cargo build` bash call under `mode: "long-running"` detaches - the
  fake registry records one `start` with the exact re-dispatch spec (command,
  resolved workdir, dshEnv, sandboxPolicy, `onExpiry: "none"`); the text of the
  fabricated result is the byte-exact inline marker; `isError: false`; and the
  execute arm did NOT call the downstream `next` (the veto).
- J2: the write/edit family under `mode: "all"` runs INLINE and synchronously -
  the pre-execute arm passes through (no start), the execute arm passes
  through, and the downstream decision stays untouched (the I1 12.1
  acceptance).
- J3: a detached command inherits the sandbox - the resolved spec carries the
  SAME policy object that the policy service resolves for the session, and the
  producer outcome maps the settled status of the process itself (the I1 12.2
  acceptance (a); smoke-side pin: the harness renders the denial, and the
  plugin keeps the governed path).
- J4: a start failure gives inline execution plus `start failed <tool> ->
  inline` and no orphan job; a post-start error that is thrown (the tag write
  fails) gives `marker failed <job-id> -> inline` plus `transform failed
  <tool> -> inline` plus the job that just started, killed with reason
  `marker-failed` (the I1 12.2 acceptance (b)).
- J5: a completion frame never appears without a settled event; one settled
  event gives exactly one completed frame in the pending text; the logged
  snapshot drains it (withdrawal), and the next provider read returns the
  stable delivered tail (the I3/I4 carrier).
- J6: an identical command that is issued again while live returns the SAME
  job id with the already-running line and starts NO second job (dedup).
- J7: when the fake clock moves past `liveTimeoutMs`, the kill from the
  registry receives reason `live-timeout` (fired at the next assemble
  checkpoint).
- J8: a settled event with `awaited: true` gives no frame and the ledger line
  `completion skipped <job-id> (awaited)`.
- J9: the capacity path - when `maxLivePerAgent` is reached, the call runs
  inline plus `capacity full <owner> -> inline`.
- J10: the min-latency/history heuristics - a recorded short duration keeps the
  command with the same prefix inline; a recorded long duration detaches it
  with no marker (the pure history path).
- J11: the `{"__await":true` first-key marker gives inline plus `await marker
  -> inline <tool>`; the marker key stays in the arguments (nothing is
  stripped); a first-key `{"__await":false` is NOT a marker.
- Owner-gone/teardown: `owner gone <job-id>`, with nothing pending.

## Fixtures

The shared Harness (the fake ctx, the REAL factory, the REAL built Target, and
the fake clock) plus the wave-2 fixtures: `FakeJobsHub` (the registry with the
captured specs and the settle trigger), `FakeShell` plus `FakeProcess` (the
observed streams), `FakePolicy`, `MakeWave` (the attached services), and
`Pending` (the completion provider that is read through the registered dynamic
context).

## Expected ledger strings (byte-exact, `live-containers: ` prefix)

`detached bash -> <job-id>`, `dedup bash -> <job-id>`, `start failed bash ->
inline`, `marker failed <job-id> -> inline`, `transform failed bash -> inline`,
`capacity full agent-a -> inline`, `await marker -> inline bash`, `escalation
-> inline bash`, `completion rendered <n> bytes`, `completion skipped <job-id>
(awaited)`, `withdrawn <job-id> (completed)`, `owner gone <job-id>`.

## Expected count

27 PASS.
