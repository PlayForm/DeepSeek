# Config-And-State

What this test verifies.

## Intent

The Run-1 defaults of the invisible flavor: what a plain `apply(ctx, config)` does before any stream
flows.

The validated config arrives with its volatile fields as `{ get }` cells, including the `replacement`
cell, because this is a CLASS flavor: the `Invisible` class of the core driven by a configurable
replacement whose schema default is the empty string, that is, REMOVAL.

The schema defaults carry `normalizeReasoning=true` and `normalizeToolArguments=false`.

The apply registers exactly four listeners (the llm/stream hook, the P10 loader/volatile-update
refresh of the factory and the two overpass arms) and builds a State through the REAL factory: the
volatile cells unwrapped into `State.Ledger`/`State.Enabled`/`State.Replacement`, the plain fields
and the module identity.

The activation line is the own string of the module and is asserted byte-exact, and it names
`replacement=`, the empty default.

The assertions are moved verbatim from `EffectTS/smokes/invisible-smoke.mjs` section "Run 1:
defaults" (the source suite stays in place during the migration, and this folder is the future home
of the same contract).

## Scenario

- Group: Run 1 - the validated config (the volatile cells and the schema
  defaults, exactly as the loader hands them to apply).
    - Sub: "volatile cell: log arrives as { get }"
        - assert.ok(Raw1.log && typeof Raw1.log.get === "function")
    - Sub: "volatile cell: logFile arrives as { get }"
        - assert.ok(typeof Raw1.logFile.get === "function")
    - Sub: "volatile cell: replacement arrives as { get }"
        - assert.ok(typeof Raw1.replacement.get === "function")
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
- Group: Run 1 - the State wiring (the factory's shared shape plus the
  CLASS flavor's own fields, the volatile cells unwrapped).
    - Sub: "state carries the REAL factory instance"
        - assert.ok(Run1.State && Run1.State.Factory === Furnace)
    - Sub: "volatile unwrap: logFile cell unwrapped to State.Ledger"
        - assert.ok(Run1.State.Ledger === "/tmp/invisible-smoke-ledger.log")
    - Sub: "volatile unwrap: log cell unwrapped to State.Enabled=true"
        - assert.ok(Run1.State.Enabled === true)
    - Sub: "volatile unwrap: replacement cell unwrapped to State.Replacement=''"
        - assert.ok(Run1.State.Replacement === "")
    - Sub: "plain fields: Reasoning=true, ToolArgs=false"
        - assert.ok(Run1.State.Reasoning === true && Run1.State.ToolArgs === false)
    - Sub: "state module = hook-dsh-normalize-invisible (the ledger prefix)"
        - assert.ok(Run1.State.Module === "hook-dsh-normalize-invisible")
- Group: Run 1 - the activation line (the module's own string, byte-exact).
    - Sub: "activation ledger line byte-exact"
        - assert.ok(Run1.Lines.includes(the activation string below))

## Fixtures

The shared harness (`../Harness.js`): the REAL factory instance (`Furnace`, constructed exactly the
way the own smoke of the factory does), the fake ctx (on/get/logger capture seams), the REAL `apply`
from the built `Target/Library.js`, the `Validate` helper (the schema call) and the ledger path
`/tmp/invisible-smoke-ledger.log` (removed at the start of the folder).

The config is `Validate({ logFile: Ledger })` with every other field at schema defaults, which puts
the `replacement` cell at the empty string.

No temp files exist beyond the ledger log.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-invisible: activated (replacement=, reasoning=on, toolArgs=off, logFile=/tmp/invisible-smoke-ledger.log)`

The logger line is captured in the Lines of the fake ctx, and the same string is also appended to the
ledger file by `Append` of the factory.

No other strings are asserted in this folder.

## Edge cases

- The CLASS-flavor positive: unlike the MAP flavors, the `replacement` field EXISTS in the schema and the `Replacement` field EXISTS in the State, and the volatile cell is asserted as `{ get }` before apply and as the unwrapped `""` after, which pins the removal default.
- The listener-count guard is exact: four listeners and not more, because a fifth registration would fail the count check.
- The volatile cells are asserted before apply (the `{ get }` shape of the schema) AND after (the unwrapped State fields), so both halves of the cell unwrap are pinned.

## Expected count

14 PASS.
