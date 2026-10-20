# Chain-And-Rewrite

What this test verifies.

## Intent

The chain pass's rewrite engine. Canonicalization: a member table dep is
rewritten to the bare FULL resolved form (padded from a shorthand registry
value); an already-canonical manifest maps to no plan and no write
(idempotence: P(P(c)) = P(c)); `pinStyle: "exact"` in the update-policy
produces the `=<resolved>` form (manifest-level, no --exact flag); the
`[target.'cfg(windows)'.dependencies]` and `[workspace.dependencies]`
tables canonicalize; inline-table entries are spliced on their own line.
The rewrite contract: comments, inline comments, blank lines and untouched
lines are preserved BYTE-IDENTICALLY through the string-next path (the
surgically spliced text, never a TOML stringify, and `next` is a raw
string), and the ledger carries exactly one `governed <path> -> <version>`
line composed from the fresh version. Strict stripping: an unknown dep is
stripped whole while inherited/path entries survive; a table-style
`[dependencies.bad]` block is removed through the next header; without a
registry strict strips nothing while the normalization still runs.
Normalization: shorthand cores are padded to X.Y.Z; the `=` prefix is kept;
prerelease and build metadata are preserved as authored; the complex forms
(>=, ~, *, comma lists) are left untouched. The assertions are moved
verbatim from `Classic/smokes/cargo-smoke.mjs` sections 6-8.

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

Per-scenario harness worlds with the `subprocess` SeamStub, the in-memory
files map seeded with the TOML bodies, `registry.json` /
`update-policy.json` written per scenario; the comments scenario carries the
19-line Original manifest and its Expected byte-image verbatim.

## Expected ledger strings (byte-identical)

- `governed <path> → fresh-v2` (U+2192; exactly one, in the govline
  scenario)

## Edge cases

- The byte-equality check compares the written content line-by-line against
  the Expected array - any reorder or reformat fails it.
- The idempotence scenario re-fires with a genuinely fresh version (`v2`)
  to prove the no-plan comes from the canonical content, not the version.
- The normalization scenario asserts all eight shapes in one written body
  (`=1.0` keeps its prefix; `*` and comma lists untouched).

## Expected count

13 PASS.