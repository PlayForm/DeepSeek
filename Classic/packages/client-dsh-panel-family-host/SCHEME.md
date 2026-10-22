# SCHEME - @playform/client-dsh-panel-family-host

The package's contract scheme (Documentation/Plans/UI-Family/
PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md).

## 1. Identity

| Place          | Value                                   |
| -------------- | --------------------------------------- |
| package name   | `@playform/client-dsh-panel-family-host`|
| `name` export  | `client-dsh-panel-family-host`          |
| service name   | `panelFamilyHost`                       |
| ledger line    | `host: activated (enabled=<enabled>)`   |

## 2. The loader contract

Object form: `name`, `apply`, `Config` (the Schemastery schema), `inject`
(`[]`). The default object carries all four.

## 3. The service surface (`panelFamilyHost`)

- `tail(namespace, lines)` - validated namespace (`[a-z0-9-]+`, rejected
  not sanitized), lines capped at `maxLines`, read of
  `<logRoot>/<namespace>.log`. Read-only.
- `stats()` - the ccr log summary (path, bytes, lines). Read-only.
- `fiberPhases` - NOT here (existing `remote.pluginManager`).

## 4. Least privilege

The endpoint reads `~/.dsh` family logs ONLY. No write surface, no config
mutation, no code execution. A disabled package answers every method with
a `rejected` failure instead of silently passing.

## 5. The gap (end-phase)

Typert (`TypertRemoteService` + `@Remote` + descriptors + `RemoteError`
codes) is not reproducible from an external package per the documented
caveat; the PoC ships the plain service. The end-phase decision: reproduce
the generation pipeline, or keep the v1 shortcut (expose only existing
remote namespaces; ledgers via this service).
