# Contract-And-Wiring - the apply/inject contract of the client entry

The suite covers the loader row contract, the Config schema with its defaults and its
fail-loud validation, and the apply-time wiring of the client half against the real
built `Target/Client.js` and the fake client context.

## Scenarios

- W1: the loader row carries `name`/`apply`/`Config`/`inject`, the host `apply()`
  returns nothing, and the default export is the exact four-key object.
- W2: the Config schema fills the exact defaults (`enabled` false, which is the idle
  posture of the family, `tabOrder` 25, `maxEvents` 50, `maxRepresentations` 100).
- W3/W4: `maxEvents` and `maxRepresentations` outside their bounds fail loud at load,
  with the min/max enforced by the schema.
- W5: the `inject` of the client entry is exactly `["slots", "locale"]`, and the host
  half carries `[]`.
- W6: the `workspaceLive` service is provided through `ctx.provide` and carries
  `getSnapshot`/`subscribe`/`ingest`/`refresh`.
- W7: the effect labels are byte-exact and in order: `live: dictionaries`,
  `live: workspace tab`.
- W8: the locale registration is captured once with the byte-exact namespace
  `client-dsh-workspace-live` and both dictionaries (en and zh), byte-identical to
  `Variable/Locale-*.json`.
- W9: the tab registers with the exact options (`id` "workspace-live", `order` 25, the
  namespace, `label()` = "Workspace").
- W10: the tab component is the LiveTab element bound to a store, with
  `getSnapshot`/`subscribe` present.
- W11: `conversation.view` is the only injected slot point.
- W12: the purity probe on the REAL built code finds no `node:` import, no `require(`,
  and no timer in the client or the store, because the stable-until-event contract has
  no polling machinery.

## Fixtures

The shared Harness resolves the built `@Function/*` and `@Variable/*` imports onto the
real Target and the real JSON dictionaries through the alias hooks, and the fake client
ctx captures locale.register, slots.inject, slots.register, effect, and provide.

No fs seam and no clock run, because the client half has neither, and purity with the
no-timer invariant is asserted on the built code itself.

## Expected strings (byte-exact)

`client-dsh-workspace-live`, `live: dictionaries`, `live: workspace tab`,
`Workspace`, `No workspace representations are presented yet.`.

## Expected count

12 PASS.
