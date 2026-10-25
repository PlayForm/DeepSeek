# @playform/hook-dsh-package-pinner - The silent version pinner

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan:
> [SCHEME.md](./SCHEME.md).

## The role

The **silent version pinner** of the DeepSeek Harness - a plugin on the `fs/observed` event that
pins every dependency version in a written `package.json` to its STATIC version
(`"@playform/build": "^0.3.4"` becomes `"0.3.4"`). One leading range prefix (`^`, `~`, or `=`) is
stripped, in every dependency section the config declares (dependencies, devDependencies,
peerDependencies, optionalDependencies).

Already-static versions, compound/space ranges, wildcards without a prefix, and protocol
dependencies (`workspace:*`, `file:`, `link:`, `git+`, `npm:` aliases) are left as-is; a
`pin-policy.json` keep-list protects packages whose ranges must stay as authored (discovery: global
`policyFile` -> the file's own directory -> co-located with the nearest `registry.json` -> built-in
empty default; the effective keep-list is the union).

Fully API-aware: the manifest is read/rewritten through `ctx.fs` with a version-guarded
`replaceIfVersion` write (the service owns version tokens) and an explicit sandbox policy, the
authoring agent is never notified (the tool result is built from the author's own content and the
observation-policy's version record is refreshed by re-emitting `fs/observed` with the
service-issued fresh version), and there is NO update stage - no ncu, no jobs, no subprocess: a pure
deterministic P-only rewrite running as a detached contained continuation.

A factory flavor; a sibling of the package governor on the same `fs/observed` seam.

## The surfaces

| Kind     | Name                                    | What                                                                       |
| -------- | --------------------------------------- | -------------------------------------------------------------------------- |
| listener | `fs/observed`                           | The `Wire`-registered observation listener; basename gate `package.json`.  |
| listener | `fs/observed` (refresh)                 | The observation-policy refresh re-emits the service-issued fresh version.  |
| service  | `RegisterGovern("package.json", "pin")` | The direct-govern chain pass alone (Function/Direct.Pin).                  |
| config   | `pin-policy.json`                       | The keep-list sidecar (`policyFileName`, union discovery via the factory). |
| config   | Schemastery Config schema               | The exported `Config` (shared block + the module's own fields).            |
| tool     | ledger `hook-dsh-package-pinner.log`    | The module's own log file - SEPARATE from the governor's.                  |

## The configuration

| Field              | Type     | Default                                                                           | Meaning                                                                             |
| ------------------ | -------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `log`              | boolean  | `true`                                                                            | Ledger enabled - write the durable log file (volatile).                             |
| `logFile`          | string   | `~/.dsh/playform/hook-dsh-package-pinner.log`                                     | The ledger file - separate from the governor's (volatile).                          |
| `updateCooldownMs` | number   | `3000`                                                                            | Cooldown field from the shared block - the pinner never reads it (no update stage). |
| `mutationTools`    | string[] | `["write", "edit", "str_replace_editor", "raw-write"]`                            | Actor tool names whose `fs/observed` events trigger pinning (volatile).             |
| `policyFile`       | string   | `""`                                                                              | Global policy file; empty means discovery (`Function/Resolve`).                     |
| `exclude`          | string[] | `["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"]`     | Excluded path segments (anywhere mode, exclusion-first) - the module's fence.       |
| `sections`         | string[] | `["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]` | Dependency sections the pinner may rewrite.                                         |

## The ledger

```text
activated (pinner, logFile=..., sections=[...], exclude=[...])
skipped (excluded) <path>
observed non-JSON package.json <path> — skipped
pinned <path> (N versions)
no changes to pin for <path>
REFUSED rewrite of <path>: non-dependency section "<name>" would change
```

Each line is `[<ISO>] <message>` in the file (the logger prefix is the factory's `Append`; the
module identity is `hook-dsh-pinner-package`). The activation line is written by `apply()` - "did it
activate" must be answerable from the ledger alone.

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-package-pinner run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-package-pinner/Target/Test/<Folder>/Test.js`
    - Direct-Govern-Folds-Wiring - 8 checks
    - Fresh-Stat-And-Keep-List - 8 checks
    - Gates - 3 checks
    - Loader-And-Config - 2 checks
    - Pin-Pass-And-No-Ops - 5 checks
    - State-And-Activation - 6 checks

## The plan

[SCHEME.md](./SCHEME.md).
