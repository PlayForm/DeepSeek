# client-dsh-workspace-live - the live test plan

## Identity

- Package: `@playform/client-dsh-workspace-live` (Classic/packages/client-dsh-workspace-live).
- Profile row id: `client-dsh-workspace-live` (bundled in the desktop profile).
- Exposes: the `workspaceLive` service (snapshot / subscribe) and the `conversation.view` tab
  `workspace-live` (order 25). Stable-until-event presentation: it renders only when a workspace
  event surfaces a change, never on a timer; it presents the workspace's representations, never a
  running OS process.
- Ledger: none of its own (client module); the sibling services (workspaceGraph, workspaceObserve,
  the workspace events) are declared locally in `Source/Interface/Siblings.ts` from the W1 frozen
  contract - no runtime import of sibling packages exists yet.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/client-dsh-workspace-live"}` → one entry, status schema (defaults: tabOrder
   25, maxEvents 50, maxRepresentations 100).
2. Service check: the `workspaceLive` service resolves with `snapshot` and `subscribe`.
3. Ledger line: none - activation is proven by checks 1-2 and the T5 tab.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | `workspaceLive.snapshot()` | the current
representations snapshot | bounded by maxEvents / maxRepresentations | | T2 | `subscribe()` then
fire one workspace event | exactly one re-render on the event, none before | stable-until-event
holds (no timer renders) | | T5 | The user opens the workspace-live tab | the view presents at the
END of the invisible flow (audit lines → live view) | representations render; no OS process
conflation |

## Known live gaps

- The sibling imports are still declared locally (W1 contract), so the live view consumes the
  declared shapes until the end-phase wiring - a mismatch between the declared and real service
  shapes is a likely defect source.
- The workspace graph is empty (see README), so event-driven representations may stay empty until an
  index trigger exists.

## Fix loop

- Fix files: `Source/Client.ts`, `Source/Library.ts`, `Source/Function/`,
  `Source/Interface/Siblings.ts`, `Source/Variable/Locale-*.json`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-workspace-live run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-workspace-live/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/client-dsh-workspace-live`
- Tests run: T1 snapshot - / T2 subscribe - / T5 tab -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
