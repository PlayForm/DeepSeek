# plugin-dsh-workspace-reflect - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-reflect` (Classic/packages/plugin-dsh-workspace-reflect).
- Profile row id: `plugin-dsh-workspace-reflect` (bundled in the desktop profile).
- Exposes: the `workspaceReflect` service (`export default class WorkspaceReflect extends Service`
  with `super(Context, "workspaceReflect")`). The reflection step: the workspace looking back at its
  own decisions (duplicates are answered as a `rejected` reply, "already ...").
- Ledger: logFile `~/.dsh/reflect.log`; a cold mount logs `disabled (enabled=false)`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-reflect"}` → one entry, status schema (defaults per
   Variable/Config.ts).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceReflect` → resolves.
3. Ledger line: the activated line in `~/.dsh/reflect.log`; a cold mount logs
   `disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T2 | Reflect on a completed /tmp batch | the reflection
record | what was done and how it was verified | | T2 | Reflect twice on the same batch | the second
is a `rejected` reply ("already ...") | the duplicate is answered, not re-processed | | T1 | Reflect
with nothing to reflect on | the honest empty answer | no fabricated reflection |

## Known live gaps

- Not dogfooded yet. Watch for: the `rejected` reply text drifting from its stable format, and
  reflections recorded before the operation actually completed.

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the reflection engine),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-reflect run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-reflect/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-reflect`
- Tests run: T1 config - / T2 reflect - / T2 duplicate - / T1 empty -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
