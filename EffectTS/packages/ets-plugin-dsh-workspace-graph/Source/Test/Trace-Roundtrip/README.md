# Trace-Roundtrip

What this test verifies.

## Intent

The trace bus end to end (D5): the observe hook is the SOURCE, the graph is the
INDEXER's consumer, the context is the PACKET consumer, and the factory owns
the one bus (`ctx.trace`). The folder loads four REAL built packages
(`@playform/ets-plugin-dsh-factory`, `@playform/hook-dsh-workspace-observe`,
`@playform/plugin-dsh-workspace-graph`, `@playform/plugin-dsh-workspace-context`)
onto ONE fake ctx and drives a real temp tree, proving that an event emitted by
one plugin reaches another plugin's adapter without either importing the other.

## Scenario

- T1: the factory provides the one bus; every plugin registers on the ctx; the
  observe hook is the only `fs/observed` root listener (the graph consumes the
  bus, not the root event).
- T2: `indexWorkspace` indexes four files and emits `graph/indexed` for each; a
  first index invalidates nothing.
- T3: the packet carries the real revision (`@ 4`); a repeated identical query
  is served from the memo (same object, no second ledger line).
- T4: a COALESCED PAIR of observations (one file written once, two stamps)
  produces exactly ONE re-index through the loop; the observe stamp line is
  byte-exact and its envelope is on the bus; the graph emits
  `graph/invalidated` (reason `replaced`, the previous version) and
  `graph/indexed` (the new revision).
- T5: the context's `graph/invalidated` consumer cleared the memo - the next
  identical query rebuilds against the new revision (`@ 5`) and ledgers its own
  line.
- T6: the bus `flush()` and the graph's `State.Flush` settle deterministically
  (no sleep anywhere).
- T7: an absent observation emits `graph/invalidated` (reason `absent`) and
  re-indexes nothing.
- T8: an excluded path is silenced at the source (the observe hook's exclude
  guard) - it never reaches the bus.
- T9: the graph adapter's unload disposer stops the re-index; the observe
  hook's own wiring still records.

## Fixtures

- A real temp tree (`src/core.ts`, `src/util.ts`, `src/core.test.ts`,
  `README.md`, later `node_modules/pkg/index.ts`) served through a disk-backed
  fake `ctx.fs` (resolve/stat/readText/listDir/contains).
- The composite fake ctx: the factory's `reflect.provide` + `provide` + `effect`
  seams, the `get` probe, the `root.on` capture, the logger, and the tools
  capture.
- The REAL built `Target/` of all four packages (the factory's bus is the
  `Target/Function/Trace.js` the factory constructor builds).

## Expected ledger strings (byte-exact)

- `observe: stamped <path> version <version> (fs/observed)`
- `observe: ignored <path> (excluded)`
- `graph: reindexed <path> (<status>)`
- `context: packet <focus> (<tokens> tok, lens <lens>)`

The trace emissions add NO ledger line: the graph's and the context's strings
are unchanged.

## Edge cases

- A coalesced pair: two stamps, one re-index (the loop drops the in-flight
  duplicate).
- An absent observation: invalidated, never re-indexed.
- The disposer: the graph stops hearing the bus; the source keeps recording.
- The memo is cleared wholesale on any invalidation (a packet may cite any
  path).

## Expected count

12 PASS.
