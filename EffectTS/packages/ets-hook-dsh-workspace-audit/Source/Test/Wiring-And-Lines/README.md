# Wiring-And-Lines - the wiring and the recorder

The loader contract (apply returns nothing, the default object carries
name/apply/Config/inject), the IDLE-forever cold mount, the root-context
registration with the distinct root identity, the service registered from
apply, the activation proof, the OutcomeEvidence recording (the monotonic
sequence, the parent pointer, success vs failure), the guard chain, the
malformed-event containment, and the fail-loud validation.

## Scenarios

- W1: the default object carries name/apply/Config/inject; apply returns
  nothing; the service is provided on a cold mount; a disabled mount wires
  nothing; the disabled line is byte-exact; the cold-mount service reads
  honestly from the empty state.
- W2: fs/observed is registered on the ROOT context only; the root identity
  is distinct; the activation line is byte-exact; the storage effect is
  armed.
- W3: two events record sequences 1 and 2 with the exact ids
  (`a1`/`a2`) - no wall clock; the success/failure outcome split; the
  recorded line is byte-exact (logger and durable); the parent pointer
  carries the actor's tag.
- W4: an excluded segment, the own actor, and a malformed event - each with
  its byte-exact line; the listener path touches zero file content.
- W5: maxLines, domain, and exclude fail loud at load.
- W6: the repeat-event guard (Function/Duplicate) - a repeat event for the
  same path carrying the same version within the coalescing window is
  dropped silently (one line, the sequence does not move, the ring holds one
  entry); a different version is processed normally; the same version after
  the window (via the `State.Now` clock seam) is processed again. The
  service's manual lines are never guarded.

## Expected ledger strings (byte-exact, `audit: ` prefix)

`disabled (enabled=false)`,
`activated (domain=workspace_audit, maxLines=2000)`,
`audit outcome-evidence /repo/src/a.ts (success) /repo/src/a.ts`,
`audit outcome-evidence /repo/src/b.ts (failure) /repo/src/b.ts`,
`ignored <path> (excluded)`, `ignored <path> (own actor)`,
`failed unknown (malformed event: displayPath is not a string)`.

## Expected count

22 PASS.
