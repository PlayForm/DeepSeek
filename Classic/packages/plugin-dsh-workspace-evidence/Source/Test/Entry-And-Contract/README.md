# Entry-And-Contract - the loader contract and the mount

This folder covers the object-form loader contract and the live disabled posture: the default object, the cold mount, the fail-loud validation, and the enabled mount.

## Scenarios

- E1: the default object carries name (`plugin-dsh-workspace-evidence`),
  `apply`, `Config` and `inject` (`["pluginFactory"]`), and the schema fills
  the Config base (`enabled` false, `log` true, the `logFile` default).
- E2: the cold mount (enabled=false): apply returns nothing, the service is
  still provided (name `workspaceEvidence`), the byte-exact
  `evidence: disabled (enabled=false)` line (logger AND durable `[ISO]`
  file), the root `fs/observed` listener and the `evidence-storage` effect
  STILL WIRED, the service still answering honestly (a validate fails loud
  with `evidence: service is disabled (enabled=false)`; an invalidate finds
  nothing), the listener doing nothing (no line, no write), and a flip to
  enabled acting on the very next call (a validate lands) and a flip back
  refusing again.
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

14 PASS.
