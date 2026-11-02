# Policy-Defaults

This folder covers the shipped posture: the schema's defaults, the knob reader's defaults, the
policy block, and the identity places.

## Intent

The schema is the truth, and the knob reader exists because a bare construction never passes through
Schemastery. Two readers of one table is a duplicate by construction, so this folder compares BOTH
to one written-out table of plan section 9: a drift in either one fails here rather than at the
first live review.

Two defaults carry the whole posture:

- **`enabled: false`** is the idle-forever posture. A loaded plugin logs `disabled (enabled=false)`,
  the service stays resolvable, and no listener hard-fails on a missing service.
- **`write: auto`** is the one verdict that differs from the lesson-review sibling. This plugin
  publishes its own judged operations behind the fence rather than queueing them for acceptance,
  which is the Hermes parity decision. `commit` and `spawn` stay `approve`, because the plugin never
  commits and never spawns an agent.

The identity places are checked where a test can reach them: the package name (from `package.json`),
the log file default (derived from that name), the service name and ledger prefix (`skillLearn`, the
`domain` default), and the loader entry id (from `cordis.patch.yml`). The FIFTH place - the name
compiled into the build as `process.env.NAME_PACKAGE` - is the plugin build's define block, which
the test build does not set, so it is covered by `Configuration/ESBuild.ts` rather than here; the
name it compiles is the same `package.json` field this folder reads.

## Scenario

- "P1: `enabled` is false in both the schema and the reader".
- "P2: `write` is auto, and `commit` and `spawn` stay approve" - in the schema's composed cell and in
  the reader.
- "P3: the eight policy verdicts are the shipped posture" - the full D6 block on both sides.
- "P4: the ten path defaults are the family's own" - `logFile` through `agreementPath`.
- "P5: the fourteen numeric defaults are the shipped budgets" - the three write caps, the digest
  bounds, the request budgets, the two day thresholds, and the curator interval.
- "P6: the two booleans and the three strings are the shipped values".
- "P7: the identity places agree" - the package name, the log file default derived from it, the
  domain, and the patch row's id and name.
- "P8: the knob reader agrees with the schema's 29 scalar defaults" - the reader object, minus the
  composed `policy` block, compared to the same table P4-P6 hold the schema to.
- "P9: a partial override merges, a bad number falls back, and a cell is unwrapped" - including the
  `maxOperations` ceiling of eight (the prompt states it) and the day floor of one.

## Fixtures

The fixtures are the shared Harness (`Knobs`, the REAL `Target/Function/Knobs.js` reader) and the
real built `Target/Variable/Configuration.js` schema, resolved once with `{}`.

The schema's own fields are read through a local `Cell` reader, because Schemastery types a module's
own fields through `Record<string, unknown>` and this package's `Compose(false, {...})` spreads the
module block verbatim. The `Cell` reader unwraps the volatile cell and nothing else.

`package.json` and `cordis.patch.yml` are read from the package root with `node:fs`, not imported, so
the folder needs no JSON import attribute and reads the same bytes the loader does.

## Expected ledger strings (byte-exact)

None. The defaults are the contract this folder asserts as objects; the activation line that prints
them belongs to `Source/Library.ts`.

## Expected count

9 PASS.
