# Chain-And-Rewrite

This file states what the test verifies.

## Intent

The suite covers the rewrite engine of the chain pass.

Canonicalization rewrites a member table dep to the bare FULL resolved form, padded from a shorthand
registry value, and an already-canonical manifest maps to no plan and no write, which is the
idempotence law P(P(c)) = P(c).

A `pinStyle: "exact"` in the update-policy produces the `=<resolved>` form at manifest level, with no
`--exact` flag, and the `[target.'cfg(windows)'.dependencies]` and `[workspace.dependencies]` tables
canonicalize while inline-table entries are spliced on their own line.

The rewrite contract preserves comments, inline comments, blank lines, and untouched lines
BYTE-IDENTICALLY through the string-next path, which is the surgically spliced text and never a TOML
stringify, and `next` is a raw string.

The ledger carries exactly one `governed <path> -> <version>` line composed from the fresh version.

Strict stripping removes an unknown dep whole while inherited and path entries survive, removes a
table-style `[dependencies.bad]` block through the next header, and strips nothing without a registry
while the normalization still runs.

Normalization pads shorthand cores to X.Y.Z, keeps the `=` prefix, preserves prerelease and build
metadata as authored, and leaves the complex forms (>=, ~, *, comma lists) untouched.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections 6-8.

## Scenario

- Group: the member table canonicalization.
    - Sub: "chain: member table -> bare full resolved form (`serde =
      \"2.1.0\"`)"
- Group: the chain idempotence.
    - Sub: "chain: idempotence — an already-canonical manifest maps to no
      plan, no write"
- Group: pinStyle exact.
    - Sub: "chain: pinStyle exact -> `serde = \"=1.1.0\"`"
- Group: the target table.
    - Sub: "chain: `[target.'cfg(...)'.dependencies]` canonicalized"
- Group: the shared workspace table.
    - Sub: "chain: `[workspace.dependencies]` (the shared table)
      canonicalized"
- Group: inline-table entries.
    - Sub: "chain: inline-table entries spliced on their own line"
- Group: comment/formatting preservation (the string-next path).
    - Sub: "rewrite: comment/formatting preservation byte-equality (the
      string-next path)"
- Group: the governed ledger line.
    - Sub: "rewrite: `governed <path> -> fresh-v2` ledger line
      (message-from-version path)"
- Group: strict stripping.
    - Sub: "strict: whole-entry strip of unknown deps; inherited and path
      entries survive"
    - Sub: "strict: table-style `[dependencies.bad]` block removed"
    - Sub: "strict: no registry -> no strip, normalization alone"
- Group: the full-version normalization.
    - Sub: "normalize: shorthand cores padded to X.Y.Z"
    - Sub: "normalize: exact prefix, prerelease/build preserved, complex
      forms untouched"

## Fixtures

The harness builds per-scenario worlds with the `subprocess` SeamStub, the in-memory files map
seeded with the TOML bodies, and `registry.json` / `update-policy.json` written per scenario.

The comments scenario carries the 19-line Original manifest and its Expected byte-image verbatim.

## Expected ledger strings (byte-identical)

- `governed <path> → fresh-v2` (U+2192; exactly one, in the govline
  scenario)

## Edge cases

- The byte-equality check compares the written content line-by-line against the Expected array, so any
  reorder or reformat fails it.
- The idempotence scenario re-fires with a genuinely fresh version (`v2`) to prove that the no-plan
  comes from the canonical content and not from the version.
- The normalization scenario asserts all eight shapes in one written body, where `=1.0` keeps its
  prefix and `*` and comma lists stay untouched.

## Expected count

13 PASS.
