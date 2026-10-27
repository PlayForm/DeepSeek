# State-And-Activation

This test verifies the following behavior.

## Intent

The pinner's apply-time wiring is the runtime posture in one place.

The REAL factory service is instantiated against the fake ctx and registered as `ctx.pluginFactory`, `apply` returns nothing, and the Wire registers exactly one `fs/observed` hook.

The factory-built state includes the pinner's `Section` field and the `pin-policy.json` union-discovery sidecar name.

The activation's durable `activated (pinner, ...)` ledger line has a byte-identical shape with the `hook-dsh-pinner-package: ` logger prefix.

The Attach P1/P2/P5 effects are present, with the in-flight disposal verified live, and the storage-less journal sink silently retires.

A drift in any of these changes every downstream behavior, so it is its own folder.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` section 3.

## Scenario

- Group: the real service and the apply contract.
    - Sub: "the REAL factory service instantiated against the fake ctx"
    - Sub: "apply returns undefined; Wire registered the fs/observed hook"
    - Sub: "State: factory-built shared shape + the pinner's Section field + PolicyName"
    - Sub: "activation proof: the durable activated (pinner, ...) ledger line + the logger prefix"
    - Sub: "Attach: P1/P2/P5 labels + the in-flight disposal effect"
    - Sub: "Journal: silent skip without a storage domain"

## Fixtures

The harness Boot uses the fake ctx with the REAL-TOKEN fs backend (real temp-dir I/O whose version tokens enforce the replaceIfVersion guard), the REAL factory constructed against it, and one pinner apply with the source suite's main config (`log: true, logFile: <ledger-main.log>`).

The P2 disposal is exercised live with an AbortController seeded into `st.Inflight`.

## Expected ledger strings (byte-identical)

- `[ISO] activated (pinner, logFile=<.../ledger-main.log>, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])` (the regex form; U+2026 in the check label)
- The logger line `hook-dsh-pinner-package: activated (pinner, logFile=<...>, ...)` byte-identical.

## Edge cases

- `apply` returning a value would kill event delivery, so the `undefined` assertion is the negative control.
- P9 probes the subprocess seam once and finds it absent, so `st.Subprocess === undefined` while the probe went through `ctx.get`.
- The storage-less Journal call must not grow the queue (the P5-absent retirement).

## Expected count

6 PASS.
