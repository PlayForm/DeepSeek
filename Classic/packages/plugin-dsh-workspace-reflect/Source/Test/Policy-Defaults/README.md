# Policy-Defaults

The policy block (D6) on the reflect service: the defaults, the State mapping,
and the write gate's two ways (the replace and the rename) plus the rule that
only the `write` key opens it.

## Intent

D6 makes automation a per-plugin allowlist. The reflect's gated actions are
its WRITES: a `replace` and a `rename` publish through the guarded write, so
the shared block's `write` verdict is the gate in front of the publish path.
This folder proves the block is real config, not dead text - an `approve`
verdict refuses both operations with their documented lines and **zero
writes** (the file is not even read), and an `auto` verdict proceeds to the
write path with the fingerprint targeting unchanged - and it pins that a
different action's override never widens the write gate.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the service's schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { write: "auto" }` replaces write and keeps the other seven.
- Group P2: the approve verdict HOLDS the replace and the rename.
    - Check: "P2: an approve verdict refuses the replace with the exact line" -
      the reply is `{ status: "rejected", detail: "the policy holds the
      replace (write=approve)", version: undefined }` and the ledger records
      `replace held /repo/src/a.ts (policy write=approve)`.
    - Check: "P2: the held replace never touches the file" - zero writes, zero
      reads, the bytes are unchanged.
    - Check: "P2: an approve verdict refuses the rename with the exact line" -
      the same shape for the rename, `rename held /repo/src/a.ts (policy
      write=approve)`, still zero writes.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict proceeds to the write path" - with
      `policy.write: auto` the replace applies, exactly one write lands, the
      first line is rewritten, and there is no held line.
    - Check: "P3: the rename proceeds on the same open gate" - the rename
      applies and its byte-exact line is recorded.
- Group P4: only the write key opens this gate.
    - Check: "P4: a commit override never opens the write gate" - with
      `policy.commit: auto` the replace is still held with the documented line
      and still writes nothing.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory
instance, the fake ctx, the fake fs seeded with a three-line TypeScript file,
and the `Mount` helper (enabled + the given config overrides). The mount keeps
the shipped `write: approve`; a scenario opens the gate explicitly with
`policy: { write: "auto" }`.

## Expected ledger strings (byte-exact, `reflect: ` prefix)

`replace held <path> (policy write=approve)`,
`rename held <path> (policy write=approve)`,
`replace <path> lines <a>-<b> (applied)`,
`rename <path> <old> -> <new> (applied)`.

## Expected count

9 PASS.
