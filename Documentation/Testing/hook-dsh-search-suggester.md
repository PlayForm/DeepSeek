# hook-dsh-search-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-search-suggester` (Classic/packages/hook-dsh-search-suggester).
- Profile row id: `hook-dsh-search-suggester` (bundled in the desktop profile).
- Exposes the `suggestion_dismiss` tool through the loader's tool API (guarded: a bare mount without
  `ctx.tools` still applies), and no other tools or services. It hooks `tools/post-execute` (plain
  registration, after the `{prepend:true}` listener of the ccr and the normalize family) and, when a
  search-class call (grep, glob, read, search-shaped bash) matches a family, prepends ONE labeled
  `additionalContexts` note naming the likely target set. The confidence gate is 0.75 (an explicit
  pack's own gate, 0.85 for the destructive intents, may raise it), with ≤7 candidates each with a
  stated reason, cooldown, dedupe, a per-turn cap, and an explicit abstention path.
- HISTORY-DRIVEN: the candidates come from a host-only `ctx.sessionProjections` unit (seamed at
  `Source/Interface/Session.ts`), which folds committed `tool/call` events (registered optionally
  through `ctx.inject(["sessionProjections"], ...)`, read through `stateOf(session, key)`, rebuilt
  from the log on first touch, with no post-execute append) and feeds `Adjacent` over the agent's
  OWN PREVIOUS TOOL CALLS in this workspace (the synthetic `History` family): the fold keeps one
  touch per `tool/call` (capped at 512, fail-open), and the adjacency scores the co-touch paths
  (confidence `sigmoid(2.5 - 0.6) = 0.87`, 0.89 on the R13 loop bonus). The built-in pack is retired
  and unimported (`State.Pack` is empty at apply).
- A pack is an EXPLICIT override only: `<repo>/.dsh/pack.yml` (or the user layer
  `~/.dsh/playform/workspaces/<slug>.yml`) resolved with `Resolve(root, { home, builtin: false })`;
  its `search/` families are projected (`Families(pack, "search")`) and filtered by the `intents`
  config, and the P3 seed fills the knowledge at load ONLY from an explicit pack + the projection. A
  repo without a pack and without history the hook abstains
  `search-suggester: abstained no-history  0.00`.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `search-suggester: abstained foreign-workspace  0.00` before any candidate work.
- The graph projection (P2) replaces the neutral literal with the `ctx.workspaceGraph` neighborhood.
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

    The activated line appears in `~/.dsh/playform/hook-dsh-search-suggester.log` as the byte-exact
    `search-suggester: activated (bundle 0.2.1, history, threshold 0.75)` (the second segment is
    `history`, not an intent count: there is no boot pack), and a cold mount logs the byte-exact
    `search-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                             | Expected                                                              | Pass criteria                                                                                                                     |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                             | one entry, `status: "schema"`                                         | the SCHEME §2 defaults match                                                                                                      |
| T2  | Seed the session history with co-touch paths, then `grep` a similar pattern         | ONE `History` note naming the paths touched right after similar calls | ≤7 candidates, each with a stated reason; the note text is byte-exact                                                             |
| T3  | A destructive explicit-pack intent call (Ledger, e.g. grep for an activated string) | the note passes the 0.85 gate                                         | the explicit pack's destructive threshold overrides the default                                                                   |
| T3  | A second same-intent search within cooldownCalls                                    | silence + `search-suggester: suppressed cooldown <Family>`            | cooldown and dedupe hold                                                                                                          |
| T4  | `suggestion_dismiss` with an intent + a candidate path                              | the dismissal is durable; `search-suggester: dismissed <Family> <path | *>`                                                                                                                               | the next matched note is held with `search-suggester: suppressed dismissed <Family>` until the entry expires (dismissTtl 86400 s) |
| T4  | `suggestion_dismiss` for the whole family (no path)                                 | the `*` path form of the dismissed line                               | the family dismissal holds every note for that family until expiry                                                                |
| T5  | A judged search in a workspace with no history and no pack layer                    | `search-suggester: abstained no-history  0.00`                        | the built-in pack is not a fallback; the honest silence is the new behavior, and the seed writes nothing without an explicit pack |
| T6  | A call path with no `.git`/`package.json` root and no session cwd                   | `search-suggester: abstained foreign-workspace  0.00`                 | the gate runs before any candidate work - the family segment is empty and the kappa is the no-signal 0.00                         |
| T5  | sectionMode `"sticky"`                                                              | the sticky section renders the projected index                        | `search-suggester: section rebuilt (ttl 20)`; a `tools/change` logs `search-suggester: section invalidated (tools/change)`        |

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

- Fix files: `Source/Interface/Session.ts`, `Source/Variable/Projection.ts`,
  `Source/Function/Unit.ts`, `Source/Function/Register.ts`, `Source/Function/History.ts`,
  `Source/Function/` (the adjacency, the detector, the scorer, the projection, the seed, the dismiss
  tool), `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-search-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-search-suggester/Target/Test/<Folder>/Test.js` per folder
  under `Source/Test/` (fifteen folders, 128 PASS per the folder READMEs, with
  `Post-Execute-And-Learning` at 17: `Abstention`, `Benchmark`, `Classification`, `Dismiss`,
  `Index-Refresh`, `Noise`, `Pack-Driven`, `Persistence`, `Post-Execute-And-Learning`, `Projection`,
  `Seed`, `Sticky-Section-And-Ring`, `Threshold-And-Cooldown`, `Wiring-And-Ledger`,
  `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-search-suggester`
- Tests run: T1 config - / T2 history note - / T3 destructive gate - / T3 cooldown - / T4 dismiss -
  / T5 no-history - / T6 foreign workspace -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
