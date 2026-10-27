# Refusal-Path / Live-Assertions

The governed-path violation, where the byte-identical REFUSED line appears and the file stays untouched.

## Intent

A governed-path violation inside the scratch tree must produce the byte-identical REFUSED ledger line and leave the file untouched, which is the negative case run safely and never against the real trees of the user.

The contrast holds, because the sibling pretty-table manifest (a locatable plan) goes through, so the refusal is entry-specific and not path-wide.

## Scenario

- Group: the refusal ledger line
  - Leaf 1: the cargo governor logged the byte-identical REFUSED line (the
    Refusal composer of the CORE).
- Group: the file is untouched
  - Leaf 2: the refused Cargo.toml is byte-identical to what was written, with
    no partial rewrite.
- Group: no governed line for the refused path
  - Leaf 3: no governed line exists for the refused path, because the refusal
    never proceeds to a guarded write.
- Group: the contrast
  - Leaf 4: the sibling locatable plan was governed, so the refusal is
    entry-specific and not path-wide.
  - Leaf 5: the bytes of the governed sibling changed, so the contrast holds.

## Fixtures

- The exercise boot (via `Exercise()`) performs the two refusal-attempt writes: `cargoRefusal` (the dotted key that the raw text cannot locate) and `cargoRefusal2` (the locatable pretty-table manifest).
- `$DSH_TEST_SCRATCH/ledgers/cargo-governor.log`.

## Expected ledger strings (byte-exact)

- `REFUSED rewrite of <path>: dependency "leftover" in section "dependencies"
  not found in text \u2014 rewrite aborted` (U+2014) - asserted as an
  `endsWith`.
- ABSENT (the negative control): any `governed <refused-path> ` line.

## Edge cases

- The refusal is entry-specific, because the sibling manifest in the same run is governed and rewritten (leaf 4 and leaf 5 are the contrast).
- The own refusal guard of the package governor (non-dependency sections) is a defensive guard that the chain pass cannot trigger by construction, and it is documented here as the residual it is (see the wiring report).

## Env gate

`DSH_TEST_SCRATCH` must be set, and unset means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite that this folder was split from.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

5 PASS.
