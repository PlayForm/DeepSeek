# Policy-Defaults

The policy block (D6) on the workspace graph covers the defaults, the State mapping, and the proof that this index-only package has no gated action.

## Intent

D6 makes automation a per-plugin allowlist.

The graph only indexes and reads the workspace, so it has NO gated action: the `read`/`index`/`record` verdicts of the shared block are `auto`, and nothing in the plugin consults `Decide` to refuse.

This folder proves the block is real config and not dead text: the schema fills the D6 defaults, the constructor maps the block to `State.Allow`, and an explicit override replaces exactly one key.

Every action class that the package uses decides `auto` with no policy/held line, and a representative index action still proceeds and writes no file.

## Scenario

- **Group P1: the schema and the State mapping.**

    - **Check: "P1: the graph's schema fills the D6 policy defaults".**

        The composed `policy` cell deep-equals the D6 defaults (read/index/record/suggest/message = auto, write/commit/spawn = approve).

    - **Check: "P1: the built State carries the block on Allow".**

        The constructor maps `policy` to `State.Allow` with the same defaults.

    - **Check: "P1: a policy override lands on the built State".**

        An explicit `policy: { index: "approve" }` replaces index and keeps the other seven.

- **Group P2: the package has NO gated action.**

    - **Check: "P2: the graph's action classes all decide auto".**

        `Decide` on index, read, and record returns `auto`, and the ledger of the mount has no line containing "policy" or "held".

- **Group P3: a representative index action proceeds.**

    - **Check: "P3: indexFile still proceeds under the shipped defaults and writes no file".**

        The fake fs serves one file, `indexFile` reports `indexed`, the graph holds one file, no refusal line appears, and the writeText recorder stays empty.

## Fixtures

The shared Harness supplies the real built `Target/Library.js` class, the fake ctx (the in-memory files map with the writeText capture), and the schema-validated config through `GraphClass.Config`.

No gate is exercised, because the package has none.

## Expected ledger strings (byte-exact, `graph: ` prefix)

The expected lines are the unchanged activation line `activated (domain=workspace_graph, languages=3)` and the unchanged index line `indexed <path> version <version> (<nodes> nodes, <edges> edges)`.

No policy or held line exists on the path of this package.

## Expected count

5 PASS.
