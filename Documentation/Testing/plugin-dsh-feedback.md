# plugin-dsh-feedback - the live test plan

## Identity
- Package: `@playform/plugin-dsh-feedback`
  (Classic/packages/plugin-dsh-feedback).
- Profile row id: `plugin-dsh-feedback` (bundled in the desktop profile; this
  is the one member that ships `enabled: true` - a SERVICE-PROVIDER bundle).
- Exposes: the `feedback` service (`ctx.feedback`), declared as
  `export default class Feedback extends Service` with a static Config
  (validated before construction) registered via `super(Context, "feedback")`.
  The honest-signal collector: the transfer hop, the optional read and the
  council summary.
- Ledger: logFile `~/.dsh/feedback/feedback.log` (no separate activation
  string observed - the service registration is the proof).

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-feedback"}` → one entry, status schema
   (defaults: maxBlockBytes 4096, maxChain 8, maxSessions 128, summaryTerms 10).
2. Service check: `cordis_inspect_query` host/Service/listService `feedback`
   → resolves immediately on construction.
3. Ledger line: entries in `~/.dsh/feedback/feedback.log`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T1 | The `feedback` service resolves on the context | registration succeeded | `ctx.feedback` non-null |
| T2 | Collect a small honest-signal block | the block stored | size ≤ maxBlockBytes 4096 |
| T2 | Chain signals beyond maxChain 8 | the chain is capped | no unbounded growth; the cap ledgered |
| T1 | The council summary request | a summary with ≤ summaryTerms 10 terms | bounded output |

## Known live gaps
- Not dogfooded yet. Watch for: maxSessions 128 eviction dropping active
  session blocks, and the read path returning stale summaries.

## Fix loop
- Fix files: `Source/Library.ts` (the class, the static Config),
  `Source/Function/`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-feedback run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-feedback/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/plugin-dsh-feedback`
- Tests run: T1 config - / T1 service - / T2 collect - / T2 chain cap -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
