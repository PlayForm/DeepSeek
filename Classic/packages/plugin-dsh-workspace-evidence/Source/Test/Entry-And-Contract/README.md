# Entry-And-Contract - the loader contract and the mount

This folder covers the object-form loader contract and the IDLE-forever posture: the default object, the cold mount, the fail-loud validation, and the enabled mount.

## Scenarios

- E1: the default object carries name (`plugin-dsh-workspace-evidence`),
  `apply`, `Config` and `inject` (`["pluginFactory"]`).
- E2: the cold mount (enabled=false): apply returns nothing, the service is
  still provided (name `workspaceEvidence`), the byte-exact
  `evidence: disabled (enabled=false)` line (logger AND durable `[ISO]`
  file), no root listener, no effect, and the service still answers
  honestly (a validate fails loud with
  `evidence: service is disabled (enabled=false)`; an invalidate finds
  nothing).
- E3: the fail-loud validation - empty domain and zero maxValidations with
  the byte-exact `evidence: ` messages; a non-array `exclude` is caught
  earlier by the schema itself (`$.exclude expected array but got nope`).
- E4: the enabled mount - the byte-exact
  `evidence: activated (domain=workspace_evidence)` line, the root
  `fs/observed` listener through the factory's Wire, the
  `evidence-storage` effect, and the volatile cells arriving as
  `{ get }` cells and unwrapping onto the state.

## Fixtures

The harness is the shared Harness: a fake ctx with a DISTINCT root object, the real factory instance, the real built Target, and a fresh temporary directory per folder process.

## Expected ledger strings (byte-exact, `evidence: ` prefix)

`disabled (enabled=false)`, `activated (domain=workspace_evidence)`.

## Expected count

11 PASS.
