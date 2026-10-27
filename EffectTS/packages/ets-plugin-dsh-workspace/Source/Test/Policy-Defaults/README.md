# Policy-Defaults

The policy block (D6) on the workspace agent: the defaults, the State mapping,
and the proof that this read-only package has no gated action.

## Intent

D6 makes automation a per-plugin allowlist. The workspace agent only reads the
graph (and triggers the indexing that fills it), so it has NO gated action: the
shared block's `read`/`index`/`record` verdicts are `auto` and nothing in the
plugin consults `Decide` to refuse. This folder proves the block is real config,
not dead text - the schema fills the D6 defaults, the apply maps the block to
`State.Allow`, an explicit override replaces exactly one key, every action class
the package uses decides `auto` with no policy/held line, and a representative
read-only tool still proceeds and writes no file.

## Scenario

- Group P1: the schema and the State mapping.
    - Check: "P1: the workspace's schema fills the D6 policy defaults" - the
      composed `policy` cell deep-equals the D6 defaults
      (read/index/record/suggest/message = auto, write/commit/spawn =
      approve).
    - Check: "P1: the built State carries the block on Allow" - the apply maps
      `policy` to `State.Allow` with the same defaults.
    - Check: "P1: a policy override lands on the built State" - an explicit
      `policy: { read: "approve" }` replaces read and keeps the other seven.
- Group P2: the package has NO gated action.
    - Check: "P2: the workspace's action classes all decide auto" - `Decide` on
      read, index and record returns `auto`, and the mount's ledger has no line
      containing "policy" or "held".
- Group P3: a representative read-only action proceeds.
    - Check: "P3: workspace_map still proceeds under the shipped defaults and
      writes no file" - the map answers from the standard graph (2 files, 2
      modules, revision `rev-1`), no refusal line appears, and the fake fs
      recorded zero writes.

## Fixtures

The shared Harness: the real built `Target/Library.js` apply, the real factory
instance, the fake ctx (the throwing fs purity seam with its `writes` recorder),
and the deterministic `StandardGraph` fixture. No gate is exercised because the
package has none.

## Expected ledger strings (byte-exact, `plugin-dsh-workspace: ` prefix)

The unchanged activation line
`activated (bundle 0.3.0, tools=5)` and the unchanged map line
`workspace: map (root) (2 modules, 2 files)`.
No policy or held line exists on this package's path.

## Expected count

5 PASS.
