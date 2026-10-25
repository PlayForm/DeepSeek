# @playform/plugin-dsh-factory - The furnace of the DSH governance family

> Version 0.1.0 - UNPUBLISHED (the npm bootstrap tier 2-planned / 3-candidates). Plan:
> [SCHEME.md](./SCHEME.md).

## The role

The **furnace of the DSH governance family** - the first _service-provider_ bundle in the DeepSeek
Harness plugin family. Loading it registers one class plugin
(`export default class PluginFactory extends Service`, `super(ctx, "pluginFactory")`,
`static inject = ["fs"]`) that exposes **`ctx.pluginFactory`**: a single service holding every piece
of common machinery the family's hooks used to duplicate (the ledger, the exclusion match, the
auxiliary registry/policy discovery, the union keep-list resolution, the gate set, the
version-guarded sandbox-fenced write, the observation-policy refresh, the detached contained
continuation, the State builder, the wiring helpers, the effects, the Schemastery schema factory and
the probe-once seam accessor). One service, nineteen methods (the direct-govern pair
`RegisterGovern` + `Govern` and the `GovernSteps` registry among them) - the hooks bring their own
metal; the factory pours the mold. The factory is the hub of the eleven-package DSH family: the
three governance hooks inject the service, and the six normalize flavors consume `State`/`Append`
and the `Schema` helper.

## The surfaces

| Kind    | Name                                        | What                                                                             |
| ------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| service | `ctx.pluginFactory`                         | The one service (`class PluginFactory extends Service`, `inject = ["fs"]`).      |
| service | `State`                                     | The State builder (`State(ctx, config, {module, fields, policyFileName?})`).     |
| service | `Append`                                    | The family's one ledger mechanism (`Append(state, message)`).                    |
| service | `Match` / `Discover` / `Parse`              | The exclusion match, the registry/policy discovery and the JSON parse.           |
| service | `ResolvePolicy`                             | The union keep-list discovery (P3 chain-keys included).                          |
| service | `Gate` / `Write` / `GuardedWrite`           | The gate set, the sandbox-fenced write and the version-guarded write.            |
| service | `Refresh` / `Continue`                      | The observation-policy refresh and the detached contained continuation.          |
| service | `Wire` / `Attach` / `Journal`               | The wiring helper, the effects attach and the shared P5 record sink.             |
| service | `Trace` / `Seam` / `UpdateKey`              | The trace bus, the probe-once seam accessor and the update key.                  |
| service | `Schema`                                    | The Schemastery schema factory (`Schema(shared?, module?)`).                     |
| service | `RegisterGovern` / `Govern` / `GovernSteps` | The direct-govern pair and the step registry.                                    |
| config  | named exports `Policy` / `Decide`           | The shared policy-block builder and the verdict lookup (`"auto"` / `"approve"`). |

## The configuration

The factory itself registers **no config schema and no config field** - the schema it owns is the
helper it lends to every consumer (`Schema(shared?, module?)`, exported on the entry and as an
instance method; `shared: false` emits only the two universal volatile cells). The shared block the
helper composes, in helper order:

| Field              | Type     | Default                                                                       | Meaning                                                                    |
| ------------------ | -------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `log`              | boolean  | `true`                                                                        | Ledger enabled - write the durable log file (volatile).                    |
| `logFile`          | string   | `""` (per-module default passed as `shared.logFile`)                          | The ledger file - one separate log per module (volatile).                  |
| `updateCooldownMs` | number   | `3000`                                                                        | Cooldown between update-stage dispatches, per directory (volatile).        |
| `mutationTools`    | string[] | `["write", "edit", "str_replace_editor", "raw-write"]`                        | Actor tool names whose `fs/observed` events trigger the module (volatile). |
| `policyFile`       | string   | `""`                                                                          | Global policy file; empty means discovery (`Function/Resolve`).            |
| `exclude`          | string[] | `["node_modules", ".git", ".dsh", ".pnpm", ".store", "DeepSeek Harness.app"]` | Excluded path segments (anywhere mode, exclusion-first).                   |

With `shared: false` the block is only `log` and `logFile` (the two universal volatile cells); a
module supplies its own `logFile` default through its own fields.

## The ledger

```text
logger:  <State.Module>: <message>
ledger:  [<ISO timestamp>] <message>
unreadable <name> at <path> - using built-in default
storage journal open failed: <cause>
```

The factory registers no activation line and owns no consumer strings - every string a hook logs is
composed and logged by the hook, through the factory's `Append` (the first two lines above are the
wrappers `Append` puts around the consumer's message; the last two are the factory's own
parameterized lines).

## The build and the tests

- Build:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-factory run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-factory/Target/Test/<Folder>/Test.js`
    - Continue - 7 checks
    - Entry-And-State - 10 checks
    - Gate-Write-Refresh - 5 checks
    - Ledger-And-Journal - 4 checks
    - Match-Discover-Policy - 7 checks
    - Policy-And-Decide - 8 checks
    - Schema-Wire-Govern - 4 checks
    - Trace-Service - 9 checks

## The plan

[SCHEME.md](./SCHEME.md).
