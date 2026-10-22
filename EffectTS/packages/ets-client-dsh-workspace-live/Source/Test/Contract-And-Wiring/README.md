# Contract-And-Wiring - the client entry's apply/inject contract

The loader row contract, the Config schema (defaults and the fail-loud
validation), and the client half's apply-time wiring against the real built
`Target/Client.js` and the fake client context.

## Scenarios

- W1: the loader row carries `name`/`apply`/`Config`/`inject`; the host
  `apply()` returns nothing; the default export is the exact four-key
  object.
- W2: the Config schema fills the exact defaults (`enabled` false, the
  family's idle posture, `tabOrder` 25, `maxEvents` 50,
  `maxRepresentations` 100).
- W3/W4: `maxEvents` and `maxRepresentations` outside their bounds fail
  loud at load (min/max enforced by the schema).
- W5: the client entry's `inject` is exactly `["slots", "locale"]` (the
  host half's is `[]`).
- W6: the `workspaceLive` service is provided through `ctx.provide` and
  carries `getSnapshot`/`subscribe`/`ingest`/`refresh`.
- W7: the effect labels are byte-exact and in order: `live: dictionaries`,
  `live: workspace tab`.
- W8: the locale registration is captured once with the byte-exact
  namespace `client-dsh-workspace-live` and both dictionaries (en and
  zh), byte-identical to `Variable/Locale-*.json`.
- W9: the tab registers with the exact options (`id` "workspace-live",
  `order` 25, the namespace, `label()` = "Workspace").
- W10: the tab component is the LiveTab element bound to a store
  (`getSnapshot`/`subscribe` present).
- W11: `conversation.view` is the only injected slot point.
- W12: the purity probe on the REAL built code - no `node:` import, no
  `require(`, no timer in the client or the store: the stable-until-event
  contract has no polling machinery.

## Fixtures

The shared Harness: the alias hooks resolve the built `@Function/*` /
`@Variable/*` imports onto the real Target (and the real JSON
dictionaries), the fake client ctx captures locale.register / slots.inject
/ slots.register / effect / provide. No fs seam and no clock: the client
half has neither; purity and the no-timer invariant are asserted on the
built code itself.

## Expected strings (byte-exact)

`client-dsh-workspace-live`, `live: dictionaries`, `live: workspace tab`,
`Workspace`, `No workspace representations are presented yet.`.

## Expected count

12 PASS.
