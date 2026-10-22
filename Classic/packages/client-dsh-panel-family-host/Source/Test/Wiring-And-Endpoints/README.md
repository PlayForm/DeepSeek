# Wiring-And-Endpoints - the wiring tests

The loader contract, the service provision, the activation lines, the
disabled gate, and the fail-loud schema.

## Scenarios

- L1: the loader contract - the default object carries name
  `client-dsh-panel-family-host`, apply, Config, inject `[]`; apply returns
  NOTHING and the `panelFamilyHost` service is provided through
  `ctx.provide` with the tail and stats functions.
- W1: the disabled posture - the byte-exact
  `host: activated (enabled=false)` line, and BOTH endpoints answer with
  the byte-exact refusal payload
  (`{ok:false, code:"rejected", message:"the panel-family host is disabled
  (enabled=false)"}`) - a disabled endpoint answers, it never reads.
- W2: the enabled posture - the byte-exact
  `host: activated (enabled=true)` line.
- X1: the fail-loud schema - `maxLines` 0 and `maxLines` 2001 both throw at
  load (the schema's min/max).
- W3: nothing is logged on apply beyond the single activation line.

## Fixtures

The shared Harness (the fake ctx with the provide capture; no factory - the
host injects nothing).

## Expected ledger strings (byte-exact)

`host: activated (enabled=<enabled>)`.

## Expected count

8 PASS.
