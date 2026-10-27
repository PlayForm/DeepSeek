# Trace-Roundtrip

The folder states what this test verifies.

## Intent

The folder tests the trace bus end to end (D5): the observe hook is the SOURCE, the graph is the consumer of the INDEXER, the context is the consumer of the PACKET, and the factory owns the one bus (`ctx.trace`).

The folder loads four REAL built packages (`@playform/ets-plugin-dsh-factory`, `@playform/hook-dsh-workspace-observe`, `@playform/plugin-dsh-workspace-graph`, `@playform/plugin-dsh-workspace-context`) onto ONE fake ctx and drives a real temp tree.

The test proves that an event emitted by one plugin reaches the adapter of another plugin without either import of the other.

## Scenario

- **T1.**

    The factory provides the one bus, every plugin registers on the ctx, and the observe hook is the only `fs/observed` root listener, because the graph consumes the bus and not the root event.

- **T2.**

    `indexWorkspace` indexes four files and emits `graph/indexed` for each, and a first index invalidates nothing.

- **T3.**

    The packet carries the real revision (`@ 4`), and a repeated identical query is served from the memo (the same object, with no second ledger line).

- **T4.**

    A COALESCED PAIR of observations (one file written once; the observe hook coalesces the repeat event, so ONE stamp line) produces exactly ONE re-index through the loop.

    The observe stamp line is byte-exact and its envelope is on the bus, and the graph emits `graph/invalidated` (reason `replaced`, the previous version) and `graph/indexed` (the new revision).

- **T5.**

    The consumer of `graph/invalidated` in the context cleared the memo, so the next identical query rebuilds against the new revision (`@ 5`) and ledgers its own line.

- **T6.**

    The `flush()` of the bus and the `State.Flush` of the graph settle deterministically, with no sleep anywhere.

- **T7.**

    An absent observation emits `graph/invalidated` (reason `absent`) and re-indexes nothing.

- **T8.**

    The source silences an excluded path through the exclude guard of the observe hook, so the path never reaches the bus.

- **T9.**

    The unload disposer of the graph adapter stops the re-index, and the wiring of the observe hook still records.

## Fixtures

- **The temp tree.**

    A real temp tree (`src/core.ts`, `src/util.ts`, `src/core.test.ts`, `README.md`, later `node_modules/pkg/index.ts`) is served through a disk-backed fake `ctx.fs` (resolve/stat/readText/listDir/contains).

- **The composite fake ctx.**

    The ctx supplies the `reflect.provide` + `provide` + `effect` seams of the factory, the `get` probe, the `root.on` capture, the logger, and the tools capture.

- **The REAL built `Target/`.**

    The test loads the built `Target/` of all four packages, where the bus of the factory is the `Target/Function/Trace.js` that the factory constructor builds.

## Expected ledger strings (byte-exact)

- `observe: stamped <path> version <version> (fs/observed)`
- `observe: ignored <path> (excluded)`
- `graph: reindexed <path> (<status>)`
- `context: packet <focus> (<tokens> tok, lens <lens>)`

The trace emissions add NO ledger line, because the strings of the graph and the context are unchanged.

## Edge cases

- **The coalesced pair.**

    One stamp (the observe hook drops the repeat event with the same version inside the coalescing window) gives one re-index.

- **The absent observation.**

    The observation is invalidated and never re-indexed.

- **The disposer.**

    The graph stops hearing the bus, and the source keeps recording.

- **The memo.**

    The test clears the memo wholesale on any invalidation, because a packet may cite any path.

## Expected count

12 PASS.
