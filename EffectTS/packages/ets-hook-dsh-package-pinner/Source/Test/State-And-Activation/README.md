# State-And-Activation

What this test verifies.

## Intent

The apply-time wiring of the pinner is the runtime posture in one place.

The REAL factory service is instantiated against the fake ctx and registered as `ctx.pluginFactory`.

`apply` returns nothing, and the Wire registers exactly one `fs/observed` hook.

The factory-built state carries the `Section` field of the pinner and the union-discovery sidecar name `pin-policy.json`.

The activation writes its durable `activated (pinner, ...)` ledger line in byte-identical shape with the `hook-dsh-pinner-package: ` logger prefix.

The Attach P1/P2/P5 effects follow, with the in-flight disposal verified live, and the storage-less journal sink silently retires.

A drift in any of these changes every downstream behavior, so it is its own folder.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` section 3.

## Scenario

- Group: the real service and the apply contract.
    - Check: "the REAL factory service instantiated against the fake ctx".
    - Check: "apply returns undefined; Wire registered the fs/observed hook".
    - Check: "State: factory-built shared shape + the pinner's Section field + PolicyName".
    - Check: "activation proof: the durable activated (pinner, ...) ledger line + the logger prefix".
    - Check: "Attach: P1/P2/P5 labels + the in-flight disposal effect".
    - Check: "Journal: silent skip without a storage domain".

## Fixtures

The harness Boot holds the fake ctx with the REAL-TOKEN fs backend (real temp-dir I/O whose version tokens enforce the replaceIfVersion guard), the REAL factory constructed against it, and one pinner apply with the main config of the source suite (`log: true, logFile: <ledger-main.log>`).

The P2 disposal is exercised live with an AbortController seeded into `st.Inflight`.

## Expected ledger strings (byte-identical)

- `[ISO] activated (pinner, logFile=<.../ledger-main.log>, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])` (the regex form; U+2026 in the check label)
- The logger line `hook-dsh-pinner-package: activated (pinner, logFile=<...>, ...)` byte-identical.

## Edge cases

- `apply` returning a value would kill event delivery, so the `undefined` assertion is the negative control.
- P9: the subprocess seam is probed once and is absent, so `st.Subprocess === undefined` while the probe went through `ctx.get`.
- The storage-less Journal call must not grow the queue (the P5-absent retirement).

## Expected count

6 PASS.
