# Scratch-Profile / Live-Assertions

The scratch profile's skeleton validity, asserted against the live harness.

## Intent

The freshly created scratch profile must be a valid Section 2.3 skeleton of
the plan: the bundle list mirrors the live desktop profile, the root is the
empty entry list, the user patch layer is minimal and free of personal or
family config, the install settings match the live profile's, the 12 release
tarballs are packed publish-identically, the post-install tree has no
symlinks outside pnpm's own layout, every `@playform` entry is a real copied
directory, the installed build bytes match the packed tarball, and the
scratch-only exercise driver is installed. This is the ground truth every
other wiring suite builds on.

## Scenario

- Group: the isolation
  - Leaf 1: the home is not the real `~/.dsh`.
  - Leaf 2: the home is the suite's own `DSH_TEST_SCRATCH`.
  - Leaf 3: the dsh-test profile directory exists.
- Group: the skeleton (Section 2.3)
  - Leaf 4: the bundle list mirrors the live desktop profile (13 entries,
    ordered).
  - Leaf 5: cordis.yml is the empty root entry list (pre-boot form, or the
    loader's rewritten root-comment anchor after a boot).
  - Leaf 6: the user patch layer carries no personal config.
  - Leaf 7: the user patch layer is empty of family overrides (the wiring
    overlay is separate).
  - Leaf 8: pnpm-workspace.yaml exists (pnpm 11 settings home).
  - Leaf 9: the install is hoisted like the live desktop profile.
  - Leaf 10: the profile has a produced lockfile.
- Group: the tarballs (Method 1 - publish-identical)
  - Leaf 11: the 13 release tarballs were packed (the ets group packs the
    base too).
  - Leaf 12: every tarball is a `@playform` pack artifact.
- Group: the no-symlink invariant (Section 2.2)
  - Leaf 13: `find $SCRATCH -type l` is empty outside pnpm's own layout.
- Group: the real directories
  - Leaf 14: `node_modules/@playform` exists.
  - Leaf 15: every expected entry is a real directory (copied, never
    linked).
- Group: the publish-identical install (Section 2.2)
  - Leaf 16: the installed factory `Target/Library.js` bytes match the
    packed tarball.
  - Leaf 17: the installed dash flavor `Target/Library.js` bytes match the
    packed tarball.
- Group: the exercise driver
  - Leaf 18: the wiring-exercise driver is installed in the scratch profile.

## Fixtures

- `$DSH_TEST_SCRATCH`: the scratch home (created by `EnsureScratch` on first
  use: 13 `pnpm pack` tarballs from the EffectTS packages, the profile
  skeleton, `file:` tarball deps, the wiring overlay, the scratch-only
  exercise driver, a fake cargo shim).
- No tree Target is imported; the harness drives the `dsh` CLI and the
  scratch files only.

## Expected ledger strings (byte-exact)

This folder reads no ledgers; its contract is the scratch tree itself (the
bundle list, the empty root, the minimal patch layer, the hoisted install,
the tarball set, the copied directories, the byte-identical install).

## Edge cases

- The cordis.yml check accepts both the pre-boot empty list (`[]`) and the
  loader's rewritten root-comment anchor after a boot.
- The tarball lookup picks the newest matching `playform-<short>-*.tgz`.
- Every mutation is under the scratch home; the user's real `~/.dsh` is only
  ever read (and only by the user, not by this suite).

## Env gate

`DSH_TEST_SCRATCH` must be set. Unset means `SKIPPED (no scratch home)` with
exit 0 - identical to the `.mjs` suite this folder was split from. The folder
is never forced green in `Maintain/Run-Smokes.mjs`; it runs under
`Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

18 PASS.
