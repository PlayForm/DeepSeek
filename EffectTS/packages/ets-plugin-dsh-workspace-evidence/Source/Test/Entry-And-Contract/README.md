# Entry-And-Contract - the loader contract and the mount

The suite covers the object-form loader contract and the IDLE-forever posture: the default object, the cold mount, the fail-loud validation, and the enabled mount.

## Scenarios

- **E1.**

    The default object carries name (`plugin-dsh-workspace-evidence`), `apply`, `Config`, and `inject` (`["pluginFactory"]`).

- **E2.**

    The cold mount (enabled=false) returns nothing from apply, still provides the service (name `workspaceEvidence`), and writes the byte-exact `evidence: disabled (enabled=false)` line to the logger AND the durable `[ISO]` file.

    The mount has no root listener and no effect, and the service still answers honestly: a validate fails loud with `evidence: service is disabled (enabled=false)`, and an invalidate finds nothing.

- **E3.**

    The fail-loud validation rejects an empty domain and zero maxValidations with the byte-exact `evidence: ` messages, and the schema itself catches a non-array `exclude` earlier: `$.exclude expected array but got nope`.

- **E4.**

    The enabled mount writes the byte-exact `evidence: activated (domain=workspace_evidence)` line, installs the root `fs/observed` listener through the Wire of the factory and the `evidence-storage` effect, and the volatile cells arrive as `{ get }` cells and unwrap onto the state.

## Fixtures

The shared Harness supplies a fake ctx with a DISTINCT root object, the real factory instance, the real built Target, and a fresh temporary directory for each folder process.

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_evidence)`.

## Expected count

11 PASS.
