# Keep-Refusal-And-Guarded-Write

This page records what the test verifies.

## Intent

The test covers the keep-list discovery, the refusal guard, the designed silence, and the guarded write.

Keep-list: a directory `pin-policy.json` wins over normalization (the kept package byte-identical, the rest normalized), the configured global `keepFile` is honored, and the registry-adjacent `pin-policy.json` is honored WITHOUT suppressing the chain canonicalization.

Refusal guard: an unmatched plan (a dotted TOML body that the rewriter cannot match) aborts the whole rewrite with the `REFUSED rewrite of <path>: dependency "serde" in section "dependencies" not found in text - rewrite aborted` line, writes NOTHING, and skips the update stage.

Designed silence: a non-TOML body and a vanished file both produce the `observed non-JSON/TOML Cargo.toml <path> - skipped` line, contained and never a throw.

Guarded write + P3: the intent is the versioned `{ kind: "replaceIfVersion", version: "stat-v9" }` (the fresh-stat CURRENT version, the sequential-fold fix, where the current version of this fake's stat is stat-v9), there is no fence on a bare backend, the fresh version `fresh-v2` is pre-registered in the Stash, and the write carries the abort signal of the continuation.

The write re-emits fs/observed with the SAME actor (same owner bucket), and the re-entry is a no-op via the gate of the Stash.

The confined backend roots the fence at the own directory of the file (`workspace-write` + workspaceRoot), and a racing write (FS_STALE_VERSION) is contained logger-only, with no governed line and no ledger noise.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections 9-11.

## Scenario

- Group: the keep-list discovery.
    - Sub: "keep: directory pin-policy.json wins over normalization
      (byte-identical)"
    - Sub: "keep: the configured global keepFile honored"
    - Sub: "keep: registry-adjacent source honored; chain canonicalization
      not suppressed"
- Group: the refusal guard.
    - Sub: "refusal: unmatched plan aborts the whole rewrite; update stage
      skipped"
- Group: the designed silence.
    - Sub: "silence: non-TOML and vanished manifests -> the designed skip
      line, never a throw"
- Group: the guarded write + P3.
    - Sub: "P3: replaceIfVersion intent, Stash pre-registration, abort
      signal"
    - Sub: "P3: same-actor re-emit after the write; the re-entry is a no-op"
    - Sub: "P3/P4: both sandbox postures; a racing write is contained (no
      clobber, no leak)"

## Fixtures

The suite builds per-scenario harness worlds with the `subprocess` SeamStub, real `pin-policy.json` / `keep-global.json` fixture files under the harness Root, a racing case that overrides the `writeText` of the world with a throwing fake AFTER the first Boot, and a confined case that sets `sandboxMode: "workspace-write"`.

## Expected ledger strings (byte-identical)

- `REFUSED rewrite of <path>: dependency "serde" in section "dependencies"
  not found in text - rewrite aborted` (U+2014)
- `observed non-JSON/TOML Cargo.toml <path> - skipped` (U+2014, both the
  non-TOML body and the vanished file)
- `hook-dsh-governor-cargo: continuation error (suppressed): FS_STALE_VERSION`
  (the logger-only racing-write suppression)

## Edge cases

- The refusal check asserts that the write count is zero AND the dispatched count is zero, so there is never a partial rewrite.
- The vanished-file case shares the byte image of the non-TOML line exactly.
- The racing case asserts no governed line in the ledger, and not just no write.

## Expected count

8 PASS.
