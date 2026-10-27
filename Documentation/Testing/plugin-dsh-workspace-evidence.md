# plugin-dsh-workspace-evidence - the live test plan

## Identity

- Package: `@playform/plugin-dsh-workspace-evidence`
  (Classic/packages/plugin-dsh-workspace-evidence).
- Profile row id: `plugin-dsh-workspace-evidence` (bundled in the desktop profile).
- Exposes the `workspaceEvidence` service (`ctx.workspaceEvidence`): the validation objects, the
  evidence dependencies, the four kinds of truth, and the stale-validation invalidation (the Acar
  seam). Service surface: `validate(id, kind, subject, dependencies, verdict?)` records one
  validation object (throws on an invalid kind/id/subject, fail loud, and a revalidation
  supersedes), `check(id)` returns `"fresh" | "stale" | "superseded" | undefined`, `invalidate(key)`
  returns the number of objects gone stale, `list(status?)` returns the objects oldest sequence
  first, and `statistics()` returns `{ validations, fresh, stale, superseded, sequence }`.
- The four truth kinds (`TruthKind`): `reality`, `observation`, `representation`, `intent`.
- Config (all volatile): `log` true, `logFile` `~/.dsh/playform/plugin-dsh-workspace-evidence.log`,
  `enabled` false, `domain` `workspace_evidence`, `maxValidations` 512 (superseded evict first, then
  oldest), `exclude` `["node_modules/**", "**/Target/**", "**/.git/**"]`, and `policy` (the D6
  allowlist defaults).
- Ledger lines (module-owned, byte-stable, prefixed `evidence: `; from the package README):
  `` `evidence: disabled (enabled=false)` ``,
  `` `evidence: validated <id> (<kind>, <subject>, N dependencies, <verdict>, sequence N)` ``,
  `` `evidence: superseded <id> (sequence N)` ``, `` `evidence: stale <id> (dependency <key>)` ``,
  `` `evidence: no stale (dependency <key>)` ``, `` `evidence: ignored <path> (own actor)` ``,
  `` `evidence: ignored <path> (excluded)` ``,
  `` `evidence: ignored <path> (absent observation)` ``, `` `evidence: failed <path> (<reason>)` ``,
  `` `evidence: storage open failed: <reason>` ``.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-workspace-evidence"}` for one entry with status schema
    (defaults: domain `workspace_evidence`, maxValidations 512, the exclude globs, the D6 policy
    block).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `workspaceEvidence` resolves with `validate` /
    `check` / `invalidate` / `list` / `statistics`.

3. **The ledger line.**

    The line `evidence: disabled (enabled=false)` appears on a cold mount and
    `evidence: validated <id> (<kind>, <subject>, N dependencies, <verdict>, sequence N)` on the
    first record, in `~/.dsh/playform/plugin-dsh-workspace-evidence.log`.

## Test cases

| #   | Trigger                                         | Expected                        | Pass criteria                                                                                                                                |
| --- | ----------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | listConfigs query above                         | one entry, `status: "schema"`   | the defaults match (domain, maxValidations 512, exclude)                                                                                     |
| T2  | `validate(id, kind, subject, deps, "verified")` | the validation stored           | `evidence: validated <id> (<kind>, <subject>, N dependencies, verified, sequence N)`; an invalid kind/id/subject throws                      |
| T2  | Re-validate the same id                         | the old object superseded       | `evidence: superseded <id> (sequence N)`; `check(id)` reads `fresh`                                                                          |
| T2  | `invalidate(key)` for a declared dependency     | dependents go stale in one pass | `evidence: stale <id> (dependency <key>)`; the count returned matches; a key with no dependents logs `evidence: no stale (dependency <key>)` |
| T2  | `list()` and `statistics()`                     | the store counters              | `{ validations, fresh, stale, superseded, sequence }`; sequence is the service's own monotonic counter, never a wall clock                   |
| T2  | Exceed maxValidations                           | eviction                        | superseded evicted first, then oldest; the eviction is visible in `statistics()`                                                             |
| T1  | `check` on a fresh state                        | `undefined`                     | no fabricated records; the service records the caller's verdict, never invents one                                                           |

## Known live gaps

- Not dogfooded yet, so watch for invalidations not reaching the dependents through the Wire of the
  factory (a broken dependency join) and eviction dropping objects without the statistics reflecting
  it. The `policy` override of the resolved pack is the next refinement (the block documents the
  posture, and there is no gated action).

## Fix loop

- Fix files: `Source/Function/Service.ts`, `Source/Function/` (the store),
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-workspace-evidence run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-workspace-evidence/Target/Test/<Folder>/Test.js` per
  folder under `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-workspace-evidence`
- Tests run: T1 config - / T2 validate - / T2 supersede - / T2 invalidate - / T2 stats - / T2
  eviction - / T1 empty -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
