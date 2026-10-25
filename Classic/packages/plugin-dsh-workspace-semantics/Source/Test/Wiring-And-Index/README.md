# Wiring-And-Index - the wiring and the index maintainer

The loader contract (apply returns nothing, the default object carries
name/apply/Config/inject), the IDLE-forever cold mount, the root-context
registration with the distinct root identity, the service registered from
apply, the adapter registry, the activation proof, the invalidation on
fs/observed (the monotonic revision, no wall clock), the guard chain, the
malformed-event containment, and the fail-loud validation.

## Scenarios

- W1: the default object carries name/apply/Config/inject; apply returns
  nothing; the service is provided on a cold mount; a disabled mount wires
  nothing; the cold-mount lines are byte-exact; a disabled service answers
  honestly with nothing.
- W2: fs/observed is registered on the ROOT context only; the root identity
  is distinct; the activation lines are byte-exact; the storage effect is
  armed.
- W3: the revision advances monotonically (`indexed <path> version <v>
  (revision <r>)`); an absent observation invalidates as version absent.
- W4: an excluded segment, the own actor, and a malformed event - each with
  its byte-exact line; the listener path touches zero file content.
- W5: maxEntries, domain, and exclude fail loud at load.
- W6: the repeat-event guard (Function/Duplicate) - a repeat event for the
  same path carrying the same version within the coalescing window is
  dropped silently (one revision advance, one `indexed` line); a different
  version is processed normally; the same version after the window (via the
  `State.Now` clock seam) is processed again.

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
