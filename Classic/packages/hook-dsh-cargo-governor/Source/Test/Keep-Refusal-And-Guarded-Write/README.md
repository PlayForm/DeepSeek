# Keep-Refusal-And-Guarded-Write

This file states what the test verifies.

## Intent

The suite covers the keep-list discovery, the refusal guard, the designed silence, and the guarded
write.

Keep-list: a directory `pin-policy.json` wins over normalization, so the kept package stays
byte-identical and the rest is normalized, the configured global `keepFile` is honored, and the
registry-adjacent `pin-policy.json` is honored WITHOUT suppressing the chain canonicalization.

Refusal guard: an unmatched plan, which is a dotted TOML body that the rewriter cannot match, aborts
the whole rewrite with the
`REFUSED rewrite of <path>: dependency "serde" in section "dependencies" not found in text — rewrite aborted`
line, writes NOTHING, and skips the update stage.

Designed silence: a non-TOML body and a vanished file both produce the
`observed non-JSON/TOML Cargo.toml <path> - skipped` line in a contained way, never a throw.

Guarded write and P3: the intent is the versioned `{ kind: "replaceIfVersion", version: "stat-v9" }`,
which is the fresh-stat CURRENT version of the sequential-fold fix, and with the stat of this fake
the current version is stat-v9.

No fence runs on a bare backend, the fresh version `fresh-v2` is pre-registered in the Stash, and the
write carries the abort signal of the continuation.

The write re-emits fs/observed with the SAME actor in the same owner bucket, and the re-entry is a
no-op through the Stash gate.

The confined backend roots the fence at the directory of the file itself (`workspace-write` plus
workspaceRoot), and a racing write (FS_STALE_VERSION) is contained to the logger, with no governed
line and no ledger noise.

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

The harness builds per-scenario worlds with the `subprocess` SeamStub and real
`pin-policy.json` / `keep-global.json` fixture files under the harness Root.

The racing case overrides the `writeText` of the world with a throwing fake AFTER the first Boot, and
the confined case sets `sandboxMode: "workspace-write"`.

## Expected ledger strings (byte-identical)

- `REFUSED rewrite of <path>: dependency "serde" in section "dependencies"
  not found in text — rewrite aborted` (U+2014)
- `observed non-JSON/TOML Cargo.toml <path> — skipped` (U+2014, both the
  non-TOML body and the vanished file)
- `hook-dsh-governor-cargo: continuation error (suppressed): FS_STALE_VERSION`
  (the logger-only racing-write suppression)

## Edge cases

- The refusal check asserts that the write count is zero AND the dispatched count is zero, so a
  partial rewrite never happens.
- The vanished-file case shares the byte image of the non-TOML line exactly.
- The racing case asserts no governed line in the ledger, which is stronger than no write.

## Expected count

8 PASS.
