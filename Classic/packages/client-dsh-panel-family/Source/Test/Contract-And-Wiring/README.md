# Contract-And-Wiring - the client entry's apply/inject contract

The loader row contract, the Config schema (defaults and the fail-loud
validation), and the client half's apply-time wiring against the real built
`Target/Client.js` and the fake client context.

## Scenarios

- C1: the loader row carries `name`/`apply`/`Config`/`inject`; the host
  `apply()` returns nothing; the default export is the exact four-key
  object.
- C2/C3: the Config schema fills the exact defaults (`enabled` true,
  `tabOrder` 20, `overlayMaxWidth` 720, `locale` "en") and an invalid
  `locale` fails loud at load.
- C4: the client entry's `inject` is exactly `["slots", "locale"]` (the
  host half's is `[]`).
- C5: the `playformFamilyPanel` registry service is provided through
  `ctx.reflect.provide` and carries the six contract methods.
- C6: the effect labels are byte-exact and in order: `panel: dictionaries`,
  `panel: family tab`, `panel: overlay mount`.
- C7: the locale registration is captured once with the byte-exact
  namespace `client-dsh-panel-family` and both dictionaries (en and zh),
  byte-identical to `Variable/Locale-*.json`.
- C8: the two slot points are injected on exactly `conversation.view` and
  `shell.overlay`.
- C9/C10: the family tab registers with the exact options (`id`
  "playform-family", `order` 20, the namespace, `label()` = "Family") and
  its component is the FamilyTab element bound to the provided registry.
- C11/C12: the overlay mount registers with the exact options (`id`
  "playform-family-overlay", `label()` = "Family panel") and its component
  is the `playform-family-overlay` container with `maxWidth` 720.
- C13: the purity probe on the REAL built code - no `node:` import, no
  `require(`, no fs call: the client half is a pure browser module.

## Fixtures

The shared Harness: the alias hooks resolve the built `@Function/*` /
`@Variable/*` imports onto the real Target (and the real JSON
dictionaries), the fake client ctx captures locale.register / slots.inject
/ slots.register / effect / reflect.provide. No fs seam and no clock: the
client half has neither; purity is asserted on the built code itself.

## Expected strings (byte-exact)

`client-dsh-panel-family`, `panel: dictionaries`, `panel: family tab`,
`panel: overlay mount`, `Family`, `Family panel`,
`No family sections are registered yet.`.

## Expected count

13 PASS.
