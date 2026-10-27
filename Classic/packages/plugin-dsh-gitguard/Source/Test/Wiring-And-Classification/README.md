# Wiring-And-Classification - the wiring and the classifier tests

This folder covers the loader contract, the cold mount, the activation proof, the listener
placement, the classification table, and the fail-loud validation.

## Scenarios

- L1: the loader contract - the default object carries the name
  `plugin-dsh-gitguard`, apply, Config, and inject `["pluginFactory"]`, apply
  returns NOTHING, and the `__pluginDshGitguardState` probe exists with the
  default deny list of 23 entries and allow list of 7 entries.
- W1: the IDLE-FOREVER cold mount - the byte-exact `disabled (enabled=false)`
  line appears and no listener is registered anywhere, because the guard
  wires nothing when it is disabled.
- W2: the activation wiring - the byte-exact
  `activated (strict=false, denyPatterns=23, allowPatterns=7)` line appears,
  and `tools/pre-execute` is registered on the plugin context and never on the
  root, because the root object is a distinct context.
- F1: the classification table over the real built `Decide` and the real
  state - the seven read-only checks allow; every default deny-listed
  mutation denies with the exact `deny-list: git <sub>` reason and subcommand;
  non-git commands allow as `not a git command`; env prefixes and leading
  flags are skipped; bare git and `git --version` are not denied.
- F2: compounds and the allow-list win - a compound is judged by its worst
  segment, so `cd repo && git add -A` denies and `git status; git commit -m x`
  names `commit`, and a user-configured `allowPatterns: ["push"]` lets
  `git push` pass over the deny-list.
- F3: strict mode denies every git command, the allow-list included, with the
  exact `strict mode denies every git command (<sub>)` reason, while non-git
  commands still allow.
- X1: the fail-loud validation - a non-array `denyPatterns` and a non-string
  member both throw at load, because the schema rejects them before any wiring
  happens.

## Fixtures

The fixtures are the shared Harness with the fake ctx that carries the distinct root and the real
factory instance, and the classification runs through the built
`Target/Function/Decide.js` against the state that apply builds.

## Expected ledger strings (byte-exact, `gitguard: ` prefix)

`disabled (enabled=false)`,
`activated (strict=false, denyPatterns=23, allowPatterns=7)`.

## Expected count

15 PASS.
