# Registry-And-Sections - the playformFamilyPanel registry body

The slot-aware registry service, exercised through the instance the real built
client apply actually provided: the section bookkeeping, the deterministic
render order, the subscription discipline, and the open/launch wiring. The
slot-ownership rules (one adapter per bundle per slot) and the slot filter are
covered by the Child-Slot-Model folder.

## Scenarios

- R1: `register` adds a section and `entries()` snapshots it.
- R2: re-registering the same id replaces in place (no duplicate, no
  growth) - an HMR reload rebinds the closure without duplicating it.
- R3: `entries()` orders by `(order, id)`: a(10), z(10), b(20).
- R4: every mutation bumps the version by exactly one and notifies each
  subscriber exactly once; the unlisten stops the notifications.
- R5: `open()` delegates to the implementation attached through
  `AttachOpen` with the exact target object, and never notifies (opening a
  view is not a registry mutation).
- R6: the disposer `register` returns unregisters the section.
- R7: unregistering an unknown id is a no-op: no version bump, no
  notification.

## Fixtures

The shared Harness (real built Target, fake client ctx). The registry used
is the instance `ctx.reflect.provide("playformFamilyPanel", ...)` captured
at apply time - not a freshly constructed one - so the suite proves the
wired service, not the fixture. Each fixture section carries its `namespace`
(the settings namespace the form reads) and a legacy `mount` (the slot is
derived from it).

## Known blind spot

The overlay-view cascade on unregister (dropping the `Opened` views whose
owning section is gone) is internal state with no observable surface; the
cascade behavior is not asserted. Everything else on the contract is.

## Expected count

7 PASS.
