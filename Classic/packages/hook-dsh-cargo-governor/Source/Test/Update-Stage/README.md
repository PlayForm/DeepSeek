# Update-Stage

This file states what the test verifies.

## Intent

The suite covers the update stage with its gates, CLI mapping, and envelopes.

The Filter skip dispatches nothing for a fully chain-governed manifest, and the no-registry path
treats everything as public with the built-in default policy, the
`update: cargo upgrade upgrade --manifest-path ...` line, and the DONE line.

The cooldown gate gives `update stage skipped for <dir> (cooldown)` after a first dispatch inside the
window, and the in-flight gate allows one update run per directory while the P2 disposal aborts and
clears the in-flight run.

The circuit breaker counts the consecutive failures and writes the
`update stage paused for <dir> (2 consecutive failures >= 2)` line with no third dispatch.

The CLI argv mapping gives ONE `--exclude` pair per crate for the reject union chain deps, the `-p`
allow list, the `--compatible/--incompatible/--pinned` policy flags, and no comma form.

The digest line carries the JSON exit code suffix, appends the collected stdout to the ledger, and
preserves the ledger order, so governed comes before dispatched.

The failure path writes the per-invocation line and the FAILED line and increments the breaker.

The cargo-edit-unavailable paths cover the resolveExecutable failure, the exit 101 plus
no-such-command graceful path, and the contained no-seam node:child_process fallback.

The verifyCommand envelope covers the ok path through `/bin/sh -c` via the seam, the non-fatal exit
127 skip, and a failing verify that fails the stage.

The U2 stat-based refresh registers the Stash at `stat-v9` and re-emits with the same actor, and the
jobs envelope carries `kind: "governor-update"`, the label, the ABSENT owner key, the output piped to
Job.append, and the settlement mapping.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections 12-14.

## Scenario

- Group: the Filter skip and the no-registry dispatch.
    - Sub: "update: the Filter skip - a fully chain-governed manifest
      dispatches nothing"
    - Sub: "update: the no-registry path dispatches with the built-in default
      policy"
- Group: the gates.
    - Sub: "update: cooldown gate - `update stage skipped for ... (cooldown)`"
    - Sub: "update: in-flight gate + P2 disposal aborts and clears the
      in-flight run"
    - Sub: "update: circuit breaker - consecutive failures pause the stage"
- Group: the CLI mapping.
    - Sub: "CLI: argv - exclusionary level (reject union chain), -p allow,
      the policy flags"
    - Sub: "CLI: digest line, collected output appended, ledger order
      preserved"
    - Sub: "CLI: failure path - per-invocation line, FAILED line, breaker
      incremented"
    - Sub: "CLI: cargo-edit unavailable - resolveExecutable failure, exit
      101, and the no-seam fallback"
- Group: the verifyCommand envelope.
    - Sub: "verify: ok path - /bin/sh -c via the seam, the ledger lines"
    - Sub: "verify: exit 127 non-fatal; a failing verify fails the stage"
- Group: the refresh and jobs envelopes.
    - Sub: "U2: stat-based refresh after the update job - Stash + same-actor
      re-emit"
    - Sub: "jobs envelope: kind/label (unowned - owner key absent) +
      Job.append piping + the settlement mapping"

## Fixtures

The harness builds per-scenario worlds with the `subprocess` SeamStub and its outcome and stdout
knobs, `update-policy.json` and `registry.json` written per scenario, a hanging subprocess fake for
the in-flight gate, and a jobs service fake that records the started request and runs it
synchronously to collect the Job.append sink.

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

- The breaker scenario counts exactly two consecutive failures before the pause line and asserts no
  third dispatch.
- The verify scenario runs TWO subprocess calls, upgrade and then verify, and the exit code of the
  second distinguishes the non-fatal 127 from the fatal 3.
- The jobs envelope asserts that the owner KEY is absent in the uniform envelope, not merely falsy.

## Expected count

13 PASS.
