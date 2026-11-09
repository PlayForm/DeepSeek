# Config-And-Tab - the client half's registration surface

The suite exercises the client apply through the records the real built client half
actually produced: the fake client ctx's `locale.register` and `slots.register`
captures hold whatever the real code registered, so the suite proves the wired
surface rather than a fixture.

## Scenarios

- C1: the client apply registered exactly one tab, and its options carry the
  full identity: `name` is the `conversation.view` slot, `id` is
  `playform-cost`, `order` is 30, and `locale` names the
  `client-dsh-panel-cost` namespace.
- C2: the tab's `label()` returns the pre-locale English answer `Cost`,
  because the label falls back to the English table before the locale
  service resolves the registered namespace.
- C3: the client apply registered exactly one locale, the namespace
  `client-dsh-panel-cost`, whose dictionaries object carries both an `en`
  and a `zh` dictionary, and the English dictionary's `tab` key is `Cost`.
- C4: the Config schema's volatile defaults, read from Target/Library.js
  through the alias hooks and evaluated by calling the schema (the
  schemastery object is callable): `enabled` true, `tabOrder` 30,
  `rows` 200, `locale` "en".

## Fixtures

The shared Harness supplies the real built Target (Target/Library.js and
Target/Client.js, loaded after the alias hooks register) and the two fake
ctxs.

C4 evaluates the schema through `Validate({})`, the family's calling
convention. Each field is declared `.volatile()`, so the validated value is a
getter object (`{ get() }`) rather than a plain scalar; the check unwraps each
field with its `get()` before the deep-equal. If the test build cannot resolve
`@deepseek-ai/schemastery`, the call throws, `Defaults` stays null, and C4
degrades to asserting the four keys exist on the schema object while skipping
the default-value check.

## Known blind spots

- The View component is never mounted: the suite asserts the registration
  surface (the options and the label), not the react tree the component
  returns, so a broken render would pass here.
- The zh dictionary is asserted for presence only, not key-by-key equality
  with the English table, so a missing zh key would pass.
- The `Styles()` module-load side effect is guarded by
  `typeof document === "undefined"` and no-ops under Node, so the real
  stylesheet injection is not exercised here.

## Expected count

4 PASS.
