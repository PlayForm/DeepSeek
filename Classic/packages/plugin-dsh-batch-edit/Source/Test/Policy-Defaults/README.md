# Policy-Defaults

The policy block (D6) on the batch edit tool: the defaults, the State
mapping, and the apply gate's two ways - the shipped `approve` refusal and the
`auto` apply.

## Intent

D6 makes automation a per-plugin allowlist. The batch edit tool's gated action
is the apply (the write of every planned transition): the shared block's
`write` verdict is the OUTER gate in front of the commit. This folder proves
the block is real config, not dead text - an `approve` verdict refuses the
apply BEFORE any plan or write with the documented line, and an `auto` verdict
proceeds through the factory's write executor - and it pins the shipped
posture: a default mount can never write.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the tool's schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { write: "auto" }` replaces write and keeps the other seven.
- Group P2: the approve verdict REFUSES the apply.
    - Check: "P2: the default mount refuses the apply with the documented
      line" - the commit rejects with the exact thrown line
      `plugin-dsh-batch-edit: apply refused mach-1 (policy write=approve)`
      and the same line is durable in the ledger.
    - Check: "P2: nothing was planned or written and the machine stays open" -
      zero writes, zero reads (the gate precedes the plan), the machine open
      and unclosed, the held cell still `observed`, no `transition applied`
      line.
- Group P3: the auto verdict proceeds.
    - Check: "P3: an auto verdict applies the transition through the write
      executor" - with `policy.write: auto`, one file applied, one write, the
      byte-exact `transition applied a.txt version v1 -> v2` line, and no
      refusal line.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real
factory instance, the fake ctx with the content-backed fake fs (the write and
read recorders), and the `Setup` mount (enabled + the ledger). The default
mount keeps the shipped `write: approve`; a scenario opens the gate
explicitly.

## Expected ledger strings (byte-exact, `plugin-dsh-batch-edit: ` prefix)

`apply refused <id> (policy write=approve)`,
`transition applied <file> version <old> -> <new>`.

## Expected count

6 PASS.
