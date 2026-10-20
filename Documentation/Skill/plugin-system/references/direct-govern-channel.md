# The Direct Path Is the ONLY Governance Channel

> Source: SKILL.md, Section 3 (The family architecture), rule 4.
> This file carries the full philosophy; SKILL.md only points here.

## The Rule

The direct path is the raw-write's ONLY governance channel. Its
mechanics, precisely:

1. The actor carries the `govern` marker.
2. The gate's `govern` reason skips the marked events.
3. Absent or false marker = the escape hatch (no chain).

There is no second channel, no fallback, no side door for governance.

## Why: The Full Philosophy

1. **One channel means one behavior to reason about.** Every governed
   write in the family goes through the same triple: actor marker ->
   gate reason -> marked events skipped. Any reader can trace a
   governance decision through one mechanism. A second channel would
   create writes whose governance provenance is ambiguous - which
   gate ruled, which marker applied - and ambiguous provenance is
   undebuggable.
2. **The marker travels on the actor by design.** The actor is the
   write's provenance; attaching the `govern` marker there means the
   decision to govern is made by whoever issues the write, not
   inferred by the gate. Inference would make governance depend on
   call-site accidents; the marker makes it an explicit,
   inspectable decision.
3. **The gate skips marked events - it does not block them.** Marked
   events are governance's own emissions (the fold's steps writing
   their outcomes); blocking them would deadlock the fold. Skipping
   means: the gate's normal `govern`-reason ruling does not re-govern
   governance.
4. **The escape hatch is honest, not hidden.** Absent/false marker =
   no chain, and that is DOCUMENTED here as the intended semantics -
   used for the raw mechanical writes that must not trigger the fold.
   An undocumented second channel would be the same thing without the
   review surface.

## Examples

### Good

```
// a governed write - the actor carries the marker:
rawWrite(ctx, path, content, {
	actor: { name: 'hook-dsh-canonicalize', govern: true },
})
	// gate sees the `govern` reason, skips the marked events,
	// the fold runs the registered steps
```

```
// a mechanical write - escape hatch, no chain:
rawWrite(ctx, cachePath, blob)   // no govern marker -> no fold
```

### Bad

```
// a second channel invented for "convenience":
rawWrite(..., { govern: true, bypass: 'quick' })   // not a thing
// or:
gate.on('govern', ev => ev.rewrite(...))           // side door
```

## Exceptions

- The escape hatch itself (absent/false marker) is the documented
  exception to "every write is governed" - and it is named here so it
  stays a choice, not an accident. Any other bypass attempt is a
  violation, not an exception.

## Failure Modes

- **Marker omission by accident:** a write intended to be governed
  ships without the marker. Cost: the write succeeds ungoverned -
  no error, just skipped governance; the ledger's govern-marked
  absence is the trace.
- **Marker cargo-culting:** adding `govern: true` to mechanical
  writes "for consistency". Cost: recursive governance - the fold
  reacts to its own infrastructure.
- **Inventing a parallel channel:** a special-case write path that
  skips the gate "just for this tool". Cost: unattributed mutations
  with no gate, no fold, no version guard - the exact failure family
  the write executor prevents (see
  ./references/factory-owns-machinery.md).

## Arbiters

- The gate: it is the runtime arbiter of the channel - marked events
  are skipped under the `govern` reason, everything else is gated
  normally.
- The ledger: governed writes appear as govern-marked events in the
  byte-identical strings (see
  ./references/ledger-strings-byte-identical.md).
- The smokes: the fold-through-channel behavior is asserted against
  the real factory (see ./references/smoke-arbiter.md).
- Review: any diff introducing a write path that bypasses raw-write
  is rejected by default.
