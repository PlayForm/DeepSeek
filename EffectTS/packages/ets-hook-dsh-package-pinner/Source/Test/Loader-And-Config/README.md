# Loader-And-Config

What this test verifies.

## Intent

The pinner's loader contract and its factory-built Config schema are the two
surfaces every other folder depends on silently: the module must export
`name`/`apply`/`Config`/`inject` (the full default object included, with
`default.apply` being the very same apply function), the schema must be a real
callable with the schemastery dictionary, and it must validate to the
historical defaults - the volatile cells (`log`, `logFile`,
`mutationTools`, the factory's shared `updateCooldownMs`) plus the plain fields
(`policyFile`, `sections`, `exclude`). A drift here breaks every later folder,
so it is its own folder. The assertions are moved verbatim from
`Classic/smokes/pinner-smoke.mjs` sections 1-2.

## Scenario

- Group: the loader contract.
    - Sub: "loader contract: name/apply/Config/inject + the full default
      object"
- Group: the Config schema (factory-built, real validation).
    - Sub: "Config schema: all six shared/own fields validated with the
      historical defaults"

## Fixtures

None beyond `Pinner.Config({})` - the schema validates itself. No fake ctx, no
factory, no apply, no I/O.

## Expected ledger strings (byte-identical)

None asserted. (The logFile default `~/.dsh/playform/ets-hook-dsh-package-pinner.log` is
asserted as a config VALUE - it is the module's identity string and may only
change with the module's identity.)

## Edge cases

- `default.apply` must be the identical function object as the named `apply`
  export (the accessor-shadow pitfall the factory family guards against).
- The volatile cells are exercised with `.get()`; the plain fields must NOT be
  cells.

## Expected count

2 PASS.
