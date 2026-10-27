# Policy-Defaults

The policy block (D6) on the reflect service covers the defaults, the State mapping, the two ways of the write gate (the replace and the rename), and the rule that only the `write` key opens the gate.

## Intent

D6 makes automation a per-plugin allowlist.

The gated actions of the reflect service are its WRITES: a `replace` and a `rename` publish through the guarded write, so the `write` verdict of the shared block is the gate in front of the publish path.

This folder proves the block is real config and not dead text: an `approve` verdict refuses both operations with their documented lines and **zero writes** (the plugin does not even read the file), and an `auto` verdict proceeds to the write path with the fingerprint targeting unchanged.

The folder also pins that an override of a different action never widens the write gate.

## Scenario

- **Group P1: the schema and the State mapping.**

    - **Check: "P1: the service's schema fills the D6 policy defaults".**

        The composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).

    - **Check: "P1: the built State carries the block on Allow".**

        The apply maps `policy` to `State.Allow` with the same defaults.

    - **Check: "P1: a policy override lands on the built State".**

        An explicit `policy: { write: "auto" }` replaces write and keeps the other seven.

- **Group P2: the approve verdict HOLDS the replace and the rename.**

    - **Check: "P2: an approve verdict refuses the replace with the exact line".**

        The reply is `{ status: "rejected", detail: "the policy holds the replace (write=approve)", version: undefined }`, and the ledger records `replace held /repo/src/a.ts (policy write=approve)`.

    - **Check: "P2: the held replace never touches the file".**

        The operation does zero writes and zero reads, and the bytes are unchanged.

    - **Check: "P2: an approve verdict refuses the rename with the exact line".**

        The rename gets the same shape with `rename held /repo/src/a.ts (policy write=approve)`, and it still writes nothing.

- **Group P3: the auto verdict proceeds.**

    - **Check: "P3: an auto verdict proceeds to the write path".**

        With `policy.write: auto` the replace applies, exactly one write lands, the first line is rewritten, and there is no held line.

    - **Check: "P3: the rename proceeds on the same open gate".**

        The rename applies, and the ledger records its byte-exact line.

- **Group P4: only the write key opens this gate.**

    - **Check: "P4: a commit override never opens the write gate".**

        With `policy.commit: auto` the replace is still held with the documented line, and it still writes nothing.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, the fake ctx, the fake fs seeded with a three-line TypeScript file, and the `Mount` helper (enabled + the given config overrides).

The mount keeps the shipped `write: approve`, and a scenario opens the gate explicitly with `policy: { write: "auto" }`.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`replace held <path> (policy write=approve)`,
`rename held <path> (policy write=approve)`,
`replace <path> lines <a>-<b> (applied)`,
`rename <path> <old> -> <new> (applied)`.

## Expected count

9 PASS.
