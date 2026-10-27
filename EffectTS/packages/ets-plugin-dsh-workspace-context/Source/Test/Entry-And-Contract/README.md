# Entry-And-Contract - the loader contract and the mount

The suite covers the object-form loader contract and the IDLE-forever posture: the default object, the cold mount, the fail-loud validation, and the enabled mount.

## Scenarios

- **E1.**

    The default object carries name (`plugin-dsh-workspace-context`), `apply`, `Config`, and `inject` (`["pluginFactory"]`).

- **E2.**

    The cold mount (enabled=false) returns nothing from apply, still provides the service (name `workspaceContext`), and writes the byte-exact `context: disabled (enabled=false)` line to the logger AND the durable `[ISO]` file.

    The mount has no tool, no root seam, and no effect.

- **E3.**

    The fail-loud validation throws at load for five invalid configs, four of them with the byte-exact `context: ` messages, and the schema itself catches a non-array `lenses` earlier: `$.lenses expected array but got nope`.

- **E4.**

    The enabled mount writes the byte-exact `context: activated (budget=2000/4000, lenses=3)` line, registers the `workspace_context` tool, and the volatile cells arrive as `{ get }` cells and unwrap onto the state.

## Fixtures

The shared Harness supplies a fake ctx with a DISTINCT root object, the real factory instance, the real built Target, the tools facility capture, the fs purity capture, and a fresh temporary directory for each folder process.

## Expected ledger strings (byte-exact, `context: ` prefix)

`disabled (enabled=false)`, `activated (budget=2000/4000, lenses=3)`.

## Expected count

13 PASS.
