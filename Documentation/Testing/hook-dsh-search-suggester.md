# hook-dsh-search-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-search-suggester` (Classic/packages/hook-dsh-search-suggester).
- Profile row id: `hook-dsh-search-suggester` (bundled in the desktop profile).
- Exposes the `suggestion_dismiss` tool through the loader's tool API (guarded: a bare mount without
  `ctx.tools` still applies), and no other tools or services. It hooks `tools/post-execute` (plain
  registration, after the `{prepend:true}` listener of the ccr and the normalize family) and, when a
  search-class call (grep, glob, read, search-shaped bash) matches one of the ten intent kinds
  (Version, Path, Ledger, Config, Dependency, Test, Symbol, Doc, Usage, Owner), prepends ONE labeled
  `additionalContexts` note naming the likely target set. The confidence gate is 0.75 (the pack's
  0.85 for the destructive intents), with ≤7 candidates each with a stated reason, cooldown, dedupe,
  a per-turn cap, and an explicit abstention path.
- PACK-DRIVEN: the `search/` intents of the resolved workspace pack (`Families(pack, "search")` from
  `@playform/lib-dsh-pack`) drive Detect, so a repo pack (`.dsh/pack.yml` -> the user layer
  `~/.dsh/playform/workspaces/<slug>.yml` -> the built-in pack) overrides the built-in intents
  without a restart. The workspace root is the nearest ancestor whose PACK SIGNATURE matches (the
  `signature` list of the resolved pack, defaulting to `Documentation/ARCHIVE-STYLE.md`), and a
  foreign workspace has no pack and logs `search-suggester: abstained foreign-workspace  0.00`. The
  graph projection (P2) replaces the neutral literal with the `ctx.workspaceGraph` neighborhood, and
  the P3 seed fills the knowledge at load from the canonical candidates of the built-in pack + the
  projection.
- Ledger prefix: `search-suggester:`; logFile `~/.dsh/playform/hook-dsh-search-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-search-suggester"}` for one entry with status schema (SCHEME §2
    defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn
    3, the ten intents in priority order, emitOn grep/glob/read/bash, learn true, learnWindow 2,
    persistPath ~/.dsh/search-suggester/knowledge.json, refreshOnBoot true, dismissTtl 86400, seed
    true, sectionMode off, sectionTtl 20; `indexPath` is RETIRED by the P2 re-spec, because the
    graph projection supersedes it and it is never read).

2. **The tool check.**

    `suggestion_dismiss` is expected (the surfaces table of the SCHEME, the tool API of the loader).

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/hook-dsh-search-suggester.log` as
    `search-suggester: activated (bundle 0.1.0, intents 10, threshold 0.75)`, and a cold mount logs
    the byte-exact `search-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                               | Expected                                                              | Pass criteria                                                                                                              |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                               | one entry, `status: "schema"`                                         | the SCHEME §2 defaults match                                                                                               |
| T3  | `grep` a version-like pattern (e.g. `"version"`)                      | ONE Version-intent note naming the manifests/package.json             | ≤7 candidates, each with a stated reason                                                                                   |
| T3  | A destructive intent call (Ledger, e.g. grep for an activated string) | the note passes the 0.85 gate                                         | the pack's destructive threshold overrides the default                                                                     |
| T3  | A second same-intent search within cooldownCalls                      | silence + `search-suggester: suppressed cooldown <Intent>`            | cooldown and dedupe hold                                                                                                   |
| T4  | `suggestion_dismiss` with an intent + a candidate path                | the dismissal is durable; `search-suggester: dismissed <Intent> <path | *>`                                                                                                                        | the next matched note is held with `search-suggester: suppressed dismissed <Intent>` until the entry expires (dismissTtl 86400 s) |
| T4  | `suggestion_dismiss` for the whole family (no path)                   | the `*` path form of the dismissed line                               | the family dismissal holds every note for that intent until expiry                                                         |
| T5  | A foreign workspace (no pack layer)                                   | `search-suggester: abstained foreign-workspace  0.00`                 | the gate runs before the intent is known - the intent segment is empty and the kappa is the no-signal 0.00                 |
| T5  | sectionMode `"sticky"`                                                | the sticky section renders the projected index                        | `search-suggester: section rebuilt (ttl 20)`; a `tools/change` logs `search-suggester: section invalidated (tools/change)` |

## Known live gaps

- Not dogfooded yet, so watch for the graph being empty in a cold workspace (the absent/empty graph
  keeps the documented neutral fallback), the seed writing to knowledge.json unexpectedly during
  tests, and refreshOnBoot rebuilding the projection on `tools/change` when the fingerprint differs.
- Residuals from the SCHEME (not silently dropped): the section 3.4 scope override of the plan (a
  lockfile grep is Dependency, not Version) is not implemented, because the signals carry no scope
  weight; the exploratory-question gate and the read-only-subagent threshold bump (plan 2.4,
  abstentions 4 and 5) are not implemented; the near-miss rule and the `history -= 0.2` ignored
  penalty (plan 6.2) are not implemented; the ETS twin (`@playform/ets-hook-dsh-search-suggester`)
  is deferred.

## Fix loop

- Fix files: `Source/Function/` (the pack projection, the detector, the scorer, the seed, the
  dismiss tool), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-search-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-search-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (fifteen folders, 126 PASS per the SCHEME, including the `Pack-Driven`,
  `Dismiss`, `Seed`, `Projection` and `Benchmark` capability folders), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-search-suggester`
- Tests run: T1 config - / T3 Version note - / T3 destructive gate - / T3 cooldown - / T4 dismiss -
  / T5 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
