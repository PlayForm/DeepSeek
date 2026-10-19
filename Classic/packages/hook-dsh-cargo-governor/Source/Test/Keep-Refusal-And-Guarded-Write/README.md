# Keep-Refusal-And-Guarded-Write

What this test verifies.

## Intent

The keep-list discovery and the write-side safety net: the three keep-list
sources (the directory `pin-policy.json` winning over normalization with the
kept package byte-identical, the configured global `keepFile`, and the
registry-adjacent source which must NOT suppress the chain canonicalization);
the refusal guard (an unmatched plan aborts the whole rewrite with the
`REFUSED rewrite of <path>: dependency "serde" in section "dependencies" not
found in text — rewrite aborted` line, no write, and the update stage
skipped); the designed silence (non-TOML and vanished manifests produce the
`observed non-JSON/TOML Cargo.toml <path> — skipped` line, never a throw);
and the guarded write + P3 (the `replaceIfVersion` intent at the fresh-stat
CURRENT version, the Stash pre-registration of the write's own `fresh-v2`,
the abort signal on every write, the same-actor re-emit being a no-op through
the Stash gate, both sandbox postures - the bare backend without a fence and
the confined backend fenced at the file's own directory - and the contained
racing write: no clobber, no governed line, logger-only suppression). The
assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections
9-11.

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

Per-scenario harness worlds with the `subprocess` SeamStub; `pin-policy.json`
and `registry.json` written on disk per scenario; the global keepFile fixture
written under the harness Root. The racing-write fixture replaces
`m2.ctx.fs.writeText` with a throwing fake AFTER the world is created.

## Expected ledger strings (byte-identical)

- `REFUSED rewrite of <path>: dependency "serde" in section "dependencies"
  not found in text — rewrite aborted` (U+2014)
- `observed non-JSON/TOML Cargo.toml <path> — skipped` (U+2014; both the
  non-TOML and the vanished-file case)
- `hook-dsh-governor-cargo: continuation error (suppressed): FS_STALE_VERSION`
  (the logger-only suppression of the racing write)

## Edge cases

- The refused rewrite must not partially write: zero writes AND zero
  dispatched update stages.
- The vanished manifest goes through the same skip line as the non-TOML
  body (the read throws "vanished" and the listener contains it).
- The racing write's intent version check: `foldWrites[1]` style staleness
  is impossible here because the chain stats before the write; the racing
  case is simulated by the throwing writeText instead.

## Expected count

8 PASS.
