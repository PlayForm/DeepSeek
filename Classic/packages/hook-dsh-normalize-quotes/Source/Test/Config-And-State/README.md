# Config-And-State

What this test verifies.

## Intent

The Run-1 defaults of the quotes flavor: what a plain `apply(ctx, config)`
does before any stream flows. The validated config arrives with its volatile
fields as `{ get }` cells; the schema defaults carry `normalizeReasoning=true`
and `normalizeToolArguments=false` and NO `replacement` field (this is a MAP
flavor - the substitution is the core's Quotes table, not a configured knob).
The apply registers exactly four listeners (the llm/stream hook, the factory's
P10 loader/volatile-update refresh and the two overpass arms) and builds a
State through the REAL factory: the volatile cells unwrapped into
`State.Ledger`/`State.Enabled`, no `Replacement` field, the plain fields and
the module identity. The activation line is the module's own string and is
asserted byte-exact. The assertions are moved verbatim from
`Classic/smokes/quotes-smoke.mjs` section "Run 1: defaults" (the source suite
stays in place during the migration; this folder is the future home of the
same contract).

## Scenario

- Group: Run 1 - the validated config (the volatile cells and the schema
  defaults, exactly as the loader hands them to apply).
    - Sub: "volatile cell: log arrives as { get }"
        - assert.ok(Raw1.log && typeof Raw1.log.get === "function")
    - Sub: "volatile cell: logFile arrives as { get }"
        - assert.ok(typeof Raw1.logFile.get === "function")
    - Sub: "MAP flavor: no replacement field in the schema"
        - assert.ok(Raw1.replacement === undefined)
    - Sub: "config default normalizeReasoning=true"
        - assert.ok(Raw1.normalizeReasoning === true)
    - Sub: "config default normalizeToolArguments=false"
        - assert.ok(Raw1.normalizeToolArguments === false)
- Group: Run 1 - the listener registration (the stream hook plus the
  factory's P10 volatile-update refresh plus the two overpass arms).
    - Sub: "the llm/stream listener is registered"
        - assert.ok(typeof Run1.Listeners["llm/stream"] === "function")
    - Sub: "llm/stream + the P10 volatile-update refresh + the two overpass
      arms (post-execute prepended, pre-step default order)"
        - assert.ok(Object.keys(Run1.Listeners).length === 4 && the
          loader/volatile-update, tools/post-execute and agent/pre-step
          entries all present)
- Group: Run 1 - the State wiring (the factory's shared shape plus the MAP
  flavor's own fields, the volatile cells unwrapped).
    - Sub: "state carries the REAL factory instance"
        - assert.ok(Run1.State && Run1.State.Factory === Furnace)
    - Sub: "volatile unwrap: logFile cell unwrapped to State.Ledger"
        - assert.ok(Run1.State.Ledger === "/tmp/quotes-smoke-ledger.log")
    - Sub: "volatile unwrap: log cell unwrapped to State.Enabled=true"
        - assert.ok(Run1.State.Enabled === true)
    - Sub: "MAP flavor: state carries no Replacement field"
        - assert.ok(!("Replacement" in Run1.State))
    - Sub: "plain fields: Reasoning=true, ToolArgs=false"
        - assert.ok(Run1.State.Reasoning === true && Run1.State.ToolArgs === false)
    - Sub: "state module = hook-dsh-normalize-quotes (the ledger prefix)"
        - assert.ok(Run1.State.Module === "hook-dsh-normalize-quotes")
- Group: Run 1 - the activation line (the module's own string, byte-exact).
    - Sub: "activation ledger line byte-exact"
        - assert.ok(Run1.Lines.includes(the activation string below))

## Fixtures

The shared harness (`../Harness.js`): the REAL factory instance (`Furnace`,
constructed exactly the way the factory's own smoke does), the fake ctx
(on/get/logger capture seams), the REAL `apply` from the built
`Target/Library.js`, the `Validate` helper (the schema call) and the ledger
path `/tmp/quotes-smoke-ledger.log` (removed at the folder's start). The
config is `Validate({ logFile: Ledger })` - every other field at schema
defaults. No temp files beyond the ledger log.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=/tmp/quotes-smoke-ledger.log)`

(The logger line is captured in the fake ctx's Lines; the same string is also
appended to the ledger file by the factory's Append. No other strings are
asserted in this folder.)

## Edge cases

- The MAP-flavor negatives: no `replacement` in the schema and no
  `Replacement` in the State - both asserted as absences.
- The listener-count guard is exact: four listeners, not more - a fifth
  registration would fail the count check.
- The volatile cells are asserted before apply (the schema's `{ get }`
  shape) AND after (the unwrapped State fields) - both halves of the cell
  unwrap are pinned.

## Expected count

14 PASS.
