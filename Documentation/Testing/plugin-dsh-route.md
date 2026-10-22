# plugin-dsh-route - the live test plan

## Identity
- Package: `@playform/plugin-dsh-route` (Classic/packages/plugin-dsh-route).
- Profile row id: `plugin-dsh-route` (bundled in the desktop profile).
- Exposes: the `dshRoute` service (`export default class Enforcer extends
  Service` with `super(Context_, "dshRoute")`). The routing policy enforcer for
  the delegation surface: it classifies tasks and enforces the model-routing
  rules at dispatch time.
- Ledger: logFile `~/.dsh/route.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-route"}` → one entry, status schema (the
   policy defaults live in Variable/Config.ts).
2. Service check: `cordis_inspect_query` host/Service/listService `dshRoute`
   → resolves.
3. Ledger line: the activated line in `~/.dsh/route.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | `listService dshRoute` | the enforcer is registered | construction-time registration |
| T2 | Classify a trivial task through the enforcer | the low-cost route | the policy's difficulty-first classification holds |
| T2 | A request that violates the policy | the enforcer denies/rewrites the route | the denial is ledgered, never silent |

## Known live gaps
- Not dogfooded yet. Watch for: the enforcer blocking legitimate delegations
  when the policy table is empty, and stale policy after a hot config edit.

## Fix loop
- Fix files: `Source/Library.ts`, `Source/Function/Enforcer.ts`,
  `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-route run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-route/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-route`
- Tests run: T1 config - / T1 service - / T2 classify - / T2 enforcement -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
