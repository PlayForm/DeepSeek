---
name: smoke-writing
description: "The discipline for the family's smoke suites: the fake-context plus real-built-library harness, byte-identical ledger assertions, additive coverage, the vacuously-green trap, the swapped-assert trap, the smoke-versus-live fidelity gap, and the Classic/EffectTS parity rule."
whenToUse: Before creating, modifying, or debugging any smoke suite or per-test folder in either tree, when a suite fails and you are tempted to adjust an assertion, or when a live bug must become a regression test.
version: 2.0.0
updated: 2026-10-20
---

# Smoke Writing

The smokes are the arbiter: after every change, the suites pass. They load
the real built library and assert its behavior, including the ledger
strings, byte for byte. This skill states how to write them and how to
read a failure without weakening the contract.

## When to use

- Adding a test folder, a suite, or an assertion.
- A suite fails after a change.
- A live finding must become a regression test.
- Do not use for: the build and ledger ownership (`plugin-system`) or the
  decision to run the aggregate (`Maintain/Run-Smokes.mjs`).

## The harness pattern

Every mechanics test:

1. Loads the REAL built `Target/Library.js` of its bundle.
2. Runs it against a FAKE context that captures what the plugin does.
3. Asserts the captured behavior, the ledger lines, and the state probes.

The fake context provides the seams the plugin uses:

| Seam        | The fake provides                                          |
| ----------- | ---------------------------------------------------------- |
| `on`/`emit` | Registration capture and event emission                    |
| `effect`    | Immediate execution plus a recorded disposer               |
| `get`       | The real factory, or a recorded probe                      |
| `reflect`   | The plugin's own registrations                             |
| `fs`        | A capturing fs (reads, writes, intents, observations)      |
| `waterfall` | A chain that runs the listener and the default             |
| `logger`    | A recorder for the log lines                               |
| `root`      | `get root() { return Context; }`                           |
| state       | The `__<name>State` probe                                  |

## The assertion contract

1. **Ledger strings are byte-identical.** The logger-prefixed
   `<module>: ...` forms and the ledger file's `[ISO] message` forms are
   asserted exactly. They are the contract.
2. **Identity-driven strings are the only exception.** A module rename
   changes its own prefixes and logFile default by design; every other
   assertion stays byte-identical through every refactor.
3. **Additive coverage.** A new feature grows the suite; existing
   assertions never weaken. Record the new count in the folder's README.
4. **A failing smoke means the change is wrong.** Read the failure's
   intent and fix the change, not the assertion.

## The count guard

Each test folder's `README.md` declares its expected count under
`## Expected count` as `<N> PASS.` The aggregate
(`Maintain/Run-Smokes.mjs`) compares the printed `N PASS - <Name>` line
with that number. A folder without a parseable count fails.

The per-folder READMEs are the arbiter; the aggregate compares each printed
count with them. The manifest line in `<tree>/smokes/README.md` is a
summary, not the truth: it can lag the folders. Verify it before quoting a
total (2026-10-20: dash 184 vs 132, each small flavor 104 vs 62,
normalize-file 112 vs 71, factory 35 vs 34; core, governor, pinner, cargo,
ccr, and tool-coach match). The `live-containers` folders are run by the
aggregate but are not in that line.

## The traps

| Trap                     | What it looks like                                      | The check                          |
| ------------------------ | ------------------------------------------------------- | ---------------------------------- |
| Vacuously green          | The suite passes without exercising the code            | Verify the fixture wiring first    |
| Swapped/reversed assert  | `assert.equal(boolean, string)`; a drifting count       | Read the assertion's intent        |
| Fidelity gap             | Green smokes, broken live profile                       | Check the ledgers live             |

When a smoke "passes but the world is weird", verify the harness wiring
before trusting the pass.

## The parity rule

- Classic and EffectTS carry the same assertion sets.
- EffectTS adds coverage (core +3, factory +7, governor +3) on the same
  contract.
- Tracing-on mode (`FACTORY_SMOKE_TRACING=1`) must produce byte-identical
  stdout and ledgers; the spans never alter strings, ordering, or timing.

## The workflow

1. Read the bundle's existing tests and its `Source/Test/<Name>/README.md`.
2. Add or change the test through the write/edit tools.
3. Build the bundle (`prepublishOnly`) so `Target/Test/` exists.
4. Run the folder:
   `node <tree>/packages/<bundle>/Target/Test/<Name>/Test.js`.
5. Compare the printed count with the README's expected count.
6. Run the aggregate when the change is cross-cutting.
7. A live finding becomes a regression test where the harness can
   represent it.

## Verification

- The folder prints `N PASS - <Name>` matching its README.
- The ledger strings diff empty against the baseline.
- The aggregate passes for the touched tree.
- The tracing rerun (EffectTS) is byte-identical.

## Anti-patterns

| Mistake                              | Cost                                      | Do instead                       |
| ------------------------------------ | ----------------------------------------- | -------------------------------- |
| Weakening an assertion to pass       | The arbiter stops arbitrating             | Fix the change                   |
| Asserting against a mock library     | The test proves the mock, not the bundle  | Load the real `Target/Library.js`|
| A folder without an expected count   | The vacuously-green guard is off          | Declare the count in the README  |
| Skipping the build before the run    | The test runs a stale Target              | `prepublishOnly` first           |

## References

| File                        | Covers                                                  | Read when                    |
| --------------------------- | ------------------------------------------------------- | ---------------------------- |
| `references/harness.md`     | The fake context, the fs variants, imports, and running  | Writing a test               |
| `references/assertions.md`  | The byte-identical law, identity exceptions, coverage    | Asserting behavior           |
| `references/traps-and-parity.md` | The traps, the fidelity gap, and the three-tree parity | A pass looks wrong           |
