# Governed-Write / Live-Assertions

Real writes through the event loop of the harness, checked by their bytes on disk.

## Intent

A real `raw-write` with `normalize: true` must leave the six-transform byte-normalized fixture on disk, and the governed event path must rewrite the governed manifest through the guarded write (the canonical pin).

The `govern: false` escape hatch must keep the event path silent, the cargo direct fold must rewrite the chain pin surgically, and the normalization-only cargo path must pad the simple version forms.

The `normalize-file` tool (through the observation-policy-disabled boot) must leave the normalized bytes and its ledger line without being a governance event.

## Scenario

- Group: the raw-write normalize path
  - Leaf 1: the `normalize:true` fixture is on disk byte-normalized (dashes,
    quotes, ellipsis, spaces, invisibles, fullwidth).
- Group: the governed event path
  - Leaf 2: the governed manifest was rewritten by the chain pass (3.0.0 ->
    ^4.2.0, the `JSON.stringify(2)+\n` form).
- Group: the escape hatch
  - Leaf 3: the `govern:false` raw-write kept the event path silent for the
    manifest (no governor line).
- Group: the direct fold
  - Leaf 4: the chain pin rewritten to the bare resolved version
    (`serde = "1.2.3"`).
- Group: the normalization-only cargo path
  - Leaf 5: the simple version forms padded inline (1.0 -> 1.0.0).
- Group: the normalize-file tool
  - Leaf 6: the tool left the expected normalized bytes on disk.
  - Leaf 7: the normalize-file ledger logged `normalized 8 char(s) in <path>`.
  - Leaf 8: the normalize-file write is not a governance event (no governor
    line for it).

## Fixtures

- The exercise boot (via `Exercise()`) performs the probe event write, the raw-write manifest, the raw-write normalize, the root `llm/stream` waterfall, and the cargo writes, and the on-disk results are the fixtures of this folder.
- The normalize-file boot (via `NormalizeFileBoot()`) is the observation-policy-disabled boot that seeds through the tool path and runs the normalize-file tool.
- `$DSH_TEST_SCRATCH/ledgers/governor.log` and `.../normalize-file.log`.

## Expected ledger strings (byte-exact)

- `normalized 8 char(s) in <nf-work>/normalize-file-target.md` (the normalize-file ledger, where 8 is the total transform count of the six-flavor fixture).
- ABSENT (the negative controls): any governor line containing the `govern:false` manifest path, or the normalize-file target path.

## Edge cases

- The escape-hatch check is the negative control, because the event path must stay silent for the ungoverned manifest.
- The normalize-file seed is created THROUGH the tool path, because a plain-fs write is unobserved and the fs guard would refuse the overwrite.

## Env gate

`DSH_TEST_SCRATCH` must be set, and unset means `SKIPPED (no scratch home)` with exit 0, identical to the `.mjs` suite that this folder was split from.

The folder is never forced green in `Maintain/Run-Smokes.mjs`, and it runs under `Maintain/Run-Wiring.mjs`, which always sets the gate.

## Expected count

8 PASS.

Note (recorded 2026-10-20, the lane's fresh baseline): with the CURRENT built targets the normalize-file tool does not register (the boot log shows `command "normalize-overpass" is already registered`, and the later flavors fail to finish mounting), so the folder currently prints `6 PASS - ...` with the two normalize-file checks failing.

The expected count above is the count of the healthy battery, and the failures are pre-existing live state rather than a property of this folder.
