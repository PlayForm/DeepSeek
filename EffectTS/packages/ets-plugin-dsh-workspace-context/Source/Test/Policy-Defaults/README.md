# Policy-Defaults

The policy block (D6) on the workspace-context service covers the defaults, the State mapping, and the proof that this read-only package has no gated action.

## Intent

D6 makes automation a per-plugin allowlist.

The context service only reads the sibling graph and builds the orientation packet, so it has NO gated action: the `read`/`index`/`record` verdicts of the shared block are `auto`, and nothing in the plugin consults `Decide` to refuse.

This folder proves the block is real config and not dead text: the schema fills the D6 defaults, the apply maps the block to `State.Allow`, and an explicit override replaces exactly one key.

Every action class that the package uses decides `auto` with no policy/held line, and a representative read-only packet build still proceeds and writes no file.

## Scenario

- **Group P1: the schema and the State mapping.**

    - **Check: "P1: the context's schema fills the D6 policy defaults".**

        The composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).

    - **Check: "P1: the built State carries the block on Allow".**

        The apply maps `policy` to `State.Allow` with the same defaults.

    - **Check: "P1: a policy override lands on the built State".**

        An explicit `policy: { read: "approve" }` replaces read and keeps the other seven.

- **Group P2: the package has NO gated action.**

    - **Check: "P2: the context's action classes all decide auto".**

        `Decide` on read, index, and record returns `auto`, and the ledger of the mount has no line containing "policy" or "held".

- **Group P3: a representative read-only action proceeds.**

    - **Check: "P3: the packet still builds under the shipped defaults and writes no file".**

        `packet({})` returns the honest absent-graph packet (`WORKSPACE workspace @ unknown`, the OPEN line, a positive token estimate), no refusal line appears, and the fake fs recorded zero writes.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` apply, the real factory instance, and the fake ctx (the read-only fs purity guard with its `writes` recorder).

No sibling graph is attached, because the absent-graph packet is the cheapest representative read.

No gate is exercised, because the package has none.

## Expected ledger strings (byte-exact, `context: ` prefix)

The expected lines are the unchanged activation line `activated (budget=2000/4000, lenses=3)` and the unchanged packet line `packet (none) (<tokens> tok, lens code)`.

No policy or held line exists on the path of this package.

## Expected count

5 PASS.
