# Config-And-State

What this test verifies.

## Intent

This folder covers the Run-1 defaults of the quotes flavor: what a plain `apply(ctx, config)` does before any stream flows.

The validated config arrives with its volatile fields as `{ get }` cells.

The schema defaults carry `normalizeReasoning=true` and `normalizeToolArguments=false` and NO `replacement` field, because this is a MAP flavor where the Quotes table of the core does the substitution rather than a configured knob.

The apply registers exactly four listeners (the llm/stream hook, the P10 loader/volatile-update refresh of the factory, and the two overpass arms) and builds a State through the REAL factory.

The volatile cells unwrap into `State.Ledger`/`State.Enabled`, with no `Replacement` field, and the plain fields and the module identity follow.

The activation line is the module's own string and is asserted byte-exact.

The assertions are moved verbatim from `EffectTS/smokes/quotes-smoke.mjs` section "Run 1: defaults" (the source suite stays in place during the migration, and this folder is the future home of the same contract).

## Scenario

- Group: Run 1 - the validated config (the volatile cells and the schema defaults, exactly as the loader hands them to apply).
    - Check: "volatile cell: log arrives as { get }".
        - assert.ok(Raw1.log && typeof Raw1.log.get === "function")
    - Check: "volatile cell: logFile arrives as { get }".
        - assert.ok(typeof Raw1.logFile.get === "function")
    - Check: "MAP flavor: no replacement field in the schema".
        - assert.ok(Raw1.replacement === undefined)
    - Check: "config default normalizeReasoning=true".
        - assert.ok(Raw1.normalizeReasoning === true)
    - Check: "config default normalizeToolArguments=false".
        - assert.ok(Raw1.normalizeToolArguments === false)
- Group: Run 1 - the listener registration (the stream hook plus the P10 volatile-update refresh of the factory plus the two overpass arms).
    - Check: "the llm/stream listener is registered".
        - assert.ok(typeof Run1.Listeners["llm/stream"] === "function")
    - Check: "llm/stream + the P10 volatile-update refresh + the two overpass arms (post-execute prepended, pre-step default order)".
        - assert.ok(Object.keys(Run1.Listeners).length === 4 && the
          loader/volatile-update, tools/post-execute and agent/pre-step
          entries all present)
- Group: Run 1 - the State wiring (the shared shape of the factory plus the own fields of the MAP flavor, with the volatile cells unwrapped).
    - Check: "state carries the REAL factory instance".
        - assert.ok(Run1.State && Run1.State.Factory === Furnace)
    - Check: "volatile unwrap: logFile cell unwrapped to State.Ledger".
        - assert.ok(Run1.State.Ledger === "/tmp/quotes-smoke-ledger.log")
    - Check: "volatile unwrap: log cell unwrapped to State.Enabled=true".
        - assert.ok(Run1.State.Enabled === true)
    - Check: "MAP flavor: state carries no Replacement field".
        - assert.ok(!("Replacement" in Run1.State))
    - Check: "plain fields: Reasoning=true, ToolArgs=false".
        - assert.ok(Run1.State.Reasoning === true && Run1.State.ToolArgs === false)
    - Check: "state module = hook-dsh-normalize-quotes (the ledger prefix)".
        - assert.ok(Run1.State.Module === "hook-dsh-normalize-quotes")
- Group: Run 1 - the activation line (the module's own string, byte-exact).
    - Check: "activation ledger line byte-exact".
        - assert.ok(Run1.Lines.includes(the activation string below))

## Fixtures

The shared harness (`../Harness.js`) supplies the REAL factory instance (`Furnace`, constructed exactly the way the factory's own smoke does), the fake ctx (the on/get/logger capture seams), the REAL `apply` from the built `Target/Library.js`, the `Validate` helper (the schema call), and the ledger path `/tmp/quotes-smoke-ledger.log`, which is removed at the folder's start.

The config is `Validate({ logFile: Ledger })`, with every other field at schema defaults.

No temp files exist beyond the ledger log.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-quotes: activated (reasoning=on, toolArgs=off, logFile=/tmp/quotes-smoke-ledger.log)`

The logger line is captured in the Lines of the fake ctx, and the factory's Append also appends the same string to the ledger file.

No other strings are asserted in this folder.

## Edge cases

- The MAP-flavor negatives: no `replacement` in the schema and no `Replacement` in the State, both asserted as absences.
- The listener-count guard is exact: four listeners, not more, so a fifth registration would fail the count check.
- The volatile cells are asserted before apply (the `{ get }` shape of the schema) AND after (the unwrapped State fields), so both halves of the cell unwrap are pinned.

## Expected count

14 PASS.
