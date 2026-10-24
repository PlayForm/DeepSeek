# Storage-Domain - the KV domain (primary) and the JSON fallback

The completion spec's wave 3 storage migration for the pattern service: the
snapshot store moves from the plain JSON file onto the harness's
`ctx.storage` KV domain, and the JSON file becomes the documented DEGRADED
FALLBACK - written and read only when no storage facility is provided (or
its open fails).

## The store split

| Store                                             | Role                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| the KV domain (config `domain`, default `pattern`) | PRIMARY - version 1, per-record, tables `patterns` + `meta`        |
| `~/.dsh/pattern/registry.json` (config `storagePath`) | FALLBACK - only when `ctx.storage`/`storageDomain` is absent or the open fails |

The domain declares NO `compatibleVersions`: the library rejects an entry
that is not strictly below the declared version, so `[1]` against version 1
throws at load (the family's learned rule).

## Scenarios

- D1: the byte-exact domain spec (name/version/layout/invalidRecords/two
  tables, `compatibleVersions` undefined), the open, and the storage effect's
  disposer closing the domain.
- D2: the per-mutation round-trip - a `Record` writes its pattern record, a
  `Decay` writes every pattern it moved and nothing at the 0.5 floor, the
  explicit `Save` writes every pattern plus the `__savedAt` meta record (the
  byte-exact `saved <n> patterns to <domain>` line), and a `Record` in the
  detached open's window survives the recovery (a newer live record is never
  clobbered by the store's older copy).
- D3: the reopen (restart) - a second mount over the same domain restores the
  stored records over the catalog with the byte-exact
  `restored <n> patterns from snapshot` line and the persisted confidences.
- D4: the absent-facility fallback - the JSON snapshot is still written
  (`saved <n> patterns to <path>`) and still restores the registry, and no
  storage effect is registered.
- D5: the domain-version failure mode - a stored version 2 against the
  declared 1 is LOUD (`storage open failed: version-mismatch: ...`), the JSON
  fallback loads, and the degraded mount keeps writing the file, never the
  domain.
- D6: the `domain` knob renames the domain; an invalid domain name fails loud
  at load.

## Fixtures

The shared Harness: the fake ctx (the effect runner, the probe-once `get`),
the REAL built service, and `FakeStorage` - the authority/evidence
fake-storage pattern (the open capture, the map-backed tables, the `seed`
hook, the write log, and the version fence).

## Expected count

14 PASS.
