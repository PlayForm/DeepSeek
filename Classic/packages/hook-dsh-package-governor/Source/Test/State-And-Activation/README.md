# State-And-Activation

What this test verifies.

## Intent

The apply-time wiring of the governor is the whole runtime posture in one place: `apply` returns
nothing, the state probe is attached to the context, every state field is factory-built from the
config cells, the machinery collections are fresh, the Attach step registers the P1 jobs controller
and the P2/P5 lifecycle effects, the Wire registers exactly one `fs/observed` listener, and the
activation journals its durable proof line in the byte-identical `[ISO] activated (anywhere mode,
...)` shape. A drift in any of these changes every downstream behavior, so it is its own folder. The
assertions are moved verbatim from section 3 of `Classic/smokes/governor-smoke.mjs`.

## Scenario

- Group: the apply contract and the factory-built state.
    - Sub: "apply: returns nothing; the state exposed via
      ctx.__hookDshGovernorPackageState"
    - Sub: "State: Module + Tool <- mutationTools (cell unwrapped by the factory)"
    - Sub: "State: module fields via the setup map (Strict/Wait/Limit/Binary/Mode)"
        - includes Mode === "programmatic" (the pre-override default)
    - Sub: "State: shared mappings (Policy/policyFile, Ledger/logFile,
      Enabled/log, List/exclude)"
    - Sub: "State: P9 subprocess seam probed once at build"
    - Sub: "State: the injected factory service stored on State"
    - Sub: "State: fresh machinery + module gate collections
      (Stash/Inflight/Seams/Queue/Stamp/Set/Count)"
        - includes Factory.PendingJournal.length === 1 (the pre-bind buffered
          activated record); then drives Probe.Mode = "bin" (the bin-mode
          scenarios run against the stubbed subprocess seam)
    - Sub: "Attach: P1 controller + P2/P5 effects; Wire registered fs/observed"
    - Sub: "activation: the P5 record drained into the opened domain"
    - Sub: "activation: durable proof line byte-identical ([ISO] format +
      summary fields)"

## Fixtures

The harness world: the fake ctx (on/emit/effect/get/fs/reflect + the root seam) with the
subprocess/jobs/storageDomain service stubs, the REAL factory instance constructed against it, and
one `Governor.apply(ctx, Governor.Config({ logFile: Ledger }))`. The storage stub opens immediately,
so the activation record drains on the first settle.

## Expected ledger strings (byte-exact)

- The single activation ledger line, ISO-timestamped, in the shape
  `[ISO] activated (anywhere mode, logFile=<Ledger>, updateMode=programmatic,
  ncuBin=ncu, exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek
  Harness.app], policyFile=(discovery))` (the U+2026 ellipsis and U+2192
  arrows appear in later folders' lines, not here).

## Edge cases

- An `apply` that returns a value would kill event delivery - the `undefined` assertion is the
  negative control for that regression.
- The `effects.length = 0` reset from the source suite is kept (a no-op in a fresh folder process;
  the effect-label deepEqual is the real control).
- Probe.Mode is flipped to "bin" only AFTER the Mode === "programmatic" assertion.

## Expected count

10 PASS.
