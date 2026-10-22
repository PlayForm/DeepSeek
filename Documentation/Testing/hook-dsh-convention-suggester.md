# hook-dsh-convention-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-convention-suggester`
  (Classic/packages/hook-dsh-convention-suggester).
- Profile row id: `convention-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the
  modification family (`emitOn`: edit, raw-write, write) and prepends ONE
  labeled `additionalContexts` notice naming the companions the convention
  requires. Deterministic classifier (layout / naming / docs / ledger-string
  families); no LLM in the hot path; read-only by design (never edits, never
  rewrites arguments, never denies).
- Ledger prefix: `convention-suggester:`; logFile
  `~/.dsh/convention-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-convention-suggester"}` → one entry, status
   schema (defaults: threshold 0.75, maxCandidates 7, maxNoteChars 1200,
   cooldownCalls 6, maxNotesPerTurn 3, emitOn edit/raw-write/write, exclude
   node_modules/Target/.git/dist).
2. Tool check: none expected (no tools).
3. Ledger line: the `activated (...)` line in `~/.dsh/convention-suggester.log`
   (module-owned, byte-stable).

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T3 | `write` a file under a Layout-family path (e.g. a new `Source/Function/X.ts`) | ONE labeled notice naming the layout companions (Library wiring, README, SCHEME) | exactly one note; no argument rewrite |
| T3 | A second write of the same intent within cooldownCalls | silence | the cooldown suppresses the repeat; the abstention is a ledger line |
| T1 | `grep`/`read` calls | no notice | emitOn is the modification family only |

## Known live gaps
- Not dogfooded yet. Watch for: notes firing on excluded paths (Target,
  node_modules) and the per-turn cap (maxNotesPerTurn 3) not being enforced.

## Fix loop
- Fix files: `Source/Function/` (the classifier, the note builder),
  `Source/Variable/Defaults.ts` (the pattern pack), `Source/Library.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-convention-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-convention-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-convention-suggester`
- Tests run: T1 config - / T3 note - / T3 cooldown - / T1 silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
