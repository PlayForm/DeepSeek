# SCHEME - @playform/plugin-dsh-pattern

## Identity

| Place                  | Value                                   |
| ---------------------- | --------------------------------------- |
| Package name           | `@playform/plugin-dsh-pattern`          |
| Service name           | `pattern` (`super(Context, "pattern")`) |
| Patch entry id         | `plugin-dsh-pattern`                    |
| Ledger logFile default | `~/.dsh/pattern.log`                    |

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

## Ledger strings (module-owned, byte-stable)

- `pattern: activated (seeded <n> patterns) (logFile <logFile>)`
- `pattern: disabled (enabled=false) (logFile <logFile>)`
- `pattern: recorded <outcome> on <id> (confidence <0.xx>) (logFile <logFile>)`
- `pattern: restored <n> patterns from snapshot (logFile <logFile>)`
- `pattern: saved <n> patterns to <path> (logFile <logFile>)`

## Storage

Local JSON under `~/.dsh` (version field `1`; a stale or unreadable file is a silent miss and keeps
the cold-start catalog). Memory is local, never the repo; no network.
