# Update-Stage

What this test verifies.

## Intent

The update stage and its gates, CLI mapping and envelopes: the Filter skip
(a fully chain-governed manifest dispatches nothing); the no-registry path
(everything public, the built-in default policy, the `update: cargo upgrade
upgrade --manifest-path ...` line and the DONE line); the cooldown gate
(`update stage skipped for <dir> (cooldown)` after a first dispatch inside
the window); the in-flight gate (one update run per directory; the P2
disposal aborts and clears the in-flight run); the circuit breaker
(consecutive failures counted and the `update stage paused for <dir>
(2 consecutive failures >= 2)` line with no third dispatch); the CLI argv
mapping (ONE `--exclude` pair per crate for reject union chain deps, the
`-p` allow list, the `--compatible/--incompatible/--pinned` policy flags, no
comma form); the digest line (the JSON exit code suffix, the collected
stdout appended to the ledger, the ledger order preserved - governed before
dispatched); the failure path (the per-invocation line, the FAILED line, the
breaker incremented); the cargo-edit-unavailable paths (the
resolveExecutable failure, the exit 101 + no-such-command graceful path, and
the no-seam node:child_process fallback contained); the verifyCommand
envelope (the ok path through `/bin/sh -c` via the seam, the exit 127
non-fatal skip, and a failing verify failing the stage); the U2 stat-based
refresh (the Stash registered at `stat-v9`, the re-emit with the same actor);
and the jobs envelope (`kind: "governor-update"`, the label, the owner key
ABSENT, the output piped to Job.append, the settlement mapping). The
assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections
12-14.

## Scenario

- Group: the Filter skip and the no-registry dispatch.
    - Sub: "update: the Filter skip — a fully chain-governed manifest
      dispatches nothing"
    - Sub: "update: the no-registry path dispatches with the built-in default
      policy"
- Group: the gates.
    - Sub: "update: cooldown gate — `update stage skipped for ... (cooldown)`"
    - Sub: "update: in-flight gate + P2 disposal aborts and clears the
      in-flight run"
    - Sub: "update: circuit breaker — consecutive failures pause the stage"
- Group: the CLI mapping.
    - Sub: "CLI: argv — exclusionary level (reject union chain), -p allow,
      the policy flags"
    - Sub: "CLI: digest line, collected output appended, ledger order
      preserved"
    - Sub: "CLI: failure path — per-invocation line, FAILED line, breaker
      incremented"
    - Sub: "CLI: cargo-edit unavailable — resolveExecutable failure, exit
      101, and the no-seam fallback"
- Group: the verifyCommand envelope.
    - Sub: "verify: ok path — /bin/sh -c via the seam, the ledger lines"
    - Sub: "verify: exit 127 non-fatal; a failing verify fails the stage"
- Group: the refresh and jobs envelopes.
    - Sub: "U2: stat-based refresh after the update job — Stash + same-actor
      re-emit"
    - Sub: "jobs envelope: kind/label (unowned — owner key absent) +
      Job.append piping + the settlement mapping"

## Fixtures

Per-scenario harness worlds with the `subprocess` SeamStub (outcome and
stdout knobs), `update-policy.json` and `registry.json` written per
scenario, a hanging subprocess fake for the in-flight gate, and a jobs
service fake that records the started request and runs it synchronously to
collect the Job.append sink.

## Expected ledger strings (byte-identical)

- `update stage dispatched for <dir> (cargo via cargo, built-in default
  policy)`
- `update stage dispatched for <dir> (cargo via cargo, policy <path>)`
- `update: using built-in default policy`
- `update: DONE — pins bumped per policy` (U+2014)
- `update stage skipped for <dir> (cooldown)`
- `update stage skipped for <dir> (in-flight)`
- `update stage paused for <dir> (2 consecutive failures >= 2)` (the source
  string uses U+2265)
- `update: cargo upgrade failed (base) status 1`
- `update: FAILED — see lines above` (U+2014)
- `update stage FAILED (1) for <dir>; consecutive=1`
- `update: cargo-edit unavailable: resolveExecutable(cargo) failed: no cargo
  here`
- `update: cargo-edit unavailable: error: no such command: upgrade`
- `update: running verifyCommand: cargo check`
- `update: verifyCommand ok`
- `update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal`
  (U+2014)
- `update: verifyCommand failed (status 3)`
- `update: cargo upgrade upgrade --manifest-path <path> {"exitCode":0}` (the
  digest suffix)

## Edge cases

- The breaker scenario counts exactly two consecutive failures before the
  pause line and asserts no third dispatch.
- The verify scenario runs TWO subprocess calls (upgrade then verify); the
  second's exit code distinguishes the non-fatal 127 from the fatal 3.
- The jobs envelope asserts the owner KEY is absent (the uniform envelope),
  not merely falsy.

## Expected count

13 PASS.
