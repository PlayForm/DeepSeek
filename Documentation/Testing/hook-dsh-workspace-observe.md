# hook-dsh-workspace-observe - the live test plan

## Identity
- Package: `@playform/hook-dsh-workspace-observe`
  (Classic/packages/hook-dsh-workspace-observe).
- Profile row id: `hook-dsh-workspace-observe` (bundled in the desktop profile).
- Exposes: the `workspaceObserve` service concept, but functionally a listener:
  on every fs/observed event (heard on the ROOT context, the factory's Wire
  registration) it writes one observation stamp (path, observed version, origin,
  the plugin's own monotonic sequence) into its KV domain `workspace_observe`.
  The conversation never sees the stamps; a later wave's events surface them.
  The listener is a SYNCHRONOUS recorder: no awaits, no throws, no I/O, no file
  content ever read, no wall clock (WAVE-1-BRIEF.md section 5).
- Ledger: logFile `~/.dsh/observe.log`.

## Activation checks
1. Inspect Config: `cordis_inspect_query` host/Config/listConfigs
   `{"name": "@playform/hook-dsh-workspace-observe"}` → one entry, status
   schema (defaults: domain workspace_observe, maxStamps 1000, include [],
   exclude triple).
2. Service check: none expected (the recorder registers no tools).
3. Ledger line: the activated line in `~/.dsh/observe.log`; a cold mount logs
   `disabled (enabled=false)` and no listener is wired.

## Test cases
| # | Trigger | Expected | Pass criteria |
| T1 | listConfigs query above | one entry, `status: "schema"` | the defaults match |
| T3 | Write a /tmp scratch file | ONE stamp in the workspace_observe domain | stamp carries path, observed version, origin, monotonic sequence |
| T3 | Write 3 files quickly | 3 stamps with strictly increasing sequence | the monotonic sequence never repeats or reorders |
| T1 | An event under node_modules/** or **/Target/** | no stamp | the exclusion triple filters it |

## Known live gaps
- Not dogfooded yet. Watch for: stamps evicted at maxStamps without the drop
  being ledgered, and any await/throw in the listener (must be synchronous).

## Fix loop
- Fix files: `Source/Function/` (the stamp recorder, the ring),
  `Source/Library.ts`, `Source/Variable/Config.ts`.
- Rebuild: `pnpm --config.verify-deps-before-run=false --dir Classic/packages/hook-dsh-workspace-observe run prepublishOnly`
- Smokes: `node Classic/packages/hook-dsh-workspace-observe/Target/Test/<Folder>/Test.js`
  per folder under `Source/Test/`. Then the app restart.

## Report stub
- Plugin: `@playform/hook-dsh-workspace-observe`
- Tests run: T1 config - / T3 stamp - / T3 sequence - / T1 exclusion -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
