# The Pass Log

This file fixes the shape of `Documentation/Design/Pass-Log.md`, the pass's second deliverable.

## The rule

Write one entry per decision, with the four fields, and record the rejection beside the choice.

Write the exploration entries before the page, correct an entry when the code and the entry
disagree, count the elements the log claims, and end with the ten learned rules.

## The detail

The schema:

```text
## Step <n> - <what you did>
Read: <the files>
Took: <the mechanic borrowed, and from which specimen>
Decided: <the choice, and what you rejected>
Built: <the band, the state, the interaction>
```

The manual sheet's log has 26 steps and 10 learned rules; the rules are the pass's transferable
output, and each one names the defect it prevents.

The evidence pointers: `Documentation/Design/Dissection-Design.md` is the record of the design pass,
and `Documentation/Design/Dissection-Templater.md` is the record of the content pass that built the
sheet. A claim in the log that a dissection contradicts is corrected in the log.

The counts: 11 bands, 14 nodes, 13 leaves, 7 payloads, 8 decisions, 6 siblings, 6 ledger rows, and 4
modes on the manual sheet. Count them in the file before the report.

The log is ASCII, like every file the pass writes, and its lines stay at or under 100 characters.

The evidence is `Documentation/Design/Pass-Log.md` and `Documentation/Design/Dissection-Design.md`,
section 7.
