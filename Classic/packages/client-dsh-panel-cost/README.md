# @playform/client-dsh-panel-cost

The Cost tab of the PlayForm plugin family: one conversation.view tab that renders a
Statistics-style cost table over the plugin-dsh-cost SQLite ledger. The host half registers a
read-only JSON route over the ledger; the browser half folds the rows into turns and steps and
renders the table.

The table keeps the harness Statistics panel's grammar - a sticky-header eleven-column table,
expandable turn rows whose step rows expand into a per-file detail block, tool and file pills with
tone dots, a square-root-scale four-segment cost bar, tabular numerals, and the same
empty/loading/error/end-of-history states - and replaces the harness's timing columns with cost
semantics, because the ledger writes no latency, first-token, or tool-duration column.

## Layout

- `Source/Library.ts` - the loader contract: name, Config, inject, apply.
- `Source/Client.ts` - the client entry: inject, apply.
- `Source/Function/Serve.ts` - the host route registration and its error codes.
- `Source/Function/Open.ts` - the read-only SQLite open (tilde expansion, `readOnly: true`).
- `Source/Function/Query.ts` - the seven read-only SQL statements.
- `Source/Function/Read.ts` - the rows-to-envelope read (session, calls, touches, allocations).
- `Source/Function/Fetch.ts` - the browser half of the route.
- `Source/Function/Client.ts` - the client body: dictionaries and the tab.
- `Source/Function/View.ts` - the panel shell, its five states, paging, and expansion.
- `Source/Function/Fold.ts` - the calls-to-turns fold.
- `Source/Function/Table.ts` - the table shell and the eleven-column header.
- `Source/Function/TurnRow.ts`, `StepRow.ts`, `DetailRow.ts`, `TotalsRow.ts` - the rows.
- `Source/Function/Cells.ts` - the cell renderers (scope, model, files, money, bar, allocation).
- `Source/Function/SummaryStrip.ts` - the session summary and the top-file band.
- `Source/Function/Price.ts`, `Count.ts`, `CountShort.ts`, `Rate.ts`, `Clock.ts`, `Stamp.ts`,
  `Share.ts`, `Lines.ts` - the formatters.
- `Source/Function/Styles.ts` - the binding to `@playform/lib-dsh-style`.
- `Source/Stylesheet/Plugin.scss` - the plugin's own sheet, on the shared material.
- `Source/Bundle.ts` - the client bundle's entry: it mounts the sheet, so the bundler compiles it
  and nothing is generated; the ESM half stays style-free.
- `Source/Interface/Stylesheet.d.ts` - the ambient `*.scss` module the sheet import resolves to.
- `Source/Variable/Config.ts` - the Schemastery schema.
- `Source/Variable/Slots.ts` - the slot points.
- `Source/Variable/Path.ts`, `Source/Variable/Limits.ts` - the route path and the row budget.
- `Source/Variable/Version.ts` - the build-time version.
- `Source/Variable/Locale-en.json`, `Source/Variable/Locale-zh.json` - the dictionaries (108 keys).
- `Source/Interface/*` - the contract types.
- `Configuration/ESBuild.ts` (+ `.js` twin), `Configuration/Test-ESBuild.ts` (+ `.js` twin) - the
  builds.
- `Source/Run.sh`, `Source/prepublishOnly.sh` - the build scripts.

## The data path

`GET /api/playform-cost/session?session=<id>&rows=<n>` answers one JSON envelope. `code` is `ok`
when the ledger was read, `session` when the query carries no session id (the ledger is never
opened), `unavailable` when the ledger file cannot be opened, and `error` for any other read
failure. Every failure keeps the same envelope shape, so the browser renders a state line instead of
a broken table.

## Tests

`Source/Test/` holds three suites: `Config-And-Tab` (the tab and dictionary wiring), `Serve-Route`
(the route registration and the missing-session answer), and `Fold-And-Format` (the fold and the
formatters). `sh Source/prepublishOnly.sh` builds the package and runs the harness selfcheck.
