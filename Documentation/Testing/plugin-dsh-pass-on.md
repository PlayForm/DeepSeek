# plugin-dsh-pass-on - the live test plan

## Identity

- Package: `@playform/plugin-dsh-pass-on` (Classic/packages/plugin-dsh-pass-on).
- Profile row id: `plugin-dsh-pass-on` (bundled in the desktop profile).
- Exposes: the `passOn` service (`export default class PassOn extends Service` with
  `super(Context, "passOn")`, registered immediately on construction - the factory's precedent). The
  pass-on hop in the batch flow: it carries proposals toward the decision/ingester chain without
  writing files itself.
- Ledger: logFile `~/.dsh/pass-on/pass-on.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-pass-on"}` → one entry, status schema.
2. Service check: `cordis_inspect_query` host/Service/listService `passOn` → resolves immediately on
   construction.
3. Ledger line: the activated line in `~/.dsh/pass-on/pass-on.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `listService passOn` | the service is registered |
construction-time registration | | T4 | Hand a proposal to the passOn service | the hop records and
forwards | the proposal reaches the decision layer (a `batch/proposed`-class event or the decision
gate) | | T4 | A proposal targeting a non-/tmp path during testing | forwarded but never applied |
the pass-on itself never writes |

## Known live gaps

- Not dogfooded yet. Watch for: the hop duplicating proposals (double delivery to the decision gate)
  and events lost when the decision service seam is absent.

## Fix loop

- Fix files: `Source/Library.ts` (the class), `Source/Function/` (the hop),
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-pass-on run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-pass-on/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-pass-on`
- Tests run: T1 config - / T1 service - / T4 hop - / T4 no-write -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
