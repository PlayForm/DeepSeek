# Entry-And-Contract - the loader contract and the mount

The object-form loader contract and the IDLE-forever posture: the default
object, the cold mount, the fail-loud validation, the enabled mount.

## Scenarios

- A1: the default object carries name (`plugin-dsh-workspace-authority`),
  `apply`, `Config` and `inject` (`["pluginFactory"]`).
- A2: the cold mount (enabled=false): apply returns nothing, the service is
  still provided (name `workspaceAuthority`), the byte-exact
  `authority: disabled (enabled=false)` line (logger AND durable `[ISO]`
  file), no wiring, and grants/leases/residences/evictions are refused
  honestly.
- A3: the fail-loud validation - the numeric bounds and the policy table,
  each with the byte-exact `authority: ` messages.
- A4: the enabled mount - the byte-exact
  `authority: activated (ttl=300000, policy=N)` line with the policy
  count.

## Fixtures

The shared Harness (fake ctx with the real factory instance, the real
built Target, a fresh temporary directory per folder process).

## Expected ledger strings (byte-exact, `authority: ` prefix)

`disabled (enabled=false)`, `activated (ttl=300000, policy=0)`,
`activated (ttl=300000, policy=1)`.

## Expected count

8 PASS.
