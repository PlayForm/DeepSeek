# Assertions: Byte-Identical, Additive, and Failing Correctly

## The byte-identical law

The ledger strings are the contract. Two forms are asserted exactly:

- the logger-prefixed `<module>: ...` lines;
- the ledger file's `[ISO] message` lines.

An assertion may not normalize, trim, or pattern-match away a difference. If the string changed, the
change is the question.

## The identity exception

A module rename is a by-design identity change. Its own `<module>: ` prefixes and its default
`logFile` change with it, and the smoke's identity assertions change in the same change set. Every
other assertion stays byte-identical.

A rename is recorded as a rename; a drive-by string edit is not.

## Additive coverage

- A new feature grows the suite.
- Existing assertions never weaken.
- The folder's README records the new expected count.

The count is the release contract. A change that moves a count without a feature is a behavior
change that must be explained.

## A failing smoke means the change is wrong

Read the failure's intent before touching either side:

1. Which behavior does the assertion protect?
2. Did the change alter that behavior intentionally?
3. If yes, the assertion changes with the feature, additively.
4. If no, the change is the bug.

Never weaken an assertion to make a change pass. A suite that passes by losing its assertions has
stopped being the arbiter.

## The count guard

Each folder's README declares:

```markdown
## Expected count

<N> PASS.
```

The aggregate compares the printed line with this number. A folder without a parseable count fails;
a folder whose count drifts fails.

## Failure modes

- **Normalized comparison**: the assertion hides a real byte change.
- **Count drift accepted**: the suite silently loses coverage.
- **Assertion edited to match a bug**: the arbiter is now the bug's accomplice.
- **Feature without a count update**: the guard fails, and the fix is to record the new count, not
  to remove the guard.
