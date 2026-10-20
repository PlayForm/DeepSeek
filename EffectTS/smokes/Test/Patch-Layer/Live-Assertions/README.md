# Patch-Layer / Live-Assertions

The effective-config rule: the patch config replaces the entry config
wholesale.

## Intent

The patch layer semantics must be observable in the harness's real
projection: the bundle layer's defaults are visible before any patch, the
wiring overlay's entry config REPLACES the entry config wholesale (an omitted
cell falls back to the schema default, not to the bundle layer's value), a
one-row patch toggle flips a family Config value, and the
`$DSH_HOME/cordis.patch.yml` home-level layer is applied over the profile's
own layer - leaving no residue afterwards.

## Scenario

- Group: the bundle layer defaults
  - Leaf 1: the governor's `updateCooldownMs: 3000` before any patch.
  - Leaf 2: the governor's logFile default is the un-expanded `~/.dsh` form
    (the silent-catch ledger gap).
- Group: the wiring overlay - the wholesale replacement
  - Leaf 3: the overlay's governor logFile replaces the entry config.
  - Leaf 4: the dash flavor's plain `normalizeToolArguments: true` before any
    patch.
  - Leaf 5: the dash flavor's overlay config is projected exactly.
- Group: the wholesale rule, observable
  - Leaf 6: an overlay row that omits `normalizeToolArguments` leaves the
    cell absent from the composed config (the schema default wins at runtime,
    not the bundle layer's true).
- Group: the patch toggle
  - Leaf 7: a one-row patch flips the dash replacement to `>` as the harness
    projects it.
- Group: the home-level patch layer
  - Leaf 8: the home-level patch is applied over the profile's own layer.
  - Leaf 9: the home-level patch left no residue in the scratch home.

## Fixtures

- `dsh --profile dsh-test --dump-config` via `DumpConfig` with four variants:
  `plain` (no patch), `overlay` (the wiring overlay), `wholesale` and
  `toggle` (temporary one-row overlays written into the scratch home and
  removed in `finally`), `home-patch` (a temporary `$DSH_HOME/cordis.patch.yml`).
- The dump renders long scalars as YAML folded block scalars; `EntryConfig`
  flattens them so substring assertions hold.

## Expected ledger strings (byte-exact)

This folder asserts composed-config text, not ledger lines. The asserted
strings include `logFile: ~/.dsh/ets-hook-dsh-package-governor.log` (the
un-expanded bundle-layer default) and `logFile: <scratch>/ledgers/governor.log`
(the overlay's replacement).

## Edge cases

- The wholesale check is the negative control: an omitted cell must be
  ABSENT (not inherited from the bundle layer).
- The temporary overlay and home-patch files are removed in `finally`; the
  home patch is only removed when this folder wrote it.

## Env gate

`DSH_TEST_SCRATCH` must be set. Unset means `SKIPPED (no scratch home)` with
exit 0 - identical to the `.mjs` suite this folder was split from. The folder
is never forced green in `Maintain/Run-Smokes.mjs`; it runs under
`Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

9 PASS.
