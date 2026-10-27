# Child-Slot-And-Trace - the child slot of the live view and its D5 ingest

The suite covers the v4.1 child-slot registration, with the panel family composed, and
the D5 trace ingest, against the real built client apply and the real built trace source
and view.

## Scenarios

- C1: with `playformFamilyPanel` present the workspace tab declares
  `workspace.live.section` in its `children` table (`kind: "list"`, `scope:
  "session"`).
- C2: the tab component hands the declared child slot to the renderer through the
  `renderSlot` prop, called as `renderSlot("workspace.live.section", {})`, and it
  still carries the store and the trace source.
- C3: the section registers into the declared child slot with the exact identity
  (`workspace-live-section`, order 25, the locale namespace of the package).
- C4: the INJECT face of the registration (`{ section, ports }`) is the data path,
  which is the section manifest, the presentation store (`getSnapshot`/`subscribe`),
  and the trace source (`tail`/`live: true`), and the section component receives the
  same ports.
- C5: the composed run keeps the six trace kinds (`observe/stamp`, `graph/indexed`,
  `graph/invalidated`, and the three batch transitions), the three effect labels
  (`live: dictionaries`, `live: workspace tab`, `live: panel section`), and the two
  slot points.
- T1: a trace event enters the tail, with `live: true` and the newest envelope first.
- T2: the tail is newest first, and the View renders one line per envelope as
  `<kind> <path>`.
- T3: a new envelope notifies each subscriber exactly once, and the disposer stops
  delivery, which is the stable-until-event rule with no timer.
- T4: the tail is bounded by the configured bound and keeps the newest entries.
- T5: a missing trace gives the documented static state (`live: false`, an empty
  tail, a no-op subscribe/dispose), and the tab still renders with the static trace.
- T6: with no envelope the View renders an empty trace list and `data-live` `"false"`.
- K1: `Target/Client.bundle.js` is the closure factory
  `window.__ModuleLoader__.load({ id, factory })` with the package id, and the factory
  resolves `react` through the injected `require` and returns `inject`/`apply`/`default`.

## Fixtures

The shared Harness supplies the real built `Target/Client.js`, `Target/Function/
Trace.js`, `Target/Function/View.js`, and `Target/Variable/Trace.js`, the fake client
ctx with `ctx.get` for the optional panel-family registry and the D5 bus, the fake
registry, where presence is the composition signal, and the fake trace port
(`on`/`ring`/`emit`).

No clock and no sleeps run, because every check is a synchronous call.

## Expected strings (byte-exact)

`workspace.live.section`, `workspace-live-section`, `conversation.view`,
`client-dsh-workspace-live`, `live: dictionaries`, `live: workspace tab`,
`live: panel section`, `observe/stamp src/a.ts`, `graph/indexed src/b.ts`,
`batch/decision src/c.ts`.

## Expected count

12 PASS.
