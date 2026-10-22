# client-dsh-panel-family-host - the live test plan

## Identity
- Package: `@playform/client-dsh-panel-family-host`
  (Classic/packages/client-dsh-panel-family-host).
- Profile row id: `client-dsh-panel-family-host` (bundled in the desktop
  profile).
- Exposes: the plain host service `panelFamilyHost` with two read-only methods:
  `tail(namespace, lines)` (the last N lines of the owning module's ~/.dsh log)
  and `stats()` (the CCR store stats). fiberPhases come from the existing
  remote.pluginManager - no new endpoint.
- Ledger prefix: `host:`; ledger line: `` `host: activated (enabled=<enabled>)` ``
  in the logger (Config has no separate logFile; the endpoint reads
  ~/.dsh family logs only, write surface: none, A5.3).

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/client-dsh-panel-family-host"}` → one entry, status
   schema (defaults: logRoot ~/.dsh, maxLines 200, ccrLog ~/.dsh/ccr.log).
2. Service check: `cordis_inspect_query` host/Service/listService
   `panelFamilyHost` → the two methods `tail` and `stats`.
3. Ledger line: `host: activated (enabled=true)` in the logger.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | `tail("package-governor", 20)` | the last 20 lines of ~/.dsh/package-governor.log | lines match the file's tail exactly; ≤ maxLines |
| T1 | `stats()` | the CCR store summary | fields populated from ~/.dsh/ccr.log |
| T2 | `tail` with lines > maxLines | clamped to maxLines | no error, no truncation crash |
| T5 | The family panel's ledger tails view | live tails render | the user sees real log lines, not placeholders |

## Known live gaps
- Not dogfooded yet. Watch for: the Typert generation pipeline is documented as
  not reproducible from an external package, so v1 ships the plain host
  service - method names must stay exactly `tail(namespace, lines)` and
  `stats()`.

## Fix loop
- Fix files: `Source/Library.ts`, `Source/Function/` (the tail/stats
  implementations), `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-panel-family-host run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-panel-family-host/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/client-dsh-panel-family-host`
- Tests run: T1 tail - / T1 stats - / T2 clamp - / T5 view -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
