# plugin-dsh-pass-on - the live test plan

## Identity

- Package: `@playform/plugin-dsh-pass-on` (Classic/packages/plugin-dsh-pass-on).
- Profile row id: `plugin-dsh-pass-on` (bundled in the desktop profile).
- Exposes the `passOn` service (`export default class PassOn extends Service` with
  `super(Context, "passOn")`, registered immediately on construction - the precedent of the factory)
  with `Prepare(intent, origin?)` and `Get(id)`. It holds the pass-on hop in the batch flow, turning
  an intent into a batch proposal without writing files itself (READ-ONLY, where the only disk
  writes are its own ledger lines).
- The pipeline (SCHEME §2): Resolve (explicit targets or the default globs of the kind, bounded by
  `maxTargets`, depth cap 8, `node_modules`/`.git`/`Target`/`dist` pruned) → Operate (deterministic
  per-kind transforms: `version-bump`, `set-field`, `replace`) → Preview (matched region ±80 chars,
  capped at `maxPreviewBytes`) → Digest (sha256 over `{ targets, operations }`, with the id as its
  first 12 hex chars). The result is `null` when the proposal would be empty or ambiguous, which is
  the abstention rule.
- The publication (SCHEME §3a, the real batch-contract wiring): the prepared proposal is converted
  to the canonical batch contract and published two ways: (1) `batch/proposed` on the bus, where the
  decision hook records it and the ingester holds it; (2) the harness agent-team inbox through
  `agent.inject(message)` carrying `[BATCH PROPOSAL - <id>]` + the canonical proposal JSON. The
  origin is the argument of the caller, else the harness initiator, else `""`.
- The policy block (D6, SCHEME §5a): `policy: Policy()` in the `Schema.object` call of the plugin,
  with read/suggest = `auto` and write/commit/spawn = `approve` (declared for uniformity, because
  the pass-on never writes, commits or spawns). One volatile object stays hot-editable, and a
  resolved pack's `policy` section overrides per action.
- Ledger: logFile `~/.dsh/playform/plugin-dsh-pass-on.log` (the journal lines `prepared` and
  `delivered`).

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-pass-on"}` for one entry with status schema (defaults: root
    `process.cwd()`, maxTargets 20, maxPreviewBytes 2048, expiresSeconds 3600, kinds - the 3 shipped
    kinds `version-bump`/`set-field`/`replace`, policy.* D6 defaults).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `passOn` resolves immediately on construction.

3. **The ledger line.**

    The activated line appears in `~/.dsh/playform/plugin-dsh-pass-on.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | `listService passOn` | the service is registered |
construction-time registration | | T4 | Call `Prepare(intent, origin?)` with a valid intent | the
proposal prepared and PUBLISHED two ways | `batch/proposed` emitted AND the
`[BATCH PROPOSAL - <id>]` block delivered to the origin agent's inbox; the `prepared`/`delivered`
journal lines land | | T4 | `Prepare` with an unknown kind or no resolved targets | `null` — the
abstention rule | no empty batch, no delivery | | T4 | A proposal targeting a non-/tmp path during
testing | forwarded but never applied | the pass-on itself never writes |

## Known live gaps

- Not dogfooded yet, so watch for the hop duplicating proposals (double delivery to the decision
  gate) and events lost when the decision service seam is absent. The bus emission still carries the
  proposal when the inbox delivery has no live agent (`inbox none` journaled honestly).

## Fix loop

- Fix files: `Source/Library.ts` (the class), `Source/Function/` (the pipeline, the batch
  conversion, the publication), `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-pass-on run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-pass-on/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-pass-on`
- Tests run: T1 config - / T1 service - / T4 prepare+publish - / T4 abstention - / T4 no-write -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
