# hook-dsh-convention-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-convention-suggester`
  (Classic/packages/hook-dsh-convention-suggester).
- Profile row id: `convention-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the modification family (`emitOn`:
  edit, raw-write, write) and prepends ONE labeled `additionalContexts` notice naming the companions
  the agent itself touched. The history adjacency is deterministic, no LLM sits in the hot path, and
  the hook is read-only by design (never edits, never rewrites arguments, never denies).
- HISTORY-DRIVEN: the candidates come from the `session/event` fold + `Adjacent` over the agent's
  OWN PREVIOUS TOOL CALLS in this workspace (the synthetic `History` family): the fold keeps one
  `Touch` per `tool/call` (capped at 512), and the adjacency scores the paths that followed the
  anchor within a window of 8 calls, so a repeated co-touch outranks a single one and a near
  neighbour outranks a far one. The built-in pack is retired and unimported.
- A pack is an EXPLICIT override only: `<repo>/.dsh/pack.yml` (or the user layer
  `~/.dsh/playform/workspaces/<slug>.yml`) resolved with `Resolve(root, { home, builtin: false })`.
  When a layer exists, its `convention/` families drive the deterministic classifier (`Detect`), the
  existence filter, the gate and the notice; the pack's own `signature` gates it (`Locate`), so an
  absent marker abstains `foreign-workspace`. Without a pack and without history the hook abstains
  `convention-suggester: abstained no-history  0.00`.
- The workspace root is pack-independent: the nearest ancestor of the call path carrying `.git` or
  `package.json`, and a call path with no such ancestor and no session cwd logs
  `convention-suggester: abstained foreign-workspace  0.00` before any candidate work.
- Ledger prefix: `convention-suggester:`; logFile
  `~/.dsh/playform/hook-dsh-convention-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-convention-suggester"}` for one entry with status schema
    (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn
    3, intents `[]` (all explicit-pack intents enabled), emitOn edit/raw-write/write, exclude
    node_modules/Target/.git/dist, learning false - retired and kept for compatibility only).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The byte-exact `convention-suggester: activated (bundle 0.2.1, history, threshold 0.75)` line
    appears in `~/.dsh/playform/hook-dsh-convention-suggester.log` (module-owned, byte-stable; the
    boot compile is EMPTY, because no literal pack is a candidate source), and a cold mount logs the
    byte-exact `convention-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                             | Expected                                                                                | Pass criteria                                                                                                           |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                                                             | one entry, `status: "schema"`                                                           | the defaults match, including `learning: false` (retired)                                                               |
| T2  | seed the session history with two companions, then `write` the anchor file          | ONE labeled notice (`History 0.70`) naming the companions touched right after this file | exactly one note; no argument rewrite; the note text is byte-exact with the `touched 1 time(s) after this file` reasons |
| T3  | A second write of the same intent within cooldownCalls                              | silence + `convention-suggester: suppressed cooldown History`                           | the cooldown suppresses the repeat; with `cooldownCalls: 0` the per-turn cap suppresses instead                         |
| T1  | `grep`/`read` calls                                                                 | no notice                                                                               | emitOn is the modification family only                                                                                  |
| T4  | A call path with no `.git`/`package.json` root and no session cwd                   | `convention-suggester: abstained foreign-workspace  0.00`                               | the gate runs before any candidate work, and the foreign call never creates per-agent memory                            |
| T5  | A rooted workspace with no history and no pack layer                                | `convention-suggester: abstained no-history  0.00`                                      | the built-in pack is not a fallback; the honest silence is the new behavior                                             |
| T6  | A temporary repo with `.dsh/pack.yml` whose signature marker is present, no history | ONE note naming ONLY the pack's own targets and caveats                                 | the explicit pack drives the deterministic classifier; a pack whose marker is absent abstains `foreign-workspace`       |

## Known live gaps

- Not dogfooded yet, so watch for notes firing on excluded paths (Target, node_modules) and the
  per-turn cap (maxNotesPerTurn 3) not being enforced.
- The refine-from-edits layer (an accepted suggestion moving a companion's weight) is the later D8
  lane and is not implemented.

## Fix loop

- Fix files: `Source/Function/` (the history fold, the adjacency, the note builder),
  `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-convention-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-convention-suggester/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/` (`Pack-Driven`, `Post-Execute-And-Gate`, `Wiring-And-Ledger`,
  `Workspace-Gate`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-convention-suggester`
- Tests run: T1 config - / T2 history note - / T3 cooldown - / T1 silence - / T4 foreign workspace -
  / T5 no-history - / T6 explicit pack -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
