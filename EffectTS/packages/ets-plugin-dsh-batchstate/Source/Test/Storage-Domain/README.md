# Storage-Domain - the KV domain (primary) and the JSON fallback

The completion spec's wave 3 storage migration for the batch-state board: the state store moves from
the plain JSON file onto the harness's `ctx.storage` KV domain, and the JSON file becomes the
documented DEGRADED FALLBACK - written and read only when no storage facility is provided (or its
open fails).

## The store split

| Store                                                   | Role                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| the KV domain (config `domain`, default `batch_state`)   | PRIMARY - version 1, per-record, tables `members`/`queue`/`proposals`/`gates` |
| `~/.dsh/batch-state.json` (config `stateFile`)            | FALLBACK - only when `ctx.storage`/`storageDomain` is absent or the open fails |

The domain declares NO `compatibleVersions`: the library rejects an entry that is not strictly below
the declared version, so `[1]` against version 1 throws at load (the family's learned rule).

Both stores feed the SAME recovery (`Function/Restore`), so the byte-exact
`recovered (<n> members, queue <n>)` line, the honest active -> interrupted downgrade, and the
malformed-row skip are identical.

## Scenarios

- D1: the byte-exact domain spec (name/version/layout/invalidRecords/four tables,
  `compatibleVersions` undefined), the open, and the storage effect's disposer closing the domain.
- D2: the per-mutation round-trip - a spliced proposal, a gate, a member, and the idle queue land in
  their tables, and a `clear` DELETES the records (the reconcile, so a restart cannot resurrect a
  cleared member).
- D3: the reopen (restart) - a second mount over the same domain restores the proposals and the
  gates with the byte-exact `recovered (0 members, queue 0)` line, the restored proposal is still
  the live read, and a write in the detached open's window survives the recovery (the live record
  wins, the store's records merge in).
- D4: the absent-facility fallback - the JSON state file is still written and still restores the
  board, and no storage effect is registered.
- D5: the domain-version failure mode - a stored version 2 against the declared 1 is LOUD
  (`storage open failed: version-mismatch: ...`), the JSON fallback recovers, and the degraded mount
  keeps writing the file, never the domain.
- D6: the `domain` knob renames the domain, and an invalid domain name fails loud at load.

## Fixtures

The shared Harness: the fake ctx (the effect runner, the probe-once `get`, the captured inbox
listeners), the REAL built plugin and factory, and `FakeStorage` - the authority/evidence
fake-storage pattern (the open capture, the map-backed tables, the `seed` hook, the write/delete
logs, and the version fence).

## Expected count

15 PASS.
