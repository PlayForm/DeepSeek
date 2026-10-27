# Entry-And-Contract - the loader contract and the mount

The suite covers the object-form loader contract and the IDLE-forever posture: the default object, the cold mount, the fail-loud validation, and the enabled mount.

## Scenarios

- **A1.**

    The default object carries name (`plugin-dsh-workspace-authority`), `apply`, `Config`, and `inject` (`["pluginFactory"]`).

- **A2.**

    The cold mount (enabled=false) returns nothing from apply, still provides the service (name `workspaceAuthority`), and writes the byte-exact `authority: disabled (enabled=false)` line to the logger AND the durable `[ISO]` file.

    The mount has no wiring, and it refuses grants, leases, residences, and evictions honestly.

- **A3.**

    The fail-loud validation covers the numeric bounds and the policy table, each with the byte-exact `authority: ` messages.

- **A4.**

    The enabled mount writes the byte-exact `authority: activated (ttl=300000, policy=N)` line with the policy count.

## Fixtures

The shared Harness supplies a fake ctx with the real factory instance, the real built Target, and a fresh temporary directory for each folder process.

## Expected ledger strings (byte-exact, `authority: ` prefix)

`disabled (enabled=false)`, `activated (ttl=300000, policy=0)`,
`activated (ttl=300000, policy=1)`.

## Expected count

8 PASS.
