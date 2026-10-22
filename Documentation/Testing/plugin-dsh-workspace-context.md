# plugin-dsh-workspace-context - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-context` (Classic/packages/plugin-dsh-workspace-context).
- Profile row id: `plugin-dsh-workspace-context` (bundled in the desktop profile).
- Exposes: the `workspaceContext` service (`export default class WorkspaceContext extends Service`
  with `super(Context, "workspaceContext")`). The context budgeter: the orientation packet assembly
  under the token budget (WORKSPACE, SCOPE, MAP, FOCUS, NEIGHBORS, EVIDENCE, OPEN, STALE).
- Ledger lines: `` `context: disabled (enabled=false)` `` (cold mount) and
  `` `context: activated (budget=2000/4000, lenses=3)` ``; logFile `~/.dsh/context.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/plugin-dsh-workspace-context"}` → one entry, status schema (defaults: the
   budget 2000 target / 4000 cap, 3 lenses).
2. Service check: `cordis_inspect_query` host/Service/listService `workspaceContext` → resolves.
3. Ledger line: `context: activated (budget=2000/4000, lenses=3)` in `~/.dsh/context.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | Build a packet for a node/query | the eight
sections present | WORKSPACE through STALE; over-budget marks truncated, never silently exceeds | |
T2 | Request a packet with a tiny budget | the packet truncates honestly | the truncation marker
appears; no overrun | | T1 | A packet for a node the caller holds a stale version of | the STALE
line set | the version mismatch is reported |

## Known live gaps

- Not dogfooded yet. Watch for: packets silently exceeding the cap and the lenses not all
  contributing when the graph is empty (the known gap upstream).

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the budgeter, the lenses),
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-context run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-context/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-context`
- Tests run: T1 config - / T1 packet - / T2 truncation - / T1 stale -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
