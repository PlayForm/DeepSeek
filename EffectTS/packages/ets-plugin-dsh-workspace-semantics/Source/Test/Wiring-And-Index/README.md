# Wiring-And-Index - the wiring and the index maintainer

The folder covers the loader contract (apply returns nothing, the default object carries name/apply/Config/inject), the IDLE-forever cold mount, and the root-context registration with the distinct root identity.

It also covers the service registered from apply, the adapter registry, the activation proof, the invalidation on fs/observed (the monotonic revision, no wall clock), the guard chain, the malformed-event containment, and the fail-loud validation.

## Scenarios

- **W1.**

    The default object carries name/apply/Config/inject, and apply returns nothing.

    The service is provided on a cold mount, a disabled mount wires nothing, the cold-mount lines are byte-exact, and a disabled service answers honestly with nothing.

- **W2.**

    fs/observed is registered on the ROOT context only, the root identity is distinct, the activation lines are byte-exact, and the storage effect is armed.

- **W3.**

    The revision advances monotonically (`indexed <path> version <v> (revision <r>)`), and an absent observation invalidates as version absent.

- **W4.**

    An excluded segment, the own actor, and a malformed event each give their byte-exact line, and the listener path touches zero file content.

- **W5.**

    maxEntries, domain, and exclude fail loud at load.

- **W6.**

    In the repeat-event guard (Function/Duplicate) a repeat event for the same path that carries the same version within the coalescing window is dropped silently (one revision advance, one `indexed` line).

    A different version is processed normally, and the same version after the window (via the `State.Now` clock seam) is processed again.

## Expected ledger strings (byte-exact, `semantics: ` prefix)

`adapters registered (7 extensions)`,
`disabled (enabled=false)`,
`activated (domain=workspace_semantics)`,
`indexed /repo/src/a.ts version 1 (revision 1)`,
`indexed /repo/src/gone.ts version absent (revision 3)`,
`ignored <path> (excluded)`, `ignored <path> (own actor)`,
`failed unknown (malformed event: displayPath is not a string)`.

## Expected count

20 PASS.
