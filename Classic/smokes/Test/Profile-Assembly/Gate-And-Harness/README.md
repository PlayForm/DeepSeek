# Profile-Assembly / Gate-And-Harness

The skip guard and shared harness of the wiring suite, kept as its own folder.

## Intent

Every wiring suite stands on the same harness contract: the folder self-skips without `DSH_TEST_SCRATCH` (the mechanics-only `pnpm test` never touches the harness), the gate reads the environment exactly, the scratch lifecycle creates or reuses a complete isolated scratch home, and a second `EnsureScratch` call reuses the same home without a rebuild.

This folder asserts that contract for the Profile-Assembly suite, so a broken harness fails here before any live assertion can run on top of it.

## Scenario

- Group: the skip guard
  - Leaf: without `DSH_TEST_SCRATCH` the folder prints
    `SKIPPED (no scratch home)` and exits 0 (the negative control: the folder
    spawns its own compiled Test.mjs with the variable removed from the child
    environment; the child exits at the gate, so no scratch is created and no
    recursion happens).
- Group: the gate reads the environment exactly
  - Leaf: `ScratchHome()` is exactly the `DSH_TEST_SCRATCH` value.
- Group: the scratch lifecycle
  - Leaf: `EnsureScratch` returns the complete path set (home, profile,
    tarballs, ledgers, work), and every path exists on disk.
  - Leaf: the home is the designated `DSH_TEST_SCRATCH` and never the real
    `~/.dsh`.
  - Leaf: a second `EnsureScratch` reuses the same home through the
    `.wiring-ready.json` marker, with no rebuild.

## Fixtures

- The shared wiring harness: `../../../wiring-live.mjs`, which is the real `.mjs` that the `.mjs` suites import, with no copy and no drift.
- `$DSH_TEST_SCRATCH`: the scratch home, where the folder self-skips when the variable is unset, and the first run creates the full scratch when it is set (12 pack tarballs, the profile skeleton, the wiring overlay, the exercise driver, the fake cargo shim) while later runs reuse it via the marker.

## Env gate

`DSH_TEST_SCRATCH` must be set, and unset means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite that this folder was split from.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

5 PASS.
