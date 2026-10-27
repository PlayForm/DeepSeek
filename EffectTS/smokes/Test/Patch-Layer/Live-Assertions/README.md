# Patch-Layer / Live-Assertions

The folder tests the effective-config rule: the patch config replaces the entry config wholesale.

## Intent

The semantics of the patch layer must be observable in the real projection of the harness: the defaults of the bundle layer are visible before any patch, and the entry config of the wiring overlay REPLACES the entry config wholesale, so an omitted cell falls back to the schema default and not to the value of the bundle layer.

A one-row patch toggle flips a family Config value, and the `$DSH_HOME/cordis.patch.yml` home-level layer is applied over the layer of the profile itself, leaving no residue afterwards.

## Scenario

- **Group: the bundle layer defaults.**

    - **Leaf 1.**

        The governor has `updateCooldownMs: 3000` before any patch.

    - **Leaf 2.**

        The logFile default of the governor is the un-expanded `~/.dsh` form (the silent-catch ledger gap).

- **Group: the wiring overlay - the wholesale replacement.**

    - **Leaf 3.**

        The governor logFile of the overlay replaces the entry config.

    - **Leaf 4.**

        The dash flavor has the plain `normalizeToolArguments: true` before any patch.

    - **Leaf 5.**

        The overlay config of the dash flavor is projected exactly.

- **Group: the wholesale rule, observable.**

    - **Leaf 6.**

        An overlay row that omits `normalizeToolArguments` leaves the cell absent from the composed config, so the schema default wins at runtime and not the true of the bundle layer.

- **Group: the patch toggle.**

    - **Leaf 7.**

        A one-row patch flips the dash replacement to `>` as the harness projects it.

- **Group: the home-level patch layer.**

    - **Leaf 8.**

        The home-level patch is applied over the layer of the profile itself.

    - **Leaf 9.**

        The home-level patch left no residue in the scratch home.

## Fixtures

- **The dump variants.**

    The fixture is `dsh --profile dsh-test --dump-config` via `DumpConfig` with four variants: `plain` (no patch), `overlay` (the wiring overlay), `wholesale` and `toggle` (temporary one-row overlays written into the scratch home and removed in `finally`), and `home-patch` (a temporary `$DSH_HOME/cordis.patch.yml`).

- **The flattening.**

    The dump renders long scalars as YAML folded block scalars, and `EntryConfig` flattens them so that substring assertions hold.

## Expected ledger strings (byte-exact)

This folder asserts composed-config text and not ledger lines.

The asserted strings include `logFile: ~/.dsh/playform/ets-hook-dsh-package-governor.log` (the un-expanded bundle-layer default) and `logFile: <scratch>/ledgers/governor.log` (the replacement of the overlay).

## Edge cases

- **The wholesale check.**

    The wholesale check is the negative control, because an omitted cell must be ABSENT and not inherited from the bundle layer.

- **The temporary files.**

    The temporary overlay and home-patch files are removed in `finally`, and the home patch is only removed when this folder wrote it.

## Env gate

`DSH_TEST_SCRATCH` must be set, and an unset variable means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite from which this folder was split.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

9 PASS.
