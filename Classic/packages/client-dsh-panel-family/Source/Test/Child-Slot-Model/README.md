# Child-Slot-Model - the v4.1 child-slot contract

The suite proves the v4.1 contribution model against the real built client apply.

The panel owns the render sites and declares its CHILD SLOTS in the `children` table of
each registration, an adapter's client half injects the slot its manifest declares and
registers one section there, and the registry is slot-aware and enforces one adapter per
bundle per slot.

## Scenarios

- S1: the family tab registration (`conversation.view`, id `playform-family`)
  declares `playform.panel.section` as a `list`/`session` child slot.
- S2: the overlay panel registration (`shell.overlay`, id
  `playform-family-overlay`) declares `playform.panel.overlay` as a `list`/`root`
  child slot, which is the second panel.
- S3: the thirteen shipped adapters inject exactly `playform.panel.section`, and
  nothing injects the overlay slot.
- S4: each adapter registers one child with its exact identity: the normalize
  adapter (order 10), the tool-coach adapter (order 30), the suggester adapter
  (order 40), the five remaining normalize flavors (orders 11-15),
  plugin-dsh-normalize-file (order 20), the three governors (orders 50/55/60),
  and hook-dsh-ccr (order 70), all in the `client-dsh-panel-family` locale
  namespace.
- S5: the `inject` face of each registration carries the adapter manifest
  (`bundle`, `namespace`, `slot`) and the panel ports, which is the registry
  instance that the client apply provided.
- S6: one adapter per bundle per slot runs, so a second adapter id that claims an
  occupied `(slot, bundle)` is refused with the byte-exact line
  `client-dsh-panel-family: duplicate adapter refused for <bundle> in <slot>`,
  the version does not move, and the first adapter stays.
- S7: unregistering the adapter releases its slot ownership, so a different
  adapter id may then claim the same `(slot, bundle)`.
- S8: a legacy registration that omits `slot` maps its `mount` onto the slot
  (`overlay` -> `playform.panel.overlay`), and `entries(slot)` filters by slot.
- S9: the tab component carries the registry and the `renderSlot` prop of the
  renderer, and the declared child slot is rendered through it.
- S10: the overlay component renders its declared child slot through
  `renderSlot` with the exact slot name and an empty owner-props object.

## Fixtures

The shared Harness resolves the built `@Function/*` and `@Variable/*` imports onto the
real Target through the alias hooks, and the fake client ctx captures
`locale.register`, `slots.inject` (every factory per slot), `slots.register`, `effect`,
`reflect.provide`, `get`, and the logger.

No fs seam and no clock run.

## Expected strings (byte-exact)

`playform.panel.section`, `playform.panel.overlay`, `conversation.view`,
`shell.overlay`, `playform-family`, `playform-family-overlay`,
`client-dsh-panel-family`,
`client-dsh-panel-family: duplicate adapter refused for @playform/hook-dsh-normalize-quotes in playform.panel.section`.

## Expected count

10 PASS.
