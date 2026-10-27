# Loader-And-Config

This file states what the test verifies.

## Intent

The suite covers the loader contract of the cargo governor and its config schema: the four named
exports with `inject = ["fs", "pluginFactory"]`, the default object carrying all four keys (the
accessor shadow pitfall), and `apply` returning nothing.

It also covers every config default: the SEPARATE `~/.dsh/playform/hook-dsh-cargo-governor.log`
ledger, `updateCooldownMs = 3000`, the four mutation tools, `policyFile = ""`, `strict = false`,
`maxUpdateFailures = 3`, `cargoBin = "cargo"`, `keepFile = ""`, `updateMode = "cargo"`, and the
six-entry exclude list.

The shared volatile cells (`log`, `logFile`, `updateCooldownMs`, `mutationTools`) sit against the
plain module fields, and the overrides validation covers the patch-row values.

The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs` sections 1-2.

## Scenario

- Group: the loader contract.
    - Sub: "loader: name/apply/Config/inject named exports, inject = [fs,
      pluginFactory]"
    - Sub: "loader: default object carries name/apply/Config/inject"
    - Sub: "loader: apply returns undefined"
- Group: the config schema.
    - Sub: "config: all defaults (separate ledger, cargoBin, updateMode,
      exclude list)"
    - Sub: "config: shared volatile cells + plain module fields"
    - Sub: "config: overrides validated (patch-row values)"

## Fixtures

One bare MakeContext world serves the apply-returns-nothing scenario, with the real Furnace wired as
`ctx.pluginFactory` and a ledger path under the harness Root, and the Config schema is validated
directly with `{}` and with the four-field override object.

## Expected ledger strings (byte-identical)

None asserted. (The logFile default `~/.dsh/playform/hook-dsh-cargo-governor.log` is
asserted as the schema's separate-ledger default.)

## Edge cases

- The default-object check sorts the keys, so the order-independence guards the accessor shadow
  pitfall.
- The volatile-cell check asserts that `get` IS a function for the four shared cells and IS undefined
  for the seven plain fields, which covers both directions.

## Expected count

6 PASS.
