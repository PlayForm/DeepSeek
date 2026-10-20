# Profile-Assembly / Live-Assertions

The bundle list resolved through the harness's real loader, and the live
activation order.

## Intent

The `dsh.profile.bundles` list must be resolved by the harness's REAL loader
into composed patch layers in the bundle-list order (factory, governor,
pinner, cargo, the flavors, normalize-file), each carrying the package's real
name, with the base layers beneath the family; and at boot the pinner's
activation must precede the governor's (the smoke/live fidelity gap
Section 1.2-1, now asserted from the real ledger timestamps).

## Scenario

- Group: the bundle list resolved to the composed layers
  - Leaf 1: the factory bundle layer is composed.
  - Leaf 2: all eleven family plugin entries are composed.
  - Leaf 3: the family layers compose in the bundle-list order.
  - Leaf 4: each composed entry carries the package's real name (the bundle
    alias -> the identity).
- Group: the base layers beneath the family
  - Leaf 5: the dsh-base bundle layer is composed.
  - Leaf 6: the dsh-web-app bundle layer is composed.
  - Leaf 7: the base layers sit before the family layers.
- Group: the live activation order
  - Leaf 8: the pinner's activation line is ISO-stamped.
  - Leaf 9: the governor's activation line is ISO-stamped.
  - Leaf 10: the pinner's activation precedes the governor's (within the
    50ms activation race window).
- Group: the first activation line is the activation
  - Leaf 11: the pinner's first ledger line is the byte-identical activation
    line.

## Fixtures

- `dsh --profile dsh-test --dump-config` (via `DumpConfig("plain")`): the
  composed entry/patch layer document.
- The exercise boot (via `Exercise()`): produces the activation ledger lines
  that are the load-order evidence.
- `$DSH_TEST_SCRATCH/ledgers/pinner.log` and `.../governor.log`: read for
  the first-line activation assertions.

## Expected ledger strings (byte-exact)

- The pinner's first ledger line ends with:
  `activated (pinner, logFile=<scratch>/ledgers/pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])`
  (U+2014-free; the logFile value is part of the string).
- Every timestamp is the ISO UTC `[stamp] message` form.

## Edge cases

- The activation stamps race at millisecond resolution; the window tolerates
  the race (50ms), a gross inversion still fails.

## Env gate

`DSH_TEST_SCRATCH` must be set. Unset means `SKIPPED (no scratch home)` with
exit 0 - identical to the `.mjs` suite this folder was split from. The folder
is never forced green in `Maintain/Run-Smokes.mjs`; it runs under
`Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

11 PASS.
