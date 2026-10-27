# hook-dsh-convention-suggester - the live test plan

## Identity

- Package: `@playform/hook-dsh-convention-suggester`
  (Classic/packages/hook-dsh-convention-suggester).
- Profile row id: `convention-suggester` (bundled in the desktop profile).
- Exposes no tools or services: it hooks `tools/post-execute` for the modification family (`emitOn`:
  edit, raw-write, write) and prepends ONE labeled `additionalContexts` notice naming the companions
  that the convention requires. The classifier over the pack's intents is deterministic, no LLM sits
  in the hot path, and the hook is read-only by design (never edits, never rewrites arguments, never
  denies).
- PACK-DRIVEN: the table of intents is the `convention/` projection of the BUILT-IN pack
  (`@playform/lib-dsh-pack`; `Source/Variable/Defaults.ts` selects it with
  `Families(Builtin, "convention")`): Layout, Naming, Docs (threshold 0.75) and Ledger (0.85). A
  workspace pack (`<repo>/.dsh/pack.yml` or the user layer `~/.dsh/playform/workspaces/<slug>.yml`)
  overrides it per repo, and the Apply compiles the resolved pack's intents once per workspace root,
  so a repo pack overrides the built-in intents without a restart. The workspace root is the nearest
  ancestor whose PACK SIGNATURE matches (defaulting to `Documentation/ARCHIVE-STYLE.md`), and a
  foreign workspace logs `convention-suggester: abstained foreign-workspace  0.00`.
- The pack learner (D4): with learning ON, the hook derives a repo's pack from the repo itself and
  writes it as a PROPOSAL (`<home>/.dsh/playform/proposals/<slug>.yml`, never the live pack), once
  per workspace per process, on the first judged call when the resolved pack has no families.
- Ledger prefix: `convention-suggester:`; logFile
  `~/.dsh/playform/hook-dsh-convention-suggester.log`.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/hook-dsh-convention-suggester"}` for one entry with status schema
    (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200, cooldownCalls 6, maxNotesPerTurn
    3, intents `[]` (all pack intents enabled), emitOn edit/raw-write/write, exclude
    node_modules/Target/.git/dist, learning false).

2. **The tool check.**

    No tool is expected, because the hook registers none.

3. **The ledger line.**

    The `activated (...)` line appears in `~/.dsh/playform/hook-dsh-convention-suggester.log`
    (module-owned, byte-stable), and a cold mount logs the byte-exact
    `convention-suggester: disabled (enabled=false)`.

## Test cases

| #   | Trigger                                                                                            | Expected                                                                                                                       | Pass criteria                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | listConfigs query above                                                                            | one entry, `status: "schema"`                                                                                                  | the defaults match, including `learning: false`                                                                                                                                            |
| T3  | `write` a file under a Layout-family path (e.g. a new `Source/Function/X.ts`)                      | ONE labeled notice naming the layout companions (Library wiring, README, SCHEME)                                               | exactly one note; no argument rewrite; `<...>` placeholder targets are illustrative and never existence-checked                                                                            |
| T3  | A second write of the same intent within cooldownCalls                                             | silence + `convention-suggester: suppressed cooldown <Intent>`                                                                 | the cooldown suppresses the repeat                                                                                                                                                         |
| T1  | `grep`/`read` calls                                                                                | no notice                                                                                                                      | emitOn is the modification family only                                                                                                                                                     |
| T5  | A foreign workspace (no pack layer)                                                                | `convention-suggester: abstained foreign-workspace  0.00`                                                                      | the gate runs before the intent is known - the intent segment is empty and the kappa is the no-signal 0.00                                                                                 |
| T6  | learning true (or a pack with `learning.propose: true`) in a packless workspace, first judged call | ONE note (`learned pack proposal for <slug>`) and `convention-suggester: learned proposal <slug> <n> families <proposal path>` | the proposal is written to `~/.dsh/playform/proposals/<slug>.yml` (never the live workspaces layer), only derived families whose companions actually exist, once per workspace per process |
| T6  | The same workspace after the proposal (or an installed pack with families)                         | no second proposal; the convention note uses the pack's intents                                                                | a layer that carries families is never proposed over                                                                                                                                       |

## Known live gaps

- Not dogfooded yet, so watch for notes firing on excluded paths (Target, node_modules), the
  per-turn cap (maxNotesPerTurn 3) not being enforced, and the learner running before the gate's
  silence, which gives a proposed workspace the learning note instead of the convention note on that
  call.
- The refine-from-edits layer (an accepted suggestion moving a companion's weight) is the later D8
  lane and is not implemented.

## Fix loop

- Fix files: `Source/Function/` (the classifier, the note builder), `Source/Variable/Defaults.ts`
  (the pack selection), `Source/Library.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-convention-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-convention-suggester/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/` (`Post-Execute-And-Gate`, `Wiring-And-Ledger`, `Workspace-Gate`,
  `Pack-Driven`, `Learn-Note`, `Learn-Proposal`, `Learn-Install`), then restart the app.

## Report stub

- Plugin: `@playform/hook-dsh-convention-suggester`
- Tests run: T1 config - / T3 note - / T3 cooldown - / T1 silence - / T5 foreign workspace - / T6
  learning proposal -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
