# Loader-And-Config

What this test verifies.

## Intent

The cargo governor's loader contract and config schema: the four named
exports with `inject = ["fs", "pluginFactory"]`; the default object carrying
all four keys (the accessor shadow pitfall); `apply` returning nothing; every
config default (the SEPARATE `~/.dsh/ets-hook-dsh-cargo-governor.log` ledger,
`updateCooldownMs = 3000`, the four mutation tools, `policyFile = ""`,
`strict = false`, `maxUpdateFailures = 3`, `cargoBin = "cargo"`,
`keepFile = ""`, `updateMode = "cargo"`, the six-entry exclude list); the
shared volatile cells (`log`, `logFile`, `updateCooldownMs`, `mutationTools`)
vs the plain module fields; and the overrides validation (patch-row values).
The assertions are moved verbatim from `Classic/smokes/cargo-smoke.mjs`
sections 1-2.

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

One bare MakeContext world for the apply-returns-nothing scenario (the real
Furnace wired as `ctx.pluginFactory`, a ledger path under the harness Root);
the Config schema validated directly with `{}` and with the four-field
override object.

## Expected ledger strings (byte-identical)

None asserted. (The logFile default `~/.dsh/ets-hook-dsh-cargo-governor.log` is
asserted as the schema's separate-ledger default.)

## Edge cases

- The default-object check sorts the keys - the order-independence guards
  the accessor shadow pitfall.
- The volatile-cell check asserts `get` IS a function for the four shared
  cells and IS undefined for the seven plain fields - both directions.

## Expected count

6 PASS.
