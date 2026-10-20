# Refusal-Path / Live-Assertions

The governed-path violation: the byte-identical REFUSED line and the untouched
file.

## Intent

A governed-path violation inside the scratch tree must produce the
byte-identical REFUSED ledger line and leave the file untouched - the
negative case, safely, never touching the user's real trees. The contrast
holds: the sibling pretty-table manifest (a locatable plan) goes through, so
the refusal is entry-specific, not path-wide.

## Scenario

- Group: the refusal ledger line
  - Leaf 1: the cargo governor logged the byte-identical REFUSED line (the
    CORE's Refusal composer).
- Group: the file is untouched
  - Leaf 2: the refused Cargo.toml is byte-identical to what was written (no
    partial rewrite).
- Group: no governed line for the refused path
  - Leaf 3: no governed line exists for the refused path (the refusal never
    proceeds to a guarded write).
- Group: the contrast
  - Leaf 4: the sibling locatable plan was governed (the refusal is
    entry-specific, not path-wide).
  - Leaf 5: the governed sibling's bytes changed (the contrast holds).

## Fixtures

- The exercise boot (via `Exercise()`): performs the two refusal-attempt
  writes (`cargoRefusal` - the dotted key the raw text cannot locate - and
  `cargoRefusal2` - the locatable pretty-table manifest).
- `$DSH_TEST_SCRATCH/ledgers/cargo-governor.log`.

## Expected ledger strings (byte-exact)

- `REFUSED rewrite of <path>: dependency "leftover" in section "dependencies"
  not found in text \u2014 rewrite aborted` (U+2014) - asserted as an
  `endsWith`.
- ABSENT (the negative control): any `governed <refused-path> ` line.

## Edge cases

- The refusal is entry-specific: the sibling manifest in the same run is
  governed and rewritten (leaf 4 and leaf 5 are the contrast).
- The package governor's own refusal guard (non-dependency sections) is a
  defensive guard the chain pass cannot trigger by construction - documented
  here as the residual it is (see the wiring report).

## Env gate

`DSH_TEST_SCRATCH` must be set. Unset means `SKIPPED (no scratch home)` with
exit 0 - identical to the `.mjs` suite this folder was split from. The folder
is never forced green in `Maintain/Run-Smokes.mjs`; it runs under
`Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

5 PASS.
