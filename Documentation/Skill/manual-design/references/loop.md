# The Write Loop

This file is the procedure that turns a design decision into a band without editing the file blind.

## The rule

For each band: grep the selector, read a 4 to 60 line slice, edit one block, compile, grep the
emitted selector, re-read after the formatter, log the band, then grep the next selector.

Never re-read the whole stylesheet between bands, and never edit a file from a read that the
formatter has invalidated.

## The detail

The compile is
`cd Site && ./node_modules/.bin/sass --no-source-map Source/Stylesheet/Manual.scss > /tmp/manual.css`;
print the exit code and read the first lines of stderr.

The emitted-selector grep is `grep -n "sheet__band-head\|sheet__band-body" /tmp/manual.css`; it
proves that the nested rule compiled to the selector you meant.

The slice is 4 to 6 lines for an attribute and 30 to 60 for a block; the read tool's `offset` and
`limit` are the unit of context.

The formatter runs on every write and edit, so the next edit to the same file begins with a fresh
read. The design agent's call 98 was rejected with "file changed since it was read", and the
recovery was a ten-line read and the same edit.

The design agent's counts: ten band groups, seventeen edits, thirteen slice reads, five compiles in
the loop, one compile per 2.4 edits, and 1.7 edits per band at the mean and 1 at the median. The
band groups were the split lists, the copy import, the band head, the cross-highlight, the decision
press, the band attribute, the log corrections, the meta at 860, the markup accessibility pass, and
the world label.

The two big writes (47,916 and 45,993 characters) took two calls and produced a 75-call correction
tail. The loop exists so that a second page does not pay that tail: write the first band, compile
it, then extend.

The fact checks inside the loop are a word diff against `git show :Source/pages/_Manual.astro` (the
staged original) and a grep for every deletion. The sentence-substring check is too coarse, because
inserted UI words break the sentence boundaries.

The evidence is `Documentation/Design/Dissection-Design.md`, section 3, and
`Documentation/Design/Pass-Log.md`, Steps 25-26.
