# Guard-And-Ledger - the listener behavior tests

This folder covers the `tools/pre-execute` intercept: the refusal arm, the allow arm, the payload
shapes, the exclusion, the one-time surfacing, and the ledger.

## Scenarios

- G1: the deny arm - the refusal replaces the dispatch, because `next()` is
  deliberately not called, the refusal line is byte-exact
  (`gitguard: refused "git add" (deny-list: git add) - git is read-only in
  this session (the checks-only law). Allowed: git status, log, diff, show,
  rev-parse, ls-files, fetch.`), and the denial is ledgered in both the logger
  form (`gitguard: denied add (deny-list: git add)`) and the durable `[ISO]`
  form.
- G2: the allow arm - an allowed dispatch passes through `next()` unchanged
  and leaves no denial line.
- G3: a payload without a readable command, such as an empty object or null,
  passes without a guess.
- G4: the exclusion - a dispatch whose cwd matches `exclude` skips the guard
  entirely, while the same command outside the excluded path still denies.
- G5: the payload-shape extraction - the string form, `exec.command`,
  `input.command`, and `cmd` all reach the classifier with the right
  subcommand.
- G6: every denied attempt is ledgered exactly once per attempt, so two
  identical denials produce two ledger lines, and the attempt is never
  punished, because the word "refused" never reaches the logger.
- G7: the zero file-content guarantee - denies and allows alike record ZERO
  `writeText` and ZERO `readText` calls on the fake fs.

## Fixtures

The fixtures are the shared Harness with the `Fire` helper, which supplies the recorded `next()`
and the `__nextCalled` count on every decision.

## Expected ledger strings (byte-exact, `gitguard: ` prefix)

`denied <sub|bare> (<reason>)`.

## Expected count

9 PASS.
