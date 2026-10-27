# Trace-Roundtrip

This page records what the test verifies.

## Intent

The test covers the trace bus end to end (D5), where the observe hook is the SOURCE, the graph is the INDEXER's consumer, the context is the PACKET consumer, and the factory owns the one bus (`ctx.trace`).

The folder loads four REAL built packages (`@playform/plugin-dsh-factory`, `@playform/hook-dsh-workspace-observe`, `@playform/plugin-dsh-workspace-graph`, `@playform/plugin-dsh-workspace-context`) onto ONE fake ctx and drives a real temp tree, which proves that an event emitted by one plugin reaches another plugin's adapter without either one importing the other.

## Scenario

- T1: the factory provides the one bus, every plugin registers on the ctx, and the observe hook is the only `fs/observed` root listener, because the graph consumes the bus and not the root event.
- T2: `indexWorkspace` indexes four files and emits `graph/indexed` for each, and a first index invalidates nothing.
- T3: the packet carries the real revision (`@ 4`), and a repeated identical query is served from the memo (same object, no second ledger line).
- T4: a COALESCED PAIR of observations (one file written once, and the observe hook coalesces the repeat event, so ONE stamp line) produces exactly ONE re-index through the loop, the observe stamp line is byte-exact and its envelope is on the bus, and the graph emits `graph/invalidated` (reason `replaced`, the previous version) and `graph/indexed` (the new revision).
- T5: the context's `graph/invalidated` consumer cleared the memo, so the next identical query rebuilds against the new revision (`@ 5`) and ledgers its own line.
- T6: the bus `flush()` and the graph's `State.Flush` settle deterministically, with no sleep anywhere.
- T7: an absent observation emits `graph/invalidated` (reason `absent`) and re-indexes nothing.
- T8: an excluded path is silenced at the source by the observe hook's exclude guard, so it never reaches the bus.
- T9: the graph adapter's unload disposer stops the re-index, while the observe hook's own wiring still records.

## Fixtures

- A real temp tree (`src/core.ts`, `src/util.ts`, `src/core.test.ts`, `README.md`, later `node_modules/pkg/index.ts`) served through a disk-backed fake `ctx.fs` (resolve/stat/readText/listDir/contains).
- The composite fake ctx: the factory's `reflect.provide` + `provide` + `effect` seams, the `get` probe, the `root.on` capture, the logger, and the tools capture.
- The REAL built `Target/` of all four packages, where the factory's bus is the `Target/Function/Trace.js` that the factory constructor builds.

## Expected ledger strings (byte-exact)

- `observe: stamped <path> version <version> (fs/observed)`
- `observe: ignored <path> (excluded)`
- `graph: reindexed <path> (<status>)`
- `context: packet <focus> (<tokens> tok, lens <lens>)`

The trace emissions add NO ledger line, and the graph's and the context's strings are unchanged.

## Edge cases

- A coalesced pair gives one stamp, because the observe hook drops the repeat event with the same version inside the coalescing window, and one re-index.
- An absent observation is invalidated and never re-indexed.
- With the disposer, the graph stops hearing the bus, and the source keeps recording.
- The memo is cleared wholesale on any invalidation, because a packet may cite any path.

## Expected count

12 PASS.
