# hook-dsh-search-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-search-suggester` (Classic/packages/hook-dsh-search-suggester).
- Profile row id: `hook-dsh-search-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` (plain registration, after the ccr's
  `{prepend:true}` listener and the normalize family) and, when a search-class call (grep, glob,
  read, search-shaped bash) matches one of the ten intent kinds (Version, Path, Ledger, Config,
  Dependency, Test, Symbol, Doc, Usage, Owner), prepends ONE labeled `additionalContexts` note
  naming the likely target set. Confidence gate 0.75 (0.85 for the destructive intents), ≤7
  candidates each with a stated reason, cooldown, dedupe, per-turn cap, explicit abstention path.
- Ledger prefix: `search-suggester:`; logFile `~/.dsh/search-suggester.log`.

## Activation checks

1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-search-suggester"}` → one entry, status schema (defaults: the ten
   intents, emitOn grep/glob/read/bash, learn true, persistPath
   ~/.dsh/search-suggester/knowledge.json, indexPath ~/.dsh/search-suggester/index.json, sectionMode
   off).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/search-suggester.log`; a cold mount logs the
   byte-exact `search-suggester: disabled (enabled=false)`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the ten intents in priority order | | T3 | `grep` a version-like pattern (e.g.
`"version"`) | ONE Version-intent note naming the manifests/package.json | ≤7 candidates, each with
a stated reason | | T3 | A destructive intent call (Ledger, e.g. grep for an activated string) | the
note passes the 0.85 gate | destructive threshold overrides the default | | T1 | A second
same-intent search within cooldownCalls | silence + abstention ledger line | cooldown and dedupe
hold |

## Known live gaps

- Not dogfooded yet. Watch for: the index being stale (refreshOnBoot must rebuild when the
  fingerprint differs) and the learner writing to knowledge.json unexpectedly during tests.

## Fix loop

- Fix files: `Source/Function/` (the intent table, the matcher, the learner), `Source/Library.ts`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-search-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-search-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/`. Then the app restart.

## Report stub

- Plugin: `@playform/hook-dsh-search-suggester`
- Tests run: T1 config - / T3 Version note - / T3 destructive gate - / T1 cooldown -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
