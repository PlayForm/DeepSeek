# Direct-Govern-And-Lifecycle

What this test verifies.

## Intent

The direct-govern path is the raw-write tool's per-call `govern` route: the
steps registered at apply run through the DIRECT path - a simulated
raw-write-style invocation with a real target and the observed version. It
must match the event-path behavior (the same g2 lines, the same guarded write,
the same ledger strings, the Stash seeding), the selection fold must be
deterministic, and the two-chain-writer fold must converge in both
registration orders. The lifecycle checks close the folder: the cooldown
idempotence on a second author write, the P2 disposal, the P5 close, and the
P5-absent retirement. These assertions are moved verbatim from
`Classic/smokes/governor-smoke.mjs` sections 10b-11.

## Scenario

- Group: the P2 namespaced UpdateKey (the collision window).
    - Sub: "P2: the update stage's namespaced key (factory.UpdateKey) survives
      the chain pass settlement"
- Group: the direct-govern path.
    - Sub: "direct-govern: canonicalize - g2 + Stash seed + Continue, no update
      follow, ledger byte-identical"
    - Sub: "direct-govern: canonicalize with no registry - the g2 line, no
      write, Stash seeded"
    - Sub: "direct-govern: update - the update stage alone through
      Follow/Dispatch, gates and ledger byte-identical"
    - Sub: "direct-govern: selection - unknown names ignored, `true` runs the
      registered steps in order (sequential fold)"
    - Sub: "direct-govern: two-chain-writer fold (canonicalize + sim-pin) - both
      writes land at the fresh-stat version, both lines appear, registered
      order"
    - Sub: "direct-govern: reverse registered order - sim-pin +
      sim-canonicalize both land and converge to the same final state"
- Group: the #14 parallel marker (the ETS-only additive section of the source
  suite, `EffectTS/smokes/governor-smoke.mjs`).
    - Sub: "#14 parallel: the governor's own steps - canonicalize (chain
      write) + update (dispatch) both run and settle in parallel, ledger
      strings byte-identical"
    - Sub: "#14 parallel (disjoint): sim steps whose chain writes target
      DIFFERENT files both run, both settle, both lines appear"
    - Sub: "#14 parallel: the object form WITHOUT the marker keeps the
      sequential fold order (canonicalize before dispatch)"
- Group: the idempotent second write and the unload lifecycle.
    - Sub: "idempotence: a second author write re-governs silently and never
      double-updates"
    - Sub: "lifecycle: the P2 effect aborts every in-flight continuation and
      clears the map"
    - Sub: "lifecycle: the P5 disposer closes the storage domain"
    - Sub: "lifecycle: P5 absent -> silent skip, the journal sink retired"

## Fixtures

The harness world (Boot) plus: a second factory instance (`FactoryR`) built on
a fresh `MakeContext` sharing the same Files map and Root for the reverse
registration order; the sim steps (`fold-pin`, `fold-pin-r`, `fold-can-r`)
registered through `factory.RegisterGovern` with chain-writing transforms
(`foldPinT`/`foldCanT`); the `UngovernedEmit` helper that blanks the listener
capture around each fold run (the sim states are not the live listener's
state). The idempotence check replays the section-6 proj-b no-registry
dispatch silently first (the SILENT REPLAY), so the cooldown gate is armed
exactly as in the source flow.

## Expected ledger strings (byte-identical)

- `governed <path> -> <version>` (the canonicalize chain's line, arrow is
  U+2192)
- `pinned <path> (1 versions) -> <version>` (the sim-pin's line, U+2192)
- `no registry.json found for <path> - chain pass skipped` (dash is U+2014)
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, built-in default
  policy)`
- `update: DONE - pins bumped per policy` (dash is U+2014)
- `update stage skipped for <dir> (cooldown)`

## Edge cases

- The P2 collision window: both passes coexist under distinct keys
  (`update:<targetKey>` vs the plain key); the chain's settlement deletes only
  its own; the unload disposal still aborts the surviving update run.
- Unknown step names run NOTHING (the ledger length assertion is the negative
  control).
- The reverse registration order converges to the SAME final dependencies as
  the forward order - the deterministic-convergence control.
- P5 absent: the Journal sink is retired, the queue never grows.

## Expected count

15 PASS.
