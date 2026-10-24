# SCHEME - @playform/plugin-dsh-pattern

## Identity

| Place                  | Value                                    |
| ---------------------- | ---------------------------------------- |
| Package name           | `@playform/plugin-dsh-pattern`           |
| Service name           | `pattern` (`super(Context, "pattern")`)  |
| Patch entry id         | `plugin-dsh-pattern`                     |
| Ledger logFile default | `~/.dsh/playform/plugin-dsh-pattern.log` |

The loader contract is the class form (the factory precedent): the default export is
`class PatternService extends Service`, `static inject = []` (no service dependencies), and the
named `Config` schema export (also attached as `static Config`). The service is registered at
construction and removed with its owning fiber.

## The pattern shape (`Source/Interface/Pattern.ts`)

```text
Pattern = {
  id: string;            // stable registry id
  intent: string;        // the intent label
  trigger: { tool?, keywords[] };
  targets: string[];     // target subgraph as globs
  transform: string[];   // ordered step descriptions
  arbiter: string;       // the verification
  confidence: number;    // 0..1, starts 0.5
  allowlist: boolean;    // the decision hook's hint
  updatedAt: number;     // epoch ms
}
```

## The scoring weights (`Source/Function/Matcher.ts`)

`score = 0.6 * keywordOverlap + 0.2 * toolMatch + 0.2 * confidence`, thresholded at
`matchThreshold`; the ambiguity rule empties the result when the top two scores sit within
`ambiguityEpsilon`.

## The policy block (D6)

The schema composes the factory's shared block (`policy: Policy()`); the service's knobs carry it as
`Knobs.policy` (Function/Knobs unwraps the volatile cell; a BARE construction - the smokes'
fixture - falls back to the same D6 table stated in that module):

| action    | default | action    | default   |
| --------- | ------- | --------- | --------- |
| `read`    | `auto`  | `write`   | `approve` |
| `index`   | `auto`  | `commit`  | `approve` |
| `record`  | `auto`  | `spawn`   | `approve` |
| `suggest` | `auto`  | `message` | `auto`    |

The service matches, records and decays - `read`/`record`/`suggest` are automatic; the
write/commit/spawn verdicts are declared for uniformity with the family's block and stay the shipped
`approve` (the service never writes files, commits or spawns). A resolved pack's `policy` section
overrides the defaults per action (the wiring is the next refinement; the type already exists in
`@playform/lib-dsh-pack`). The defaults are smoke-arbitrated in `Source/Test/Policy-Defaults`.

## Ledger strings (module-owned, byte-stable)

- `pattern: activated (seeded <n> patterns) (logFile <logFile>)`
- `pattern: disabled (enabled=false) (logFile <logFile>)`
- `pattern: recorded <outcome> on <id> (confidence <0.xx>) (logFile <logFile>)`
- `pattern: restored <n> patterns from snapshot (logFile <logFile>)`
- `pattern: saved <n> patterns to <destination> (logFile <logFile>)`
- `pattern: storage open failed: <reason> (logFile <logFile>)`

The restore line is shared by BOTH stores (the KV domain and the JSON snapshot) - "snapshot" is the
persisted registry, whatever the medium. The save line's `<destination>` is the domain name on the
primary store and the expanded JSON path on the fallback. `storage open failed: <reason>` is the ONE
line the storage migration adds (the family's P5 v2 posture: a present facility whose open fails
must be diagnosable; the reason is the library's own message, e.g.
`version-mismatch: stored 2, declared 1`).

## Storage (the primary and the fallback)

The **PRIMARY** store is the harness's `ctx.storage` KV domain (config `domain`, default `pattern`):
`defineDomain({ name, version: 1, layout: "per-record", invalidRecords: "backup-and-skip", tables: { patterns, meta } })`,
probed once at construction (`ctx.storage.domain`, else `ctx.storageDomain`), opened detached and
closed by the service's own effect disposer. It declares NO `compatibleVersions`: the library
rejects an entry that is not strictly below the declared version, so `[1]` against version 1 throws
at load. The registry loads on open (as a per-record overlay on the cold-start catalog: a stored
record replaces the catalog entry with the same id, a catalog entry the domain never received stays)
and is written on every mutation (`Record`, `Decay`); `Save` writes the whole registry plus the
`__savedAt` meta record; `Flush` awaits the pending store work (the smoke seam).

The **FALLBACK** store is the local JSON snapshot (`storagePath`, default
`~/.dsh/pattern/registry.json`, version field `1`; a stale or unreadable file is a silent miss and
keeps the cold-start catalog), written and read ONLY when no storage facility is provided or the
domain's open fails. It is a full snapshot and REPLACES the catalog, exactly as the PoC did. Memory
is local, never the repo; no network.
