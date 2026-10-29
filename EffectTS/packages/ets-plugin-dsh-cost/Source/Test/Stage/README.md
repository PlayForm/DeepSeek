# Stage

What this test verifies.

## Intent

`Stage` - the semantic pipeline's stage classifier (Documentation/Plans/COST-TRACK-PLUGIN.md
section 16.1): a file moves through stages, and the stage is derived from the tool kind and the
file's own prior touches in the session - six rules, in their exact order, with anything
unplaceable a discovery, never a guess.

## Scenario

- Check: "B1: a search is a discovery, ahead of every other rule" - including ahead of the revert
  rule, which proves the order itself.
- Check: "B1: a restored touch reverts, whatever the kind".
- Check: "B1: a read after a write or an edit verifies the change".
- Check: "B1: a read after a read with no edit in between rereads".
- Check: "B1: a first read with no prior touches reads".
- Check: "B1: a write, an edit, a delete or a move edits".
- Check: "B1: anything the classifier cannot place is a discovery".

## Fixtures

- The shared harness counter only - the classifier is a pure function over the prior touch kinds,
  the tool kind and the restore flag.

## Expected count

7 PASS.
