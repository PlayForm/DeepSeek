# Wiring-And-Policy - the wiring and the policy

The suite covers the loader contract (apply returns nothing, the default object carries name/apply/Config/inject), the IDLE-forever cold mount, the durable activation proof, the `dshRoute` service registered on construction, the single launch-path listener, the fail-loud policy validation, the shipped default policy, and the no-fs / no-timer posture.

## Scenarios

- **W1.**

    The default object carries name/apply/Config/inject, and apply returns nothing.

    The service is provided on a cold mount, and the disabled mount keeps the passthrough listener and logs the byte-exact disabled line.

    The disabled service still exposes the policy view and the classifier.

- **W2.**

    The single launch-path listener sits on the plugin ctx (no root registrations), the activation line is byte-exact, and the plugin touches no files and sets no timers (no fs, no effects).

- **W3.**

    The policy view is the shipped default (the exact coder/explorer/planner triples, the allowedModels set, and the escalation ladder).

- **W4.**

    An empty allowedModels, a role model outside the set, a negative escalation.max, and a keyword key outside the three roles each fail loud at load with the byte-exact error.

## Expected ledger strings (byte-exact, `plugin-dsh-route: ` prefix)

`disabled (enabled=false)`,
`activated (bundle 0.3.0, defaultRole=explorer, models=3)`.

## Expected count

12 PASS.
