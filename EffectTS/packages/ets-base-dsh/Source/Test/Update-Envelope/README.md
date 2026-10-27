# Update-Envelope

This page records what the test verifies.

## Intent

`Update` is the typed-effect update envelope (the R1 addition of the shared `@playform/ets-base-dsh` base): a module-agnostic Effect builder whose `Settle` owns the circuit breaker and the U2 refresh, while its `Dispatch` owns the three gates (circuit breaker, in-flight, cooldown), the P2 registration, the jobs envelope (journal record FIRST, then the ledger line), the never-rejecting done outcome, the containment of bug-level rejections, the detached fallback, and the forkIn interruption at dispose.

It has its own folder because this is the additive effect-boundary coverage of the ETS tree: the same mechanics that the Classic `Update` exposes as plain functions, observed through the typed envelope of Effect.

There is NO Classic twin for this folder, because it is re-homed from sections 9 + 11 of the ETS core smoke (R1 additive), which the L6 lane (ets-base-dsh) completes later by giving the base its own test tree.

## Scenario

- Group: Activate + Update - the builders' shapes (same names, additive).
    - Check 1: "Activate + Update: the builders keep their export names (the
      composer + the effect builder)".
        - Leaf: `Activate([[mode, anywhere], [exclude, undefined], ["", "pinner
          flavor"]])` equals the activation line (skip-absent, bare segment).
        - Leaf: `typeof Update === "function"`.
- Group: Update - the typed-effect envelope (EffectTS additive).
    - Check 2 (one source ok group; the branches below are nested inside it,
      driven by the module-side fake):
        - Branch: Settle on 0 - returns the code, resets the breaker, runs U2
          (the stat's version 7 to the module's Refresh), no failure line.
        - Branch: Settle on 3 - returns the code, increments the breaker,
          appends the byte-identical failure line, journals the P5 record
          ("update-failed", dir, stringified code), still runs U2.
        - Branch: Settle with a rejected stat - the code is returned, U2 is
          contained (no Refresh), the breaker still increments.
        - Branch: the breaker gate - consecutive failures at the limit log the
          paused line (the raw map read), no job, no journal record.
        - Branch: the in-flight gate - the directory in `Set` logs the skipped
          line, no job.
        - Branch: the cooldown gate - a fresh stamp with a 60s wait logs the
          cooldown line, no job.
        - Branch: the dispatched path - the journal record comes FIRST, the
          dispatched ledger line after it; the spec carries the producer kind
          and the label; the P2 registration stands under the namespaced key;
          the job's cancel aborts; the done outcome maps the exit code
          (completed / "exit code: 0"); the settlement removes the marker, the
          registration, resets the breaker and runs U2.
        - Branch: the bug-level Stage rejection - resolves the failed outcome
          with the module's rejected detail, removes the marker and the
          registration, increments the breaker (containment).
        - Branch: the detached fallback - the same contained chain forked on
          the plugin scope, settled without any awaiter (marker removed,
          breaker reset, U2 ran, one dispatch record).
        - Branch: the forkIn interruption - the in-flight fiber is interrupted
          at dispose and its task-owned controller is aborted (the P2
          registration stands, never settled).

## Fixtures

- `SmokeState` / `UpdateState()`: the injected State maps (Count, Stamp, Set, Inflight, Journal, Ledger, Refreshed, Spec, Detached).
- `UpdateDeps(Over)`: the full factory-delegate bundle (Limit 2, Wait 0, UpdateKey "update:<target>", Append/Journal/Refresh into the State maps, Stat version 7, the job Start hook, the module-owned Lines, the event names and the Stage stub) typed against the exported `Dependencies` contract of the envelope, where each branch overrides what it needs (Stat boom, Wait 60s, BoomStage, HangStage, detached Start).
- `UpdateLines`: the own ledger strings of the module (the strings of the smoke, not those of the core).
- `RunScoped`: `Effect.runPromise(Effect.scoped(...))`, so every Dispatch runs under a scope and the forkIn semantics are exercised.

## Expected ledger strings (byte-exact)

- `update stage paused for /x (consecutive=2, limit=2)`
- `update stage skipped for /x (in-flight)`
- `update stage skipped for /x (cooldown)`
- `update stage FAILED (3) for /x; consecutive=1`
- `update stage dispatched for /x (mode=smoke, ncu via /bin/ncu, /p/policy.json)`
  (asserted by prefix match: `^update stage dispatched for \/x \(mode=smoke`)
- `update: dispatched journal detail "mode=smoke"` (the journal record
  `["dispatched", "/x", "mode=smoke"]`)
- `update-failed` journal record `["update-failed", "/x", "3"]`
- done outcomes: `{ status: "completed", detail: "exit code: 0" }` and
  `{ status: "failed", detail: "update stage rejected" }`

## Edge cases

- The envelope never rejects, because a bug-level Stage rejection resolves `failed` with the detail of the module instead of throwing.
- The dispatched order is journal FIRST and ledger line second (the governor-family order).
- The U2 refresh runs on success, runs after a failure, and is contained when the stat itself rejects.
- The dispose of the scope interrupts the in-flight fiber (forkIn) and aborts its controller, so the P2 registration is never settled.

## Expected count

2 PASS.
