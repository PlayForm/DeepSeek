# plugin-dsh-ingester - the live test plan

## Identity
- Package: `@playform/plugin-dsh-ingester`
  (Classic/packages/plugin-dsh-ingester).
- Profile row id: `plugin-dsh-ingester` (bundled in the desktop profile).
- Exposes: the `ingester` service (`export default class Ingester extends
  Service` with `super(Context, "ingester")`, registered immediately on
  construction - the factory's precedent). The only writer in the batch flow:
  it consumes `batch/decision` events (from hook-dsh-batch-decision) and
  applies the approved batches to files.
- Ledger: logFile `~/.dsh/ingester/ingester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-ingester"}` → one entry, status schema.
2. Service check: `cordis_inspect_query` host/Service/listService `ingester`
   → resolves immediately on construction.
3. Ledger line: the activated line in `~/.dsh/ingester/ingester.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | `listService ingester` | the service is registered | construction-time registration |
| T4 | Emit `batch/decision` for an approved /tmp-targeted proposal | the ingester applies the batch | the /tmp file changes match the proposal; the write path is the ingester's ONLY |
| T4 | Emit `batch/decision` for a denied proposal | nothing is written | the denials never reach the file system |

## Known live gaps
- Not dogfooded yet. Watch for: the ingester writing when the decision event is
  malformed, and handoff attempts from batch_decision failing silently when the
  service seam is absent.

## Fix loop
- Fix files: `Source/Library.ts` (the class), `Source/Function/` (the apply
  engine), `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-ingester run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-ingester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-ingester`
- Tests run: T1 config - / T1 service - / T4 apply - / T4 denied no-op -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
