# Edit

What this test verifies.

## Intent

`Edit` - the edit grain parser (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.3): one tool
call's name and arguments string become the hunks the call produces - a single edit one row with
the line and byte counts read from the old and new strings, a multi_edit one row per entry with
ascending ordinals, a write one row from the content's own lines and bytes - and a malformed or
alien arguments string yields an empty array without a throw.

## Scenario

- Check: "E3: a single edit yields one row with the right line and byte counts" - two removed
  lines, one added, five and three bytes.
- Check: "E3: a multi-edit yields one row per entry with ascending ordinals" - three entries,
  ordinals 0, 1, 2, the per-entry counts read from their own strings.
- Check: "E3: a write yields one row from the content" - three lines from two newlines plus one,
  fourteen bytes, and an empty content adds nothing.
- Check: "E3: malformed or alien arguments yield an empty array and do not throw" - malformed
  JSON, a non-object payload, an unmapped tool, a non-array edits key, a null payload.

## Fixtures

- None: the parser is a pure function over the tool name and the arguments string, exercised
  through hand-built JSON payloads; the Harness supplies only the counter and the finish guard.

## Expected count

4 PASS.
