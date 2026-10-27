# Direct-Govern-And-Lifecycle

What this test verifies.

## Intent

The direct-govern path is the per-call `govern` route of the raw-write tool: the steps registered at apply run through the DIRECT path, a simulated raw-write-style invocation with a real target and the observed version.

It must match the event-path behavior (the same g2 lines, the same guarded write, the same ledger strings, and the Stash seeding), the selection fold must be deterministic, and the two-chain-writer fold must converge in both registration orders.

The lifecycle checks close the folder: the cooldown idempotence on a second author write, the P2 disposal, the P5 close, and the P5-absent retirement.

These assertions are moved verbatim from `Classic/smokes/governor-smoke.mjs` sections 10b-11.

## Scenario

- Group: the P2 namespaced UpdateKey (the collision window).
    - Check: "P2: the update stage's namespaced key (factory.UpdateKey) survives the chain pass settlement".
- Group: the direct-govern path.
    - Check: "direct-govern: canonicalize - g2 + Stash seed + Continue, no update follow, ledger byte-identical".
    - Check: "direct-govern: canonicalize with no registry - the g2 line, no write, Stash seeded".
    - Check: "direct-govern: update - the update stage alone through Follow/Dispatch, gates and ledger byte-identical".
    - Check: "direct-govern: selection - unknown names ignored, `true` runs the registered steps in order (sequential fold)".
    - Check: "direct-govern: two-chain-writer fold (canonicalize + sim-pin) - both writes land at the fresh-stat version, both lines appear, registered order".
    - Check: "direct-govern: reverse registered order - sim-pin + sim-canonicalize both land and converge to the same final state".
- Group: the #14 parallel marker (the ETS-only additive section of the source suite, `EffectTS/smokes/governor-smoke.mjs`).
    - Check: "#14 parallel: the governor's own steps - canonicalize (chain write) + update (dispatch) both run and settle in parallel, ledger strings byte-identical".
    - Check: "#14 parallel (disjoint): sim steps whose chain writes target DIFFERENT files both run, both settle, both lines appear".
    - Check: "#14 parallel: the object form WITHOUT the marker keeps the sequential fold order (canonicalize before dispatch)".
- Group: the idempotent second write and the unload lifecycle.
    - Check: "idempotence: a second author write re-governs silently and never double-updates".
    - Check: "lifecycle: the P2 effect aborts every in-flight continuation and clears the map".
    - Check: "lifecycle: the P5 disposer closes the storage domain".
    - Check: "lifecycle: P5 absent -> silent skip, the journal sink retired".

## Fixtures

The harness world (Boot) plus a second factory instance (`FactoryR`) built on a fresh `MakeContext` that shares the same Files map and Root for the reverse registration order.

The sim steps (`fold-pin`, `fold-pin-r`, `fold-can-r`) register through `factory.RegisterGovern` with chain-writing transforms (`foldPinT`/`foldCanT`).

The `UngovernedEmit` helper blanks the listener capture around each fold run, because the sim states are not the state of the live listener.

The idempotence fixture arms the cooldown itself, because the no-flap rule removed the no-registry dispatch that previously stamped proj-b: proj-b carries a registry and a stale chain pin, so the first author write governed-writes and dispatches, and the second author write (the stale pin re-introduced) is the cooldown-gated one.

## Expected ledger strings (byte-identical)

- `governed <path> -> <version>` (the line of the canonicalize chain, arrow is U+2192)
- `pinned <path> (1 versions) -> <version>` (the line of the sim-pin, U+2192)
- `no registry.json found for <path> - chain pass skipped` (dash is U+2014)
- `update stage dispatched for <dir> (mode=bin, ncu via ncu, built-in default policy)`
- `update: DONE - pins bumped per policy` (dash is U+2014)
- `update stage skipped for <dir> (cooldown)`

## Edge cases

- The P2 collision window: both passes coexist under distinct keys (`update:<targetKey>` versus the plain key), the settlement of the chain deletes only its own, and the unload disposal still aborts the surviving update run.
- Unknown step names run NOTHING, and the ledger length assertion is the negative control.
- The reverse registration order converges to the SAME final dependencies as the forward order, which is the deterministic-convergence control.
- P5 absent: the Journal sink is retired, and the queue never grows.

## Expected count

15 PASS.
