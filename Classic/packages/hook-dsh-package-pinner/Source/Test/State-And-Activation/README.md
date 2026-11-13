# State-And-Activation

This test verifies the following behavior.

## Intent

The pinner's apply-time wiring is the runtime posture in one place.

The REAL factory service is instantiated against the fake ctx and registered as `ctx.pluginFactory`, `apply` returns nothing, and the Wire registers exactly one `fs/observed` hook.

The factory-built state includes the pinner's `On` master switch (config `enabled`), `Section` field and the `pin-policy.json` union-discovery sidecar name.

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
    - Sub: "disabled mount: every surface still registers and the ledger line is the byte-exact disabled line (no early return)"
        - a SECOND apply with enabled=false on the same ctx: the fs/observed
          listener and the P1/P2/P5 effects STILL register, exactly one new
          ledger line lands in the `[ISO] disabled (enabled=false)` shape, the
          logger line `hook-dsh-pinner-package: disabled (enabled=false)`
          carries the State.Module prefix, and there is no activation proof
    - Sub: "disabled mount: a call passes through with ZERO new ledger lines"
        - the disabled mount's own wired listener fires on an excluded target
          (`node_modules/probe/package.json` - the deterministic fs-free probe:
          an ENABLED call would land `skipped (excluded) ...`) and the ledger
          does not move (the call-time master switch)
    - Sub: "disabled mount: flipping enabled acts on the very next call - and back"
        - On=true then the next call lands the `skipped (excluded) ...` line
          (exactly one new line); On=false again then the next call is silent
          (a fresh version token keeps the Stash gate out of the way - the
          master switch is the only gate standing)

## Fixtures

The harness Boot uses the fake ctx with the REAL-TOKEN fs backend (real temp-dir I/O whose version tokens enforce the replaceIfVersion guard), the REAL factory constructed against it, and one pinner apply with the source suite's main config (`log: true, logFile: <ledger-main.log>`).

The P2 disposal is exercised live with an AbortController seeded into `st.Inflight`.

## Expected ledger strings (byte-identical)

- `[ISO] activated (pinner, logFile=<.../ledger-main.log>, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])` (the regex form; U+2026 in the check label)
- The logger line `hook-dsh-pinner-package: activated (pinner, logFile=<...>, ...)` byte-identical.
- The disabled mount's single ledger line, ISO-timestamped, in the shape
  `[ISO] disabled (enabled=false)` (byte-exact), plus the logger line
  `hook-dsh-pinner-package: disabled (enabled=false)`.
- The flipped-on call's `[ISO] skipped (excluded) <Root>/node_modules/probe/package.json`
  line (the module's exclusion string, byte-exact).

## Edge cases

- `apply` returning a value would kill event delivery, so the `undefined` assertion is the negative control.
- P9 probes the subprocess seam once and finds it absent, so `st.Subprocess === undefined` while the probe went through `ctx.get`.
- The storage-less Journal call must not grow the queue (the P5-absent retirement).

## Expected count

9 PASS.
