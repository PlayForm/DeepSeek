# Chain-And-Rewrite

What this test verifies.

## Intent

The chain pass's canonicalization and rewrite contract: the member table
canonicalized to the FULL resolved form (padded from a shorthand registry
value), the idempotence `P(P(c)) = P(c)` (an already-canonical manifest maps
to no plan, no write), the manifest-level `pinStyle: "exact"` (`=<resolved>`),
the `[target.'cfg(...)'.dependencies]` and `[workspace.dependencies]` tables,
the inline-table splice on its own line; the rewrite contract through the
string-next path (comments, inline comments, blank lines and untouched lines
byte-identical - never a TOML stringify) and the
`governed <path> → fresh-v2` ledger line; the strict stripping (the
whole-entry strip of unknown deps with inherited/path entries surviving, the
table-style `[dependencies.bad]` block removed through the next header, and
the no-registry case where strict strips nothing but normalization still
runs); and the full-version normalization (shorthand cores padded to X.Y.Z,
the `=` prefix kept, prerelease/build preserved as authored, the complex
forms left untouched). The assertions are moved verbatim from
`Classic/smokes/cargo-smoke.mjs` sections 6-8.

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
    - Sub: "rewrite: `governed <path> → fresh-v2` ledger line
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

Per-scenario harness worlds with the `subprocess` SeamStub and the in-memory
files map seeded with the manifest text; `registry.json` and
`update-policy.json` written on disk per scenario. The comments scenario pins
the full 19-line Original/Expected pair (the U+2014-free byte contract).

## Expected ledger strings (byte-identical)

- `governed <path> → fresh-v2` (U+2192; the message-from-version path).

## Edge cases

- The idempotence check re-fires with a genuinely fresh version (`v2`) and
  asserts BOTH no write and no new ledger line.
- The strict3 case proves strict without a registry strips nothing while the
  normalization alone still pads `0.8` to `0.8.0`.
- The norm2 case covers eight spellings in one manifest, including the
  four complex forms that must be left as-is.

## Expected count

13 PASS.
