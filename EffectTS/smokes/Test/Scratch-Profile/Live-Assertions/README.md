# Scratch-Profile / Live-Assertions

The folder asserts the skeleton validity of the scratch profile against the live harness.

## Intent

The freshly created scratch profile must be a valid Section 2.3 skeleton of the plan: the bundle list mirrors the live desktop profile, the root is the empty entry list, and the user patch layer is minimal and free of personal or family config.

The install settings match those of the live profile, the 12 release tarballs are packed publish-identically, and the post-install tree has no symlinks outside the layout of pnpm.

Every `@playform` entry is a real copied directory, the installed build bytes match the packed tarball, and the scratch-only exercise driver is installed.

This profile is the ground truth on which every other wiring suite builds.

## Scenario

- **Group: the isolation.**

    - **Leaf 1.**

        The home is not the real `~/.dsh`.

    - **Leaf 2.**

        The home is the `DSH_TEST_SCRATCH` of the suite itself.

    - **Leaf 3.**

        The dsh-test profile directory exists.

- **Group: the skeleton (Section 2.3).**

    - **Leaf 4.**

        The bundle list mirrors the live desktop profile (13 entries, ordered).

    - **Leaf 5.**

        cordis.yml is the empty root entry list (the pre-boot form, or the rewritten root-comment anchor of the loader after a boot).

    - **Leaf 6.**

        The user patch layer carries no personal config.

    - **Leaf 7.**

        The user patch layer is empty of family overrides (the wiring overlay is separate).

    - **Leaf 8.**

        pnpm-workspace.yaml exists (the settings home of pnpm 11).

    - **Leaf 9.**

        The install is hoisted like the live desktop profile.

    - **Leaf 10.**

        The profile has a produced lockfile.

- **Group: the tarballs (Method 1 - publish-identical).**

    - **Leaf 11.**

        The 13 release tarballs were packed (the ets group packs the base too).

    - **Leaf 12.**

        Every tarball is a `@playform` pack artifact.

- **Group: the no-symlink invariant (Section 2.2).**

    - **Leaf 13.**

        `find $SCRATCH -type l` is empty outside the layout of pnpm.

- **Group: the real directories.**

    - **Leaf 14.**

        `node_modules/@playform` exists.

    - **Leaf 15.**

        Every expected entry is a real directory (copied, never linked).

- **Group: the publish-identical install (Section 2.2).**

    - **Leaf 16.**

        The installed factory `Target/Library.js` bytes match the packed tarball.

    - **Leaf 17.**

        The installed dash flavor `Target/Library.js` bytes match the packed tarball.

- **Group: the exercise driver.**

    - **Leaf 18.**

        The wiring-exercise driver is installed in the scratch profile.

## Fixtures

- **The scratch home.**

    `$DSH_TEST_SCRATCH` is created by `EnsureScratch` on first use: 13 `pnpm pack` tarballs from the EffectTS packages, the profile skeleton, `file:` tarball deps, the wiring overlay, the scratch-only exercise driver, and a fake cargo shim.

- **No tree Target.**

    The folder imports no tree Target, because the harness drives the `dsh` CLI and the scratch files only.

## Expected ledger strings (byte-exact)

This folder reads no ledgers, because its contract is the scratch tree itself (the bundle list, the empty root, the minimal patch layer, the hoisted install, the tarball set, the copied directories, and the byte-identical install).

## Edge cases

- **The cordis.yml check.**

    The check accepts both the pre-boot empty list (`[]`) and the rewritten root-comment anchor of the loader after a boot.

- **The tarball lookup.**

    The lookup picks the newest matching `playform-<short>-*.tgz`.

- **The mutations.**

    Every mutation is under the scratch home, and the real `~/.dsh` of the user is only ever read (and only by the user, not by this suite).

## Env gate

`DSH_TEST_SCRATCH` must be set, and an unset variable means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite from which this folder was split.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

18 PASS.
