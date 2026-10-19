# State-And-Activation

What this test verifies.

## Intent

The activation posture and the factory-built state of the cargo governor:
the ledger's single activation line in its exact regex byte-shape (the cargo
flavor, the separate logFile under the harness Root, `updateMode=cargo`,
`cargoBin=cargo`, the six-entry exclude list, both discovery placeholders)
with the logger prefix composed from State.Module; the full shared state
shape (Module, PolicyName `pin-policy.json`, Policy, Ledger, Enabled, Tool,
List, Strict, Wait, Limit, CargoBin, KeepFile, Mode, the Stash/Inflight/Seams
Maps, the Queue array, the Stamp/Set/Count collections, the P9 Subprocess
seam probed at State build, the P5 Journal sink); the wire posture (exactly
ONE fiber-owned fs/observed registration plus exactly one other hook - the
State builder's P10 loader/volatile-update refresh, never fs/write-intent,
never tools/*); and the attach posture (the P1/P2/P5 effect labels
`...-jobs`, `...-inflight`, `...-storage`, no controller without a jobs
service, and the P1 root controller attached with the jobs service). The
assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs`
section 3.

## Scenario

- Group: the activation posture.
    - Sub: "activation: ledger byte-shape + `hook-dsh-governor-cargo: `
      logger prefix"
- Group: the factory-built shared state shape.
    - Sub: "state: factory-built shared shape + module fields + activation
      journal record"
- Group: the wire posture.
    - Sub: "wire: exactly one fiber-owned fs/observed registration, plus the
      P10 volatile-update refresh"
- Group: the attach posture.
    - Sub: "attach: P1/P2/P5 effect labels + P1 root jobs controller"

## Fixtures

Per-scenario harness worlds with the `subprocess` SeamStub and the real
Furnace wired as `ctx.pluginFactory`; the attach scenario's second world
carries a jobs service whose `attachController` records into the captured
controllers.

## Expected ledger strings (byte-identical)

- `[ISO] activated (cargo flavor, logFile=<.../cargo-smoke-.../act.log>,
  updateMode=cargo, cargoBin=cargo, exclude=[node_modules, .git, .dsh,
  .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery),
  keepFile=(discovery))` (the regex byte-shape; the logFile tail matches the
  harness Root's `cargo-smoke-` prefix)
- `hook-dsh-governor-cargo: <the activation line>` (the logger composition)

## Edge cases

- The wire check counts BOTH directions: exactly one fs/observed listener
  AND exactly one non-fs/observed hook (the P10 refresh) - any extra hook
  fails it.
- The effect labels are asserted as an exact deepEqual array in the
  P1/P2/P5 registration order.

## Expected count

4 PASS.
