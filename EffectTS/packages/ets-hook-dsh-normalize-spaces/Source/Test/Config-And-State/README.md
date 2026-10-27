# Config-And-State

What this test verifies.

## Intent

This folder covers the Run-1 defaults of the spaces flavor: what a plain `apply(ctx, config)` does before any stream flows.

The validated config arrives with its volatile fields as `{ get }` cells, including `replacement`, the only knob of the CLASS flavor.

The schema defaults carry `normalizeReasoning=true` and `normalizeToolArguments=false`.

The apply registers exactly four listeners (the llm/stream hook, the P10 loader/volatile-update refresh of the factory, and the two overpass arms) and builds a State through the REAL factory.

The volatile cells unwrap into `State.Ledger`/`State.Enabled`/`State.Replacement` (the default replacement is the plain ASCII space), and the plain fields and the module identity follow.

The activation line is the module's own string and is asserted byte-exact, where the space-valued replacement prints as `replacement= ` with a space after the equals sign.

The assertions are moved verbatim from `EffectTS/smokes/spaces-smoke.mjs` section "Run 1: defaults" (the source suite stays in place during the migration, and this folder is the future home of the same contract).

## Scenario

- Group: Run 1 - the validated config (the volatile cells and the schema defaults, exactly as the loader hands them to apply).
    - Check: "volatile cell: log arrives as { get }".
        - assert.ok(Raw1.log && typeof Raw1.log.get === "function")
    - Check: "volatile cell: logFile arrives as { get }".
        - assert.ok(typeof Raw1.logFile.get === "function")
    - Check: "volatile cell: replacement arrives as { get }".
        - assert.ok(typeof Raw1.replacement.get === "function")
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
- Group: Run 1 - the State wiring (the shared shape of the factory plus the own fields of the spaces flavor, with the volatile cells unwrapped).
    - Check: "state carries the REAL factory instance".
        - assert.ok(Run1.State && Run1.State.Factory === Furnace)
    - Check: "volatile unwrap: logFile cell unwrapped to State.Ledger".
        - assert.ok(Run1.State.Ledger === "/tmp/spaces-smoke-ledger.log")
    - Check: "volatile unwrap: log cell unwrapped to State.Enabled=true".
        - assert.ok(Run1.State.Enabled === true)
    - Check: "volatile unwrap: replacement cell unwrapped to State.Replacement=' '".
        - assert.ok(Run1.State.Replacement === " ")
    - Check: "plain fields: Reasoning=true, ToolArgs=false".
        - assert.ok(Run1.State.Reasoning === true && Run1.State.ToolArgs === false)
    - Check: "state module = hook-dsh-normalize-spaces (the ledger prefix)".
        - assert.ok(Run1.State.Module === "hook-dsh-normalize-spaces")
- Group: Run 1 - the activation line (the module's own string, byte-exact).
    - Check: "activation ledger line byte-exact".
        - assert.ok(Run1.Lines.includes(the activation string below))

## Fixtures

The shared harness (`../Harness.js`) supplies the REAL factory instance (`Furnace`, constructed exactly the way the factory's own smoke does), the fake ctx (the on/get/logger capture seams), the REAL `apply` from the built `Target/Library.js`, the `Validate` helper (the schema call), and the ledger path `/tmp/spaces-smoke-ledger.log`, which is removed at the folder's start.

The config is `Validate({ logFile: Ledger })`, with every other field at schema defaults.

No temp files exist beyond the ledger log.

## Expected ledger strings (byte-exact)

- `hook-dsh-normalize-spaces: activated (replacement= , reasoning=on, toolArgs=off, logFile=/tmp/spaces-smoke-ledger.log)`

The logger line is captured in the Lines of the fake ctx, and the factory's Append also appends the same string to the ledger file.

No other strings are asserted in this folder.

## Edge cases

- The replacement cell is asserted both as a `{ get }` cell before apply and as the unwrapped `State.Replacement` (the ASCII space) after, so both halves of the cell unwrap are pinned and match the knob of the CLASS flavor.
- The listener-count guard is exact: four listeners, not more, so a fifth registration would fail the count check.
- The `replacement= ` segment of the activation line carries the space VALUE itself, so the line contains a space where other flavors print a character-set name, and the byte-exact assertion pins that spacing.

## Expected count

14 PASS.
