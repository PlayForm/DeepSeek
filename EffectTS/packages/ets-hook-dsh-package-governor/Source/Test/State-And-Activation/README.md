# State-And-Activation

What this test verifies.

## Intent

The apply-time wiring of the governor is the whole runtime posture in one place.

`apply` returns nothing, the state probe is attached to the context, every state field is factory-built from the config cells, and the machinery collections are fresh.

The Attach step registers the P1 jobs controller and the P2/P5 lifecycle effects.

The Wire registers exactly one `fs/observed` listener.

The activation journals its durable proof line in the byte-identical `[ISO] activated (anywhere mode, ...)` shape.

A drift in any of these changes every downstream behavior, so it is its own folder.

The assertions are moved verbatim from `Classic/smokes/governor-smoke.mjs` section 3.

## Scenario

- Group: the apply contract and the factory-built state.
    - Check: "apply: returns nothing; the state exposed via ctx.__hookDshGovernorPackageState".
    - Check: "State: Module + Tool <- mutationTools (cell unwrapped by the factory)".
    - Check: "State: module fields via the setup map (Strict/Wait/Limit/Binary/Mode)".
        - includes Mode === "programmatic" (the pre-override default)
    - Check: "State: shared mappings (Policy/policyFile, Ledger/logFile, Enabled/log, List/exclude)".
    - Check: "State: P9 subprocess seam probed once at build".
    - Check: "State: the injected factory service stored on State".
    - Check: "State: fresh machinery + module gate collections (Stash/Inflight/Seams/Queue/Stamp/Set/Count)".
        - includes Factory.PendingJournal.length === 1 (the pre-bind buffered
          activated record); then drives Probe.Mode = "bin" (the bin-mode
          scenarios run against the stubbed subprocess seam)
    - Check: "Attach: P1 controller + P2/P5 effects; Wire registered fs/observed".
    - Check: "activation: the P5 record drained into the opened domain".
    - Check: "activation: durable proof line byte-identical ([ISO] format + summary fields)".

## Fixtures

The harness world holds the fake ctx (on/emit/effect/get/fs/reflect plus the root seam) with the subprocess/jobs/storageDomain service stubs, the REAL factory instance constructed against it, and one `Governor.apply(ctx, Governor.Config({ logFile: Ledger }))`.

The storage stub opens immediately, so the activation record drains on the first settle.

## Expected ledger strings (byte-exact)

- The single activation ledger line, ISO-timestamped, in the shape `[ISO] activated (anywhere mode, logFile=<Ledger>, updateMode=programmatic, ncuBin=ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery))` (the U+2026 ellipsis and U+2192 arrows appear in later folders' lines, not here).

## Edge cases

- `apply` returning a value would kill event delivery, so the `undefined` assertion is the negative control for that regression.
- The `effects.length = 0` reset from the source suite is kept (a no-op in a fresh folder process, where the effect-label deepEqual is the real control).
- Probe.Mode is flipped to "bin" only AFTER the Mode === "programmatic" assertion.

## Expected count

10 PASS.
