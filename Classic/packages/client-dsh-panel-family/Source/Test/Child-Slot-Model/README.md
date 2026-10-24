# Child-Slot-Model - the v4.1 child-slot contract

The v4.1 contribution model proven against the real built client apply: the
panel owns the render sites and declares its CHILD SLOTS in each
registration's `children` table; an adapter's client half injects the slot its
manifest declares and registers one section there; the registry is slot-aware
and enforces one adapter per bundle per slot.

## Scenarios

- S1: the family tab registration (`conversation.view`, id `playform-family`)
  declares `playform.panel.section` as a `list`/`session` child slot.
- S2: the overlay panel registration (`shell.overlay`, id
  `playform-family-overlay`) declares `playform.panel.overlay` as a
  `list`/`root` child slot - the second panel.
- S3: the thirteen shipped adapters inject exactly `playform.panel.section`;
  nothing injects the overlay slot.
- S4: each adapter registers one child with its exact identity: the normalize
  adapter (order 10), the tool-coach adapter (order 30), the suggester
  adapter (order 40), the five remaining normalize flavors (orders 11-15),
  plugin-dsh-normalize-file (order 20), the three governors (orders 50/55/60),
  and hook-dsh-ccr (order 70), all in the `client-dsh-panel-family` locale
  namespace.
- S5: each registration's `inject` face carries the adapter manifest
  (`bundle`, `namespace`, `slot`) and the panel ports (the registry instance
  the client apply provided).
- S6: one adapter per bundle per slot - a second adapter id claiming an
  occupied `(slot, bundle)` is refused with the byte-exact line
  `client-dsh-panel-family: duplicate adapter refused for <bundle> in <slot>`;
  the version does not move and the first adapter stays.
- S7: unregistering the adapter releases its slot ownership, so a different
  adapter id may then claim the same `(slot, bundle)`.
- S8: a legacy registration that omits `slot` maps its `mount` onto the slot
  (`overlay` -> `playform.panel.overlay`) and `entries(slot)` filters by slot.
- S9: the tab component carries the registry and the renderer's `renderSlot`
  prop (the declared child slot is rendered through it).
- S10: the overlay component renders its declared child slot through
  `renderSlot` with the exact slot name and an empty owner-props object.

## Fixtures

The shared Harness: the alias hooks resolve the built `@Function/*` /
`@Variable/*` imports onto the real Target, and the fake client ctx captures
`locale.register` / `slots.inject` (every factory per slot) / `slots.register`
/ `effect` / `reflect.provide` / `get` / the logger. No fs seam and no clock.

## Expected strings (byte-exact)

`playform.panel.section`, `playform.panel.overlay`, `conversation.view`,
`shell.overlay`, `playform-family`, `playform-family-overlay`,
`client-dsh-panel-family`,
`client-dsh-panel-family: duplicate adapter refused for @playform/hook-dsh-normalize-quotes in playform.panel.section`.

## Expected count

10 PASS.
