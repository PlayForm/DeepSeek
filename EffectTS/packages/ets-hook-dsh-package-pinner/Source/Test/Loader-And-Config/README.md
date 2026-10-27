# Loader-And-Config

What this test verifies.

## Intent

The loader contract of the pinner and its factory-built Config schema are the two surfaces that every other folder depends on silently.

The module must export `name`/`apply`/`Config`/`inject`, with the full default object included and `default.apply` being the very same apply function.

The schema must be a real callable with the schemastery dictionary, and it must validate to the historical defaults: the volatile cells (`log`, `logFile`, `mutationTools`, the shared `updateCooldownMs` of the factory) plus the plain fields (`policyFile`, `sections`, `exclude`).

A drift here breaks every later folder, so it is its own folder.

The assertions are moved verbatim from `Classic/smokes/pinner-smoke.mjs` sections 1-2.

## Scenario

- Group: the loader contract.
    - Check: "loader contract: name/apply/Config/inject + the full default object".
- Group: the Config schema (factory-built, real validation).
    - Check: "Config schema: all six shared/own fields validated with the historical defaults".

## Fixtures

No fixtures exist beyond `Pinner.Config({})`, because the schema validates itself.

There is no fake ctx, no factory, no apply, and no I/O.

## Expected ledger strings (byte-identical)

None asserted.

The logFile default `~/.dsh/playform/ets-hook-dsh-package-pinner.log` is asserted as a config VALUE, because it is the identity string of the module and may only change with the identity of the module.

## Edge cases

- `default.apply` must be the identical function object as the named `apply` export, which is the accessor-shadow pitfall the factory family guards against.
- The volatile cells are exercised with `.get()`, while the plain fields must NOT be cells.

## Expected count

2 PASS.
