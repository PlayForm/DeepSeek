# Registry-And-Sections - the registry body of playformFamilyPanel

The suite exercises the slot-aware registry service through the instance that the real
built client apply actually provided.

It covers the section bookkeeping, the deterministic render order, the subscription
discipline, and the open/launch wiring.

The Child-Slot-Model folder covers the slot-ownership rules (one adapter per bundle per
slot) and the slot filter.

## Scenarios

- R1: `register` adds a section, and `entries()` snapshots it.
- R2: re-registering the same id replaces in place with no duplicate and no
  growth, so an HMR reload rebinds the closure without duplicating it.
- R3: `entries()` orders by `(order, id)`, which gives a(10), z(10), b(20).
- R4: every mutation bumps the version by exactly one and notifies each
  subscriber exactly once, and the unlisten stops the notifications.
- R5: `open()` delegates to the implementation attached through `AttachOpen`
  with the exact target object and never notifies, because opening a view is
  not a registry mutation.
- R6: the disposer that `register` returns unregisters the section.
- R7: unregistering an unknown id is a no-op, with no version bump and no
  notification.

## Fixtures

The shared Harness supplies the real built Target and the fake client ctx.

The registry under test is the instance captured at apply time through
`ctx.reflect.provide("playformFamilyPanel", ...)` and not a freshly constructed one, so
the suite proves the wired service rather than the fixture.

Each fixture section carries its `namespace`, which is the settings namespace the form
reads, and a legacy `mount`, from which the slot is derived.

## Known blind spot

The overlay-view cascade on unregister, which drops the `Opened` views whose owning
section is gone, is internal state with no observable surface, so the suite does not
assert the cascade behavior.

Everything else on the contract is asserted.

## Expected count

7 PASS.
