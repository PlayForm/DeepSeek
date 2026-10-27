# plugin-dsh-feedback - the live test plan

## Identity

- Package: `@playform/plugin-dsh-feedback` (Classic/packages/plugin-dsh-feedback).
- Profile row id: `plugin-dsh-feedback` (bundled in the desktop profile; this is the one member that
  ships `enabled: true` - a SERVICE-PROVIDER bundle).
- Exposes the `feedback` service (`ctx.feedback`), declared as
  `export default class Feedback extends Service` with a static Config (validated before
  construction) registered via `super(Context, "feedback")`. It is the honest-signal collector: the
  transfer hop, the optional read, and the council summary. Service surface (SCHEME §2):
  `Record(block)`, `Push(block, parentSession)`, `Delta(session, agentId, text)`,
  `Read(session, agentId, reader)`, `Summary(session)`,
  `Outcome(session, agentId, proposal, outcome, detail)`. All knobs are read at construction, with
  no hot refresh, so a config edit reloads the plugin.
- The batch outcome (SCHEME §2 `Outcome`): the ingester calls it after every apply, and the outcome
  is appended to the outcome ring of the session, bounded by `maxOutcomes` (16 per README), with the
  journal line `{ at, event: "batch", session, agentId, proposal, outcome, detail }` carried in the
  summary beside the blocks. A disabled service or an empty proposal id records nothing.
- Ledger: the journal (one JSON line per event, block events and the batch outcome), logFile
  `~/.dsh/playform/plugin-dsh-feedback.log`, and no separate activation string is observed, because
  the service registration is the proof.
- The policy block (D6, SCHEME §4.1): the schema composes the shared `policy: Policy()` of the
  factory, with record/suggest = `auto` and write/commit/spawn = `approve` (declared for uniformity,
  because the member never writes, commits or spawns). One volatile object stays hot-editable, and a
  resolved pack's `policy` section overrides per action.

## Activation checks

1. **The Config.**

    Inspect the Config with `cordis_inspect_query` host/Config/listConfigs
    `{"name": "@playform/plugin-dsh-feedback"}` for one entry with status schema (defaults:
    maxBlockBytes 4096, maxChain 8, maxSessions 128, summaryTerms 10, maxOutcomes 16, policy.* D6
    defaults).

2. **The service check.**

    `cordis_inspect_query` host/Service/listService `feedback` resolves immediately on construction.

3. **The ledger line.**

    Entries appear in `~/.dsh/playform/plugin-dsh-feedback.log`.

## Test cases

| # | Trigger | Expected | Pass criteria | | T1 | listConfigs query above | one entry,
`status: "schema"` | the defaults match | | T1 | The `feedback` service resolves on the context |
registration succeeded | `ctx.feedback` non-null | | T2 | Collect a small honest-signal block | the
block stored | size ≤ maxBlockBytes 4096 | | T2 | Chain signals beyond maxChain 8 | the chain is
capped | no unbounded growth; the cap ledgered | | T1 | The council summary request | a summary with
≤ summaryTerms 10 terms | bounded output | | T2 | The ingester calls
`Outcome(session, agentId, proposal, "applied", detail)` | the outcome recorded and journaled |
`event: "batch"` in the logFile; the summary shows it; the ring capped at maxOutcomes 16 |

## Known live gaps

- Not dogfooded yet, so watch for maxSessions 128 eviction dropping active session blocks, the read
  path returning stale summaries, and no hot config refresh (all knobs are read at construction, so
  a config edit reloads the plugin).

## Fix loop

- Fix files: `Source/Library.ts` (the class, the static Config), `Source/Function/`,
  `Source/Variable/Config.ts`.
- Rebuild:
  `pnpm --config.verify-deps-before-run=false --dir Classic/packages/plugin-dsh-feedback run prepublishOnly`
- Smokes: `node Classic/packages/plugin-dsh-feedback/Target/Test/<Folder>/Test.js` per folder under
  `Source/Test/`, then restart the app.

## Report stub

- Plugin: `@playform/plugin-dsh-feedback`
- Tests run: T1 config - / T1 service - / T2 collect - / T2 chain cap - / T2 outcome ring -
- Defects: file:line - cause - fix
- Rebuild/smoke: -
- Residuals: -
