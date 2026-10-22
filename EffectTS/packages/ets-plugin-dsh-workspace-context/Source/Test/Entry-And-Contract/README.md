# Entry-And-Contract - the loader contract and the mount

The object-form loader contract and the IDLE-forever posture: the default
object, the cold mount, the fail-loud validation, the enabled mount.

## Scenarios

- E1: the default object carries name (`plugin-dsh-workspace-context`),
  `apply`, `Config` and `inject` (`["pluginFactory"]`).
- E2: the cold mount (enabled=false): apply returns nothing, the service
  is still provided (name `workspaceContext`), the byte-exact
  `context: disabled (enabled=false)` line (logger AND durable `[ISO]`
  file), no tool, no root seam, no effect.
- E3: the fail-loud validation - five invalid configs throw at load (four
  with the byte-exact `context: ` messages; a non-array `lenses` is caught
  earlier by the schema itself: `$.lenses expected array but got nope`).
- E4: the enabled mount - the byte-exact
  `context: activated (budget=2000/4000, lenses=3)` line, the
  `workspace_context` tool registered, the volatile cells arriving as
  `{ get }` cells and unwrapping onto the state.

## Fixtures

The shared Harness (fake ctx with a DISTINCT root object, the real factory
instance, the real built Target, the tools facility capture, the fs purity
capture, a fresh temporary directory per folder process).

## Expected ledger strings (byte-exact, `context: ` prefix)

`disabled (enabled=false)`, `activated (budget=2000/4000, lenses=3)`.

## Expected count

13 PASS.
