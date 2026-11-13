# Wiring-And-Policy - the wiring and the policy

This folder covers the loader contract (apply returns nothing, the default object carries name/apply/Config/inject), the schema's Config base, the live disabled cold mount, the durable activation proof, the `dshRoute` service registered on construction, the single launch-path listener, the fail-loud policy validation, the shipped default policy, and the no-fs / no-timer posture.

## Scenarios

- W1: the schema ships the Config base (`enabled`/`log` default `true`,
  `logFile` the module's ledger path) with the base keys first; the default
  object carries name/apply/Config/inject; apply returns nothing; the
  disabled mount (`enabled: false`) keeps the passthrough listener and logs
  the byte-exact disabled line; the disabled service still exposes the policy
  view and the classifier.
- W2: the single launch-path listener sits on the plugin ctx (no root
  registrations); the activation line is byte-exact; the plugin touches no
  files and sets no timers (no fs, no effects).
- W3: the policy view is the shipped default (the exact coder/explorer/
  planner triples, the allowedModels set, and the escalation ladder).
- W4: an empty allowedModels, a role model outside the set, a negative
  escalation.max, and a keyword key outside the three roles each fail loud
  at load with the byte-exact error.

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.2.1, defaultRole=explorer, models=3)`.

## Expected count

14 PASS.
