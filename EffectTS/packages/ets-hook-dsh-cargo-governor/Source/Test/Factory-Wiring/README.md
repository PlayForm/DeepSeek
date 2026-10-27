# Factory-Wiring

This page records what the test verifies.

## Intent

The test covers the factory wiring of the cargo governor: the seams that the REAL @playform/ets-plugin-dsh-factory instance provides.

The silence/sync contract: the fs/observed listener returns synchronously and await-free, with the stages detached into a continuation that does the work after the flush.

The real factory instance registered as `ctx.pluginFactory` with the P9 probe-once seam, where the subprocess service is probed exactly once across two full passes.

The chain pass running through `Furnace.Continue`, where the in-flight entry is held DURING the guarded write and removed after settlement.

The write through `Furnace.GuardedWrite`, with the abort signal forwarded and the bare-backend P4 posture (no fence).

The keep-list through `Furnace.ResolvePolicy`, where the unreadable-sidecar line is composed with the `policyFileName = "pin-policy.json"` of the module.

The attach P5: the storageDomain opens and drains the pre-open queue, the activated record flows with `detail: "cargo"`, an update dispatch journals the dispatched record (the parity of the parent governor), and the absent sink is silently retired with no queue growth.

The g1 gates through `Furnace.Gate`: the excluded path logs exactly one line, and the basename miss logs nothing.

The ledger prefix: every logger line carries the `hook-dsh-governor-cargo: ` State.Module prefix composed by the Append of the factory.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` section 15.

## Scenario

- Group: the silence/sync contract.
    - Sub: "silence: the listener is synchronous and await-free; the stages
      are detached"
- Group: the real factory instance + the P9 seam.
    - Sub: "wiring: real factory instance; P9 probe-once seam across multiple
      passes"
- Group: the Continue Inflight lifecycle.
    - Sub: "wiring: the chain pass ran through factory.Continue (Inflight
      lifecycle)"
- Group: the GuardedWrite signal + fence.
    - Sub: "wiring: the write went through factory.GuardedWrite (signal + P4
      fence)"
- Group: the ResolvePolicy keep sidecar.
    - Sub: "wiring: the keep-list came through factory.ResolvePolicy
      (policyFileName = pin-policy.json)"
- Group: the attach P5 domain.
    - Sub: "wiring: Attach P5 - the domain opens and drains; absent -> silent
      skip"
- Group: the Gate log-nothing contract.
    - Sub: "wiring: the g1 gates ran through factory.Gate (log-nothing
      contract honored)"
- Group: the ledger prefix (the factory Append composition).
    - Sub: "wiring: the ledger prefix is State.Module (factory Append
      composition)"

## Fixtures

The suite builds per-scenario harness worlds with the `subprocess` SeamStub, a `pin-policy.json` sidecar with invalid JSON for the ResolvePolicy scenario, and a storageDomain service fake with a `table().put` recorder for the P5 scenarios (present, absent, and the update-dispatch parity world).

The ledger-prefix check reads the accumulated logger capture of the folder.

## Expected ledger strings (byte-identical)

- `unreadable pin-policy.json at <path> - using built-in default` (U+2014)
- `skipped (excluded) <path>`
- `hook-dsh-governor-cargo: activated (cargo flavor, ...)` and every other
  logger line prefixed `hook-dsh-governor-cargo: ` (the State.Module
  composition)

## Edge cases

- The sync check asserts that the write count BEFORE the flush is zero and after the flush is non-zero, which proves the detached continuation and not a sync stage.
- The P5 absent case must drain the queue to nothing AND leave a later direct Journal call with no growth (the retired sink).
- The ledger-prefix check is the folder-wide negative control, because any foreign (unprefixed) logger line from ANY scenario in the folder fails it.

## Expected count

8 PASS.
