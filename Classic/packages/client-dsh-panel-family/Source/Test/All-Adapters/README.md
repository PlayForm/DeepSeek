# All-Adapters - the thirteen shipped adapters

The full per-bundle roster end to end: all THIRTEEN manifests register (the
three references plus the ten that copied the pattern), each manifest
declares its exact slot/bundle/order/activation/trace vocabulary, the client
apply wires thirteen adapter effects, each form derives its plugin's schema
shape (a representative volatile and plain field per adapter), the two write
routes work for the new adapters, and the built closure-factory bundle
executes through a fake `window.__ModuleLoader__` and registers the same
thirteen adapters.

## Scenarios

- B1: the thirteen shipped manifests are the exact roster (id, bundle,
  namespace, order, slot): normalize-dash 10, tool-coach 30, suggester 40,
  normalize-quotes 11, normalize-ellipsis 12, normalize-spaces 13,
  normalize-invisible 14, normalize-fullwidth 15, plugin-dsh-normalize-file
  20, package-governor 50, package-pinner 55, cargo-governor 60, ccr 70 -
  all in the `playform.panel.section` slot.
- B2: the client apply wires exactly thirteen `panel: adapter <id>` effects
  after the four panel effects, in the roster's order.
- B3: the thirteen adapters inject exactly the section child slot; opening
  it yields thirteen registrations whose ids equal the roster's ids.
- B4: every manifest's static activation is `enabled` (no master switch in
  any of the thirteen schemas; the bundle row decides) and its traceKinds
  are the three D5 names (`observe/stamp`, `graph/indexed`,
  `graph/invalidated`).
- B5: each of the ten new adapters' form (derived from a real Schemastery
  schema mirroring the plugin's `Variable/Config.ts`) is ready, declares no
  secret, and contains its representative VOLATILE field with the volatile
  marker: quotes/ellipsis/spaces/invisible/fullwidth (logFile, replacement),
  normalize-file (replacement), package-governor / package-pinner /
  cargo-governor (updateCooldownMs, mutationTools), ccr (thresholdBytes,
  multipliers, previewMaxChars).
- B6: the plain representatives exist with the plain route: the semantic
  gates (normalizeReasoning, normalizeToolArguments) for the stream flavors,
  `strict`/`maxUpdateFailures`/`updateMode`/`ncuBin` for the package
  governor, `sections` for the pinner, `strict`/`maxUpdateFailures`/
  `cargoBin`/`keepFile` for the cargo governor, `targets`/`exempt`/
  `autoExpand` for ccr - and plugin-dsh-normalize-file has NO plain field
  (every derived field is volatile, the family's only all-volatile schema).
- B7: a volatile write on a new adapter (ccr `thresholdBytes`) rides the
  revision-fenced settings mutate with the exact namespace, path, value, and
  rendered revision.
- B8: a plain write on a new adapter (package-governor `strict`) sends the
  whole config through the bridge and emits the byte-exact audit line.
- B9: the built `Target/Client.bundle.js` is a closure factory that
  executes through a fake `window.__ModuleLoader__`: one row with the
  package id, a factory whose exports carry the same `inject`/`apply` as the
  ESM client half, and applying those exports to a fake client ctx registers
  the same thirteen adapter effects (the bundle is the servable surface, so
  it must register the full roster too).

## Fixtures

The shared Harness plus the real built `@Function/*` modules and the thirteen
real `@Variable/Reference/*` manifests. The schemas are real Schemastery
instances mirroring each plugin's `Variable/Config.ts` shape (the same
serialized envelope the settings host serves). The settings client, the
bridge, the trace, and the module loader are fakes that capture every write
and every registration.

## Expected strings (byte-exact)

`client-dsh-panel-family: plain-field write hook-dsh-package-governor strict`,
`window.__ModuleLoader__.load({`, the thirteen
`panel: adapter adapter-*` effect labels.

## Expected count

9 PASS.
