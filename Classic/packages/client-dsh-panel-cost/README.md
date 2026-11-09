# @playform/client-dsh-panel-cost

The Cost tab of the PlayForm plugin family: one conversation.view tab that renders a
Statistics-style cost table over the plugin-dsh-cost SQLite ledger. The host half registers a
read-only JSON route over the ledger; the browser half folds the rows into turns and steps and
renders the table.

## Layout

- `Source/Library.ts` - the loader contract: name, Config, inject, apply.
- `Source/Client.ts` - the client entry: styles, inject, apply.
- `Source/Function/Serve.ts` - the host route registration (placeholder body).
- `Source/Function/Client.ts` - the client body: dictionaries and the tab.
- `Source/Function/View.ts` - the placeholder panel component.
- `Source/Function/Styles.ts` - the stylesheet injector.
- `Source/Variable/Config.ts` - the Schemastery schema.
- `Source/Variable/Slots.ts` - the slot points.
- `Source/Variable/Version.ts` - the build-time version.
- `Source/Variable/Locale-en.json`, `Source/Variable/Locale-zh.json` - the dictionaries.
- `Source/Interface/Config.ts`, `Source/Interface/Client.ts` - the types.
- `Configuration/ESBuild.ts` (+ `.js` twin), `Configuration/Test-ESBuild.ts` (+ `.js` twin) - the
  builds.
- `Source/Run.sh`, `Source/prepublishOnly.sh` - the build scripts.

## Status

The cost table itself is implemented by a later lane; this package is the skeleton that builds and
mounts the empty tab.
