# State-And-Activation

This file states what the test verifies.

## Intent

The suite covers the activation posture and the factory-built state of the cargo governor.

The ledger's single activation line carries its exact regex byte-shape, which is the cargo flavor,
the separate logFile under the harness Root, `updateMode=cargo`, `cargoBin=cargo`, the six-entry
exclude list, and both discovery placeholders, with the logger prefix composed from State.Module.

The full shared state shape holds Module, PolicyName `pin-policy.json`, Policy, Ledger, Enabled, On
(the master switch, config `enabled`), Tool,
List, Strict, Wait, Limit, CargoBin, KeepFile, Mode, the Stash/Inflight/Seams Maps, the Queue array,
the Stamp/Set/Count collections, the P9 Subprocess seam probed at State build, and the P5 Journal
sink.

The wire posture is exactly ONE fiber-owned fs/observed registration plus exactly one other hook,
which is the P10 loader/volatile-update refresh of the State builder, never fs/write-intent and never
tools/*.

The attach posture covers the P1/P2/P5 effect labels `...-jobs`, `...-inflight`, and `...-storage`,
with no controller without a jobs service and the P1 root controller attached with the jobs service.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` section 3.

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
- Group: the disabled mount (the LIVE disabled posture).
    - Sub: "disabled mount: every surface still registers and the ledger line
      is the byte-exact disabled line (no early return)"
        - a dedicated enabled=false mount on its own world: the fs/observed
          listener and the P1/P2/P5 effects STILL register, the ONLY ledger
          line is the byte-exact `disabled (enabled=false)` (no activation
          proof), and the logger line carries the State.Module prefix
    - Sub: "disabled mount: a call passes through with ZERO new ledger lines"
        - the disabled mount's own wired listener fires on an excluded target
          (`node_modules/probe/Cargo.toml` - the deterministic fs-free probe:
          an ENABLED call would land `skipped (excluded) ...`) and the ledger
          does not move (the call-time master switch)
    - Sub: "disabled mount: flipping enabled acts on the very next call - and
      back"
        - On=true then the next call lands the `skipped (excluded) ...` line
          (exactly one new line); On=false again then the next call is silent
          (a fresh version token keeps the Stash gate out of the way - the
          master switch is the only gate standing)

## Fixtures

The harness builds per-scenario worlds with the `subprocess` SeamStub and the real Furnace wired as
`ctx.pluginFactory`, and the second world of the attach scenario carries a jobs service whose
`attachController` records into the captured controllers.

## Expected ledger strings (byte-identical)

- `[ISO] activated (cargo flavor, logFile=<.../cargo-smoke-.../act.log>,
  updateMode=cargo, cargoBin=cargo, exclude=[node_modules, .git, .dsh,
  .pnpm, .store, DeepSeek Harness.app], policyFile=(discovery),
  keepFile=(discovery))` (the regex byte-shape; the logFile tail matches the
  harness Root's `cargo-smoke-` prefix)
- `hook-dsh-governor-cargo: <the activation line>` (the logger composition)
- The disabled mount's single ledger line `disabled (enabled=false)`
  (byte-exact; the ISO prefix is stripped by the Ledger reader), plus the
  logger line `hook-dsh-governor-cargo: disabled (enabled=false)`.
- The flipped-on call's `skipped (excluded) <Root>/node_modules/probe/Cargo.toml`
  line (the module's exclusion string, byte-exact).

## Edge cases

- The wire check counts BOTH directions, so exactly one fs/observed listener AND exactly one
  non-fs/observed hook (the P10 refresh) must hold, and any extra hook fails it.
- The effect labels are asserted as an exact deepEqual array in the P1/P2/P5 registration order.

## Expected count

7 PASS.
