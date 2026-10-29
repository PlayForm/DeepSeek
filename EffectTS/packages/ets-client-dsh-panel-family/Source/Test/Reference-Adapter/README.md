# Reference-Adapter - the status and the config form

The suite follows one reference adapter end to end against the real built functions and
the real manifest that the package ships.

It covers the status (the static fallback, the live trace tail, the activation override),
the config form generated from the serialized Schemastery schema of the plugin, and the
two write routes, which are the revision-fenced volatile mutate and the plain-field
bridge.

## Scenarios

- A1: with no trace exposed the status is the static activation of the adapter
  (`enabled`), `live` is false, and the tail is empty, which is the documented
  fallback.
- A2: an exposed trace port makes the status live, and the tail lists the
  envelope as the byte-exact `<kind> <path>` line.
- A3: the tail is newest first (`graph/invalidated`, `graph/indexed`,
  `observe/stamp`).
- A3b: a live tail created after the events seeds itself from the ring of the
  trace, so a mid-session attach still shows the held history.
- A4: the newest envelope that carries `payload.activation` overrides the
  static posture (`disabled`, then `enabled`).
- A5: the form derives every field from the serialized schema, which covers the
  volatile knobs (`logFile`, `replacement`, the volatile `scopes` object, the
  `toolResultsExempt` array), the plain semantic gates (`normalizeReasoning`,
  `normalizeToolArguments`), the nested paths, the values and the composition
  base, and the provenance, where `overridden` is a user-layer key presence and
  not a value comparison.
- A5b: the form reports `unavailable` without the settings client and `loading`
  before the namespace view arrives.
- A6: a `role("secret")` field renders the `configured (secret)` marker and
  never the value, and the namespace is flagged `secret`.
- A7: a volatile write rides the revision-fenced settings mutate with the exact
  namespace, path, value, and rendered revision.
- A8: a plain write sends the whole resolved config of the namespace, with the
  field path replaced, through `editFull`, and it emits the byte-exact audit
  line.
- A9: a namespace that declares a secret refuses the bridge write with the
  byte-exact refusal line, because the panel cannot restate a redacted value.
- A10: a plain write with no bridge exposed is refused with the byte-exact
  missing-bridge line.
- A11: the bridge resolves the direct `panelFamilyBridge` service first, then
  `remote.playformFamilyPanel.editFull`, and otherwise `undefined`.
- A12: the three shipped reference manifests lead the documented roster
  (normalize 10, tool-coach 30, suggester 40, and the ten residual adapters
  append after them), and the first three adapter effects are the three exact
  reference labels.

## Fixtures

The shared Harness supplies the real built `@Function/*` modules and the real
`@Variable/Reference/*` manifests.

The schemas are real Schemastery instances serialized with `toJSON()`, which is the same
envelope that the settings host serves, so the derivation runs on the actual shape of
the contract and not on a hand-written mock.

The settings client and the bridge are fakes that capture every write.

## Expected strings (byte-exact)

`client-dsh-panel-family: plain-field write hook-dsh-normalize-dash normalizeReasoning`,
`client-dsh-panel-family: plain-field secret refused for hook-dsh-secret-test`,
`client-dsh-panel-family: plain-field bridge unavailable for hook-dsh-normalize-dash`,
`configured (secret)`, `observe/stamp src/a.ts`,
`graph/invalidated src/c.ts`, `graph/indexed src/b.ts`.

## Expected count

14 PASS.
