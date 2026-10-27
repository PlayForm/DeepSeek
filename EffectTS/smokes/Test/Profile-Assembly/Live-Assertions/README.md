# Profile-Assembly / Live-Assertions

The folder covers the bundle list resolved through the real loader of the harness, and the live activation order.

## Intent

The harness's REAL loader must resolve the `dsh.profile.bundles` list into composed patch layers in the order of the bundle list (factory, governor, pinner, cargo, the flavors, normalize-file), each carrying the real name of the package, with the base layers beneath the family.

At boot the activation of the pinner must precede the activation of the governor (the smoke/live fidelity gap Section 1.2-1, now asserted from the real ledger timestamps).

## Scenario

- **Group: the bundle list resolved to the composed layers.**

    - **Leaf 1.**

        The factory bundle layer is composed.

    - **Leaf 2.**

        All eleven family plugin entries are composed.

    - **Leaf 3.**

        The family layers compose in the order of the bundle list.

    - **Leaf 4.**

        Each composed entry carries the real name of the package (the bundle alias -> the identity).

- **Group: the base layers beneath the family.**

    - **Leaf 5.**

        The dsh-base bundle layer is composed.

    - **Leaf 6.**

        The dsh-web-app bundle layer is composed.

    - **Leaf 7.**

        The base layers sit before the family layers.

- **Group: the live activation order.**

    - **Leaf 8.**

        The activation line of the pinner is ISO-stamped.

    - **Leaf 9.**

        The activation line of the governor is ISO-stamped.

    - **Leaf 10.**

        The activation of the pinner precedes the activation of the governor (within the 50ms activation race window).

- **Group: the first activation line is the activation.**

    - **Leaf 11.**

        The first ledger line of the pinner is the byte-identical activation line.

## Fixtures

- **The composed layer document.**

    The fixture is `dsh --profile dsh-test --dump-config` (via `DumpConfig("plain")`).

- **The exercise boot.**

    The boot (via `Exercise()`) produces the activation ledger lines that are the load-order evidence.

- **The ledger files.**

    The folder reads `$DSH_TEST_SCRATCH/ledgers/pinner.log` and `.../governor.log` for the first-line activation assertions.

## Expected ledger strings (byte-exact)

- **The pinner's first line.**

    The first ledger line of the pinner ends with `activated (pinner, logFile=<scratch>/ledgers/pinner.log, sections=[dependencies, devDependencies, peerDependencies, optionalDependencies], exclude=[node_modules, .git, .dsh, .pnpm, .store, DeepSeek Harness.app])` (U+2014-free, and the logFile value is part of the string).

- **The timestamps.**

    Every timestamp is the ISO UTC `[stamp] message` form.

## Edge cases

The activation stamps race at millisecond resolution, so the window tolerates the race (50ms) and a gross inversion still fails.

## Env gate

`DSH_TEST_SCRATCH` must be set, and an unset variable means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite from which this folder was split.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

11 PASS.
