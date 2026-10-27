# Contract-And-Wiring - the apply/inject contract of the client entry

The suite covers the loader row contract, the Config schema with its defaults and its
fail-loud validation, and the apply-time wiring of the client half against the real
built `Target/Client.js` and the fake client context.

## Scenarios

- C1: the loader row carries `name`/`apply`/`Config`/`inject`, the host
  `apply()` returns nothing, and the default export is the exact four-key
  object.
- C2/C3: the Config schema fills the exact defaults (`enabled` true,
  `tabOrder` 20, `overlayMaxWidth` 720, `locale` "en"), and an invalid `locale`
  fails loud at load.
- C4: the `inject` of the client entry is exactly `["slots", "locale"]`, and
  the host half carries `[]`.
- C5: the `playformFamilyPanel` registry service is provided through
  `ctx.reflect.provide` and carries the six contract methods.
- C6: the effect labels are byte-exact and in order: `panel: dictionaries`,
  `panel: trace source`, `panel: family tab`, `panel: overlay mount`, and the
  thirteen adapter labels `panel: adapter <id>`, with the three references
  first and then the ten that copied their pattern.
- C7: the locale registration is captured once with the byte-exact namespace
  `client-dsh-panel-family` and both dictionaries (en and zh), byte-identical
  to `Variable/Locale-*.json`, which holds the strings of the panel plus the
  adapter titles, status labels, and form markers.
- C8: the two mounts and the declared child slot are injected on exactly
  `conversation.view`, `shell.overlay`, and `playform.panel.section`.
- C9/C10: the family tab registers with the exact options (`id`
  "playform-family", `order` 20, the namespace, `label()` = "Family", and the
  `playform.panel.section` child-slot declaration), and its component is the
  FamilyTab element bound to the provided registry.
- C11/C12: the overlay mount registers with the exact options (`id`
  "playform-family-overlay", `label()` = "Family panel", and the
  `playform.panel.overlay` child-slot declaration), and its component is the
  `playform-family-overlay` container with `maxWidth` 720.
- C13: the purity probe on the REAL built code finds no `node:` import, no
  `require(`, and no fs call, because the client half is a pure browser module.

## Fixtures

The shared Harness resolves the built `@Function/*` and `@Variable/*` imports onto the
real Target and the real JSON dictionaries through the alias hooks, and the fake client
ctx captures locale.register, slots.inject (every factory per slot), slots.register,
effect, reflect.provide, get, and the logger.

No fs seam and no clock run, because the client half has neither, and purity is asserted
on the built code itself.

## Expected strings (byte-exact)

`client-dsh-panel-family`, `panel: dictionaries`, `panel: trace source`,
`panel: family tab`, `panel: overlay mount`, `panel: adapter <id>`, `Family`,
`Family panel`, `No family sections are registered yet.`,
`playform.panel.section`, `playform.panel.overlay`.

## Expected count

13 PASS.
