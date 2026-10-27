# Refusal-Path / Live-Assertions

The folder covers the governed-path violation: the byte-identical REFUSED line and the untouched file.

## Intent

A governed-path violation inside the scratch tree must produce the byte-identical REFUSED ledger line and leave the file untouched (the negative case, safely, never touching the real trees of the user).

The contrast holds: the sibling pretty-table manifest (a locatable plan) goes through, so the refusal is entry-specific and not path-wide.

## Scenario

- **Group: the refusal ledger line.**

    - **Leaf 1.**

        The cargo governor logged the byte-identical REFUSED line (the Refusal composer of the CORE).

- **Group: the file is untouched.**

    - **Leaf 2.**

        The refused Cargo.toml is byte-identical to what was written, with no partial rewrite.

- **Group: no governed line for the refused path.**

    - **Leaf 3.**

        No governed line exists for the refused path, because the refusal never proceeds to a guarded write.

- **Group: the contrast.**

    - **Leaf 4.**

        The sibling locatable plan was governed, so the refusal is entry-specific and not path-wide.

    - **Leaf 5.**

        The bytes of the governed sibling changed, so the contrast holds.

## Fixtures

- **The exercise boot.**

    The boot (via `Exercise()`) performs the two refusal-attempt writes: `cargoRefusal` (the dotted key that the raw text cannot locate) and `cargoRefusal2` (the locatable pretty-table manifest).

- **The ledger.**

    The folder reads `$DSH_TEST_SCRATCH/ledgers/cargo-governor.log`.

## Expected ledger strings (byte-exact)

- **The refusal line.**

    The line is `REFUSED rewrite of <path>: dependency "leftover" in section "dependencies" not found in text \u2014 rewrite aborted` (U+2014), asserted as an `endsWith`.

- **The negative control.**

    The line is ABSENT: any `governed <refused-path> ` line.

## Edge cases

- **The entry-specific refusal.**

    The refusal is entry-specific, because the sibling manifest in the same run is governed and rewritten (leaf 4 and leaf 5 are the contrast).

- **The defensive guard.**

    The refusal guard of the package governor (non-dependency sections) is a defensive guard that the chain pass cannot trigger by construction, and the folder documents it here as the residual it is (see the wiring report).

## Env gate

`DSH_TEST_SCRATCH` must be set, and an unset variable means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite from which this folder was split.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

5 PASS.
