# client-dsh-panel-family - the live test plan

## Identity
- Package: `@playform/client-dsh-panel-family` (Classic/packages/client-dsh-panel-family).
- Profile row id: `client-dsh-panel-family` (bundled in the desktop profile; the
  patch row's PoC `enabled: false` was flipped by the wiring pass).
- Exposes: the `playformFamilyPanel` registry service (register / entries /
  subscribe / getVersion / unregister), the `conversation.view` family tab
  (`playform-family`, order 20, session scope) and the `shell.overlay` mount
  point. Zero adapter logic: the 13 per-bundle adapters register their own
  sections.
- Ledger: none of its own - the host half is an empty `apply()`; activation
  proof is the Config schema plus the tab in the UI. The client half is a pure
  browser module (installing it needs no host restart, R-UI-1).

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/client-dsh-panel-family"}` → one entry, status schema
   (defaults: tabOrder 20, overlayMaxWidth 720, locale "en").
2. Service check: the `playformFamilyPanel` registry service resolves and
   `getVersion()` returns the package version.
3. Ledger line: none - verify activation through checks 1-2 and the T5 tab.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | defaults present |
| T1 | `playformPanel.entries()` after boot | the registered adapter sections | entries list non-empty once adapters register |
| T2 | `register(...)` a test section, then `entries()` | the section appears ordered by (order, id) | order/id sort holds; `unregister` removes it |
| T5 | The user opens the conversation view | the `playform-family` tab renders at order 20 | tab visible; a `shell.overlay` panel opens within overlayMaxWidth |

## Known live gaps
- Not dogfooded yet: the adapters' own registration behavior is out of scope
  here (each adapter is tested in its owning package).

## Fix loop
- Fix files: `Source/Library.ts` (host half, the registry service),
  `Source/Client.ts`, `Source/Function/`, `Source/Variable/Locale-*.json`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-panel-family run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-panel-family/Target/Test/<Folder>/Test.js`
  for each folder under `Source/Test/`. Then the app restart; the client half
  reloads with the client module system.

## Report stub
- Plugin: `@playform/client-dsh-panel-family`
- Tests run: T1 config - / T1 entries - / T2 register - / T5 tab -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
