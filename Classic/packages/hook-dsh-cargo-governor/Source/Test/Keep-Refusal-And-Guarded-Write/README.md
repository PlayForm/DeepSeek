# Keep-Refusal-And-Guarded-Write

What this test verifies.

## Intent

The keep-list discovery, the refusal guard, the designed silence and the
guarded write. Keep-list: a directory `pin-policy.json` wins over
normalization (the kept package byte-identical, the rest normalized); the
configured global `keepFile` is honored; the registry-adjacent
`pin-policy.json` is honored WITHOUT suppressing the chain canonicalization.
Refusal guard: an unmatched plan (a dotted TOML body the rewriter cannot
match) aborts the whole rewrite with the
`REFUSED rewrite of <path>: dependency "serde" in section "dependencies" not
found in text — rewrite aborted` line, writes NOTHING, and skips the update
stage. Designed silence: a non-TOML body and a vanished file both produce
the `observed non-JSON/TOML Cargo.toml <path> — skipped` line, contained,
never a throw. Guarded write + P3: the intent is the versioned
`{ kind: "replaceIfVersion", version: "stat-v9" }` (the fresh-stat CURRENT
version - the sequential-fold fix; with this fake's stat the current version
is stat-v9), no fence on a bare backend, the fresh version `fresh-v2`
pre-registered in the Stash, the write carrying the continuation's abort
signal; the write re-emits fs/observed with the SAME actor (same owner
bucket) and the re-entry is a no-op via the Stash gate; the confined
backend roots the fence at the file's own directory (`workspace-write` +
workspaceRoot), and a racing write (FS_STALE_VERSION) is contained
logger-only - no governed line, no ledger noise. The assertions are moved
verbatim from `Classic/smokes/cargo-smoke.mjs` sections 9-11.

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

Per-scenario harness worlds with the `subprocess` SeamStub; real
`pin-policy.json` / `keep-global.json` fixture files under the harness Root;
the racing case overrides the world's `writeText` with a throwing fake
AFTER the first Boot; the confined case sets `sandboxMode:
"workspace-write"`.

## Expected ledger strings (byte-identical)

- `REFUSED rewrite of <path>: dependency "serde" in section "dependencies"
  not found in text — rewrite aborted` (U+2014)
- `observed non-JSON/TOML Cargo.toml <path> — skipped` (U+2014, both the
  non-TOML body and the vanished file)
- `hook-dsh-governor-cargo: continuation error (suppressed): FS_STALE_VERSION`
  (the logger-only racing-write suppression)

## Edge cases

- The refusal check asserts the write count is zero AND the dispatched count
  is zero - never a partial rewrite.
- The vanished-file case shares the non-TOML line's byte image exactly.
- The racing case asserts no governed line in the ledger (not just no
  write).

## Expected count

8 PASS.
