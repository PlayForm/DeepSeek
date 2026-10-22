# hook-dsh-doc-suggester - the live test plan

## Identity
- Package: `@playform/hook-dsh-doc-suggester`
  (Classic/packages/hook-dsh-doc-suggester).
- Profile row id: `hook-dsh-doc-suggester` (bundled in the desktop profile).
- Exposes: no tools or services - it hooks `tools/post-execute` for the doc-task
  tools (read, grep, glob, write, edit, raw-write) and, when the call touches a
  documentation path (plan, guide, skill, index, site content), prepends ONE
  labeled `additionalContexts` note naming the doc-graph companions: the INDEX
  row, the frontmatter statuses/registry/index block, the archive style, the
  cross-references, the site mirror. Deterministic path rules; abstention is a
  ledger line for every silence.
- Ledger prefix: `doc-suggester:`; logFile `~/.dsh/doc-suggester.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-doc-suggester"}` → one entry, status schema
   (defaults: threshold 0.75, maxCompanions 7, maxNoteChars 1200, cooldownCalls
   6, maxNotesPerTurn 3, exclude node_modules/Target/.git/dist).
2. Tool check: none expected (no tools).
3. Ledger line: the activated line in `~/.dsh/doc-suggester.log`; a cold mount
   logs the byte-exact `doc-suggester: disabled (enabled=false)`.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T3 | `edit` a file under `Documentation/` | ONE note naming the doc-graph companions | exactly one note; the note never replaces content |
| T3 | `read` a plan file under `Documentation/Plans/` | ONE note (index row, site mirror) | the family classification fired on a read-class call |
| T1 | `read` a source file outside the doc tree | silence + abstention ledger line | no note; the silence is ledgered |

## Known live gaps
- Not dogfooded yet. Watch for: the note firing on `Site/Source/pages/*` without
  the site mirror companion, and double notes when a call matches two families.

## Fix loop
- Fix files: `Source/Function/` (the family rules, the note builder),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-doc-suggester run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-doc-suggester/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-doc-suggester`
- Tests run: T1 config - / T3 edit-note - / T3 read-note - / T1 silence -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
