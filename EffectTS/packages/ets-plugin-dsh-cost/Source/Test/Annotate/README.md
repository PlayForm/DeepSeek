# Annotate

What this test verifies.

## Intent

`Annotate` - the annotation writer (Documentation/Plans/COST-TRACK-PLUGIN.md section 7): the
marker-delimited cost comment is appended once after one blank line at end of file, a second run
with the same numbers changes nothing, a changed total replaces the block in place, a trailing
unrelated comment survives every run, and an unknown extension is skipped, never guessed.

## Scenario

- Check: "T5: the block is appended once, after one blank line" - exactly one begin marker, the
  rendered total 12.4183, the trailing note ahead of the block, the block closes the file.
- Check: "T5: a second run with the same numbers changes nothing" - reason "unchanged", still one
  block.
- Check: "T5: a changed total replaces the block in place, the note survives" - reason "replaced",
  the note stays ahead of the block, the new total 14.4183 is in it.
- Check: "T5: an unknown extension is skipped, never guessed" - reason names the unknown extension.

## Fixtures

- A fresh OS tmpdir root with an in-memory fake fs whose `writeText` enforces the
  `replaceIfVersion` guard exactly like the local backend, and a ledger seeded with two priced
  calls (direct 3.1022, amortized 9.3161 across two models) over one file.

## Expected count

4 PASS.
