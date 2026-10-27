# client-dsh-workspace-live - the live test plan

## Identity

- Package: `@playform/client-dsh-workspace-live` (Classic/packages/client-dsh-workspace-live).
- Profile row id: `client-dsh-workspace-live` (bundled in the desktop profile).
- Exposes: the `workspaceLive` service (client: `getSnapshot`, `subscribe`, `ingest(event)`,
  `refresh(graph)`) and the `conversation.view` tab `workspace-live` (order 25). Stable-until-event
  presentation: the store emits a new snapshot only on `ingest()` or `refresh()`; it presents the
  workspace's representations, never a running OS process.
- The child-slot model: when the panel family is composed (`ctx.get("playformFamilyPanel")` is a
  registry), the tab registration declares
  `children: { "workspace.live.section": { kind: "list", scope: "session" } }` and hands it to the
  renderer through `renderSlot("workspace.live.section", {})`; the section registers into that
  declared child slot (section id `workspace-live-section`) with the inject face
  `{ section, ports }` - the ports carry the presentation store and the trace source, and the
  section reads through the ports, never the context. Without the panel family the tab keeps its
  legacy shape (no `children`, no section registration, one slot point).
- The D5 trace ingest (`Source/Function/Trace.ts`): resolves `ctx.get("trace")` structurally
  (`on(kind, listener)` required, `ring(limit)` when present; no import of `@playform/lib-dsh-trace`
  or the factory). Kinds: `observe/stamp`, `graph/indexed`, `graph/invalidated`, `batch/proposed`,
  `batch/decision`, `batch/state-change` (the batch transitions surface when a batch plugin mirrors
  them onto the bus). The tail is newest first, bounded by `maxEvents`; a tail line is
  `<kind> <path>` (the payload's `path` when a non-empty string, else the envelope's `trace` id). A
  missing trace is the static state: `live: false` (`data-live="false"`), empty tail, a no-op
  subscribe/dispose - never an error.
- Config (all volatile; no seed field - the SCHEME shows none): `enabled` false, `tabOrder` 25,
  `maxEvents` 50 (the event tail bound AND the trace tail bound), `maxRepresentations` 100.
- Ledger: none of its own (pure client, no host writes); the sibling services (workspaceGraph,
  workspaceObserve, the workspace events) are declared locally in `Source/Interface/Siblings.ts`
  from the W1 frozen contract - no runtime import of sibling packages exists yet.

## Activation checks

1. **The Config.**

    Inspect Config: `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/client-dsh-workspace-live"}` → one entry, status schema (defaults: tabOrder
    25, maxEvents 50, maxRepresentations 100, enabled false).

2. **The service check.**

    Service check: the `workspaceLive` service resolves with `getSnapshot`, `subscribe`, `ingest`,
    `refresh`.

3. **The ledger line.**

    Ledger line: none - activation is proven by checks 1-2 and the T5 tab.

## Test cases

| #   | Trigger                                                  | Expected                                                                     | Pass criteria                                                                                                    |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| T1  | `workspaceLive.getSnapshot()`                            | the current representations snapshot                                         | bounded by maxEvents / maxRepresentations; `{ sequence, representations, events }` and nothing else              |
| T2  | `subscribe()` then fire one workspace event              | exactly one re-render on the event, none before                              | stable-until-event holds (no timer renders)                                                                      |
| T2  | Mirror a `graph/invalidated` envelope onto the trace bus | one new trace tail entry, newest first                                       | the tail line is `<kind> <path>`; the tab re-renders only on the new tail                                        |
| T2  | No trace on the context                                  | the static state                                                             | `live: false` (`data-live="false"`), empty tail, no error                                                        |
| T2  | With the panel family composed                           | the child slot renders                                                       | the tab declares `workspace.live.section`; the section receives `{ section, ports }` and reads through the ports |
| T2  | Without the panel family                                 | the legacy tab shape                                                         | no `children`, no section registration, one slot point                                                           |
| T5  | The user opens the workspace-live tab                    | the view presents at the END of the invisible flow (audit lines → live view) | representations render; no OS process conflation                                                                 |

## Known live gaps

- The sibling imports are still declared locally (W1 contract), so the live view consumes the
  declared shapes until the end-phase wiring - a mismatch between the declared and real service
  shapes is a likely defect source.
- The workspace graph is empty (see README), so event-driven representations may stay empty until an
  index trigger exists.
- The batch transition kinds surface only when a batch plugin mirrors them onto the bus; without a
  mirror the trace tail never shows them.

## Fix loop

- Fix files: `Source/Client.ts`, `Source/Library.ts`, `Source/Function/`,
  `Source/Interface/Siblings.ts`, `Source/Variable/Locale-*.json`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/client-dsh-workspace-live run prepublishOnly`
- Smokes: `node Classic/packages/client-dsh-workspace-live/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (the SCHEME's three folders: Contract-And-Wiring 12 PASS, Store-And-Snapshot
  11 PASS, Child-Slot-And-Trace 12 PASS). Then the app restart.

## Report stub

- Plugin: `@playform/client-dsh-workspace-live`
- Tests run: T1 snapshot - / T2 subscribe - / T2 trace tail - / T2 static - / T2 child slot - / T2
  legacy - / T5 tab -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
