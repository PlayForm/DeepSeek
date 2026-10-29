# All-Adapters - the thirteen shipped adapters

The suite walks the full per-bundle roster end to end.

All THIRTEEN manifests register, which is the three references plus the ten that
copied the pattern, and each manifest declares its exact slot, bundle, order,
activation, and trace vocabulary.

The client apply wires thirteen adapter effects, each form derives the schema shape of
its plugin with a representative volatile field and plain field per adapter, the two
write routes work for the new adapters, and the built closure-factory bundle executes
through a fake `window.__ModuleLoader__` and registers the same thirteen adapters.

## Scenarios

- B1: the thirteen shipped manifests are the exact roster (id, bundle,
  namespace, order, slot): normalize-dash 10, tool-coach 30, suggester 40,
  normalize-quotes 11, normalize-ellipsis 12, normalize-spaces 13,
  normalize-invisible 14, normalize-fullwidth 15, plugin-dsh-normalize-file
  20, package-governor 50, package-pinner 55, cargo-governor 60, ccr 70 - all
  in the `playform.panel.section` slot.
- B2: the client apply wires exactly thirteen `panel: adapter <id>` effects
  after the four panel effects, in the order of the roster.
- B3: the thirteen adapters inject exactly the section child slot, and opening
  it yields thirteen registrations whose ids equal the ids of the roster.
- B4: every static activation is `enabled`, because none of the thirteen
  schemas has a master switch and the bundle row decides, and every traceKinds
  holds the three D5 names (`observe/stamp`, `graph/indexed`,
  `graph/invalidated`).
- B5: the form of each of the ten new adapters, derived from a real Schemastery
  schema that mirrors the `Variable/Config.ts` of the plugin, is ready, declares
  no secret, and contains its representative VOLATILE field with the volatile
  marker: quotes/ellipsis/spaces/invisible/fullwidth (logFile, replacement),
  normalize-file (replacement), package-governor / package-pinner /
  cargo-governor (updateCooldownMs, mutationTools), ccr (thresholdBytes,
  multipliers, previewMaxChars).
- B6: the plain representatives exist with the plain route, which covers the
  semantic gates (normalizeReasoning, normalizeToolArguments) for the stream
  flavors, `strict`/`maxUpdateFailures`/`updateMode`/`ncuBin` for the package
  governor, `sections` for the pinner, `strict`/`maxUpdateFailures`/`cargoBin`/
  `keepFile` for the cargo governor, and `targets`/`exempt`/`autoExpand` for
  ccr, and plugin-dsh-normalize-file has NO plain field, because every derived
  field is volatile and it is the only all-volatile schema in the family.
- B7: a volatile write on a new adapter (ccr `thresholdBytes`) rides the
  revision-fenced settings mutate with the exact namespace, path, value, and
  rendered revision.
- B8: a plain write on a new adapter (package-governor `strict`) sends the
  whole config through the bridge and emits the byte-exact audit line.
- B9: the built `Target/Client.bundle.js` is a closure factory that executes
  through a fake `window.__ModuleLoader__`, with one row that carries the
  package id, a factory whose exports carry the same `inject`/`apply` as the
  ESM client half, and those exports applied to a fake client ctx register the
  same thirteen adapter effects, because the bundle is the servable surface and
  must register the full roster too.

## Fixtures

The shared Harness supplies the real built `@Function/*` modules and the thirteen
real `@Variable/Reference/*` manifests.

The schemas are real Schemastery instances that mirror the `Variable/Config.ts` shape
of each plugin, which is the same serialized envelope that the settings host serves.

The settings client, the bridge, the trace, and the module loader are fakes that
capture every write and every registration.

## Expected strings (byte-exact)

`client-dsh-panel-family: plain-field write hook-dsh-package-governor strict`,
`window.__ModuleLoader__.load({`, the thirteen
`panel: adapter adapter-*` effect labels.

## Expected count

9 PASS.
