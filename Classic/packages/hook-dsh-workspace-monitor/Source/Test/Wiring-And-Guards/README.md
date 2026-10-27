# Wiring-And-Guards - the loader contract, wiring, and guard chain tests

This folder covers the monitor's loader contract, the root-identity wiring, the cold-mount idle-forever posture, the fail-loud validation, the watch recorder's guard chain and record shape, the malformed-event containment, and the purity invariants.

## Scenarios

- G1: the default object carries exactly name/apply/Config/inject, the name agrees with the package identity, and inject is `["pluginFactory"]`.
- G2: an enabled mount returns NOTHING from apply, exposes `ctx.__hookDshWorkspaceMonitorState`, registers `fs/observed` on the ROOT only (the ctx keeps only the factory's `loader/volatile-update`), and the activation line is byte-exact: `monitor: activated (domain=workspace_monitor, checksets=4)` (logger and durable file).
- G3: a disabled mount wires NOTHING and logs the honest `monitor: disabled (enabled=false)` line.
- G4: the fail-loud validation throws at apply with module-prefixed errors for an empty domain, a zero maxWatch, and a non-array include.
- G5: the guard chain runs in order: an excluded path segment is ignored with the byte-exact `monitor: ignored <path> (excluded)` line (logger and durable file), the exclusion match is the factory's LITERAL segment match (a list entry matches a path segment by name, so the fixtures use plain segment names), an own-actor event is ignored with `monitor: ignored <path> (own actor)`, and a non-matching path under a non-empty include is ignored with `monitor: ignored <path> (not included)` while a matching path records normally.
- G6: the watch record shape records a present observation's version verbatim with the check-set list (`monitor: watch <path> version 1 (tsc,format)`), a repeated same-version event does not bump `versions` while a version change does, an absent observation records `version absent` (never fabricated), and the shipped catalog classifies cargo and governance.
- G7: a malformed event never throws; it is ledgered byte-exactly as `monitor: failed unknown (malformed event: displayPath is not a string)`, and the listener keeps working after it.
- G8: the purity invariants hold: zero writeText/readText/resolve calls across watch and malformed events, because the monitor never touches file content.

## Fixtures

The fixtures use the shared Harness (fake ctx + the REAL built factory + the REAL built plugin apply).

## Expected ledger strings (byte-exact, `monitor: ` prefix)

`activated (domain=workspace_monitor, checksets=4)`, `disabled (enabled=false)`, `ignored <path> (excluded)`, `ignored <path> (own actor)`, `ignored <path> (not included)`, `watch <path> version <v> (<sets>)`, `failed unknown (malformed event: displayPath is not a string)`.

## Expected count

22 PASS.
