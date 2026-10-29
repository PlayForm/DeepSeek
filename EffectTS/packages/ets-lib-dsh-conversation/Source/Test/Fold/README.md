# Fold

What this test verifies.

## Intent

The pure fold (Source/Function/Fold.ts, the conversation spine's section 3.1): the session log's
records, in sequence order, become one session's conversation state, reading exactly the shapes the
harness records and skipping every other shape without throwing.

## Scenario

- Check: "F1: a two-step session folds turn, step and both calls with their usage" - two step starts
  advance the cursor to turn 1 step 2, two assistant messages fold their token buckets (a missing
  `cacheReadTokens` is `null`, never guessed) with their provider and model, the write tool call
  folds its touch, and the distinct-files list carries the touched path once.
- Check: "F2: a tool call with a relative path resolves against the session header's cwd" - the
  session header supplies the working directory the tool arguments resolve against, and the touch
  carries the turn and step it happened in.
- Check: "F3: a grep whose path is a directory produces no file touch" - the tool call itself is
  still folded, but a search that names a directory is not ranked as a file.
- Check: "F4: an unknown event shape is skipped without throwing" - a null, a string and two
  unrecognized record types leave the state at its zero values.

## Fixtures

- Hand-written event arrays only: no ctx, no factory, no fs - the fold is pure.

## Expected count

4 PASS.
