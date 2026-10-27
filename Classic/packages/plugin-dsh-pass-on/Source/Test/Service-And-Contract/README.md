# Service-And-Contract - the loader contract and the service surface

This folder covers the class-form loader contract and the disabled posture: the static shape, the immediate registration, the identity, the Get read, the disabled refusal, the config-derived state, the tilde-expanded ledger default, and the silence invariant.

## Scenarios

- C1: the default export is a class carrying the static `Config` (a
  function) and the static `inject` (empty). (The bundle minifies the class
  expression's own name; the class-form identity is the registered service
  name, asserted in C2.)
- C2: the constructor registers the instance as `passOn` through
  `ctx.reflect.provide` immediately, and the instance's name is `passOn`.
- C3: `Get` returns null for an unknown id, never a throw.
- C4: a disabled service prepares nothing; the journal still records the
  refusal with the kind (`"note":"rejected version-bump"`).
- C5: the validated config lands on the state verbatim; the module identity
  is `plugin-dsh-pass-on`; the ledger is the config's logFile.
- C6: the tilde ledger default expands to the home directory.
- C7: the plugin never logs - the journal file is its only voice (the
  silence invariant).

## Fixtures

The harness is the shared Harness: a fake ctx with the reflect.provide capture, the real built Target, and a fresh temporary directory per folder process with fixture files seeded into it.

It uses no fake clock, because the expiry is tested by mutating the stored proposal's `expiresAt`.

## Expected journal strings (byte-exact, JSON lines)

`{"at":<epoch>,"event":"prepared","proposal":<id>,"digest":<digest>,"targets":1,"note":"prepared 1 targets"}`,
`{"at":<epoch>,"event":"prepared","proposal":null,"digest":null,"targets":0,"note":"rejected <kind>"}`.

## Expected count

8 PASS.
