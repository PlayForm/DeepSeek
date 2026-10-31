# The Build

This file is the content pass's build loop: what to write, when to compile, and how to recover a
rejected write.

## The rule

Write the page and the stylesheet with the `write` and `edit` tools, compile the stylesheet, grep
the quoted strings, and verify the counts.

Re-read the file immediately before a retry; a write rejected as stale has lost its draft.

## The detail

The templater's counts: 102 calls, 4 writes, 13 edits, 4 compiles, and 16 successful mutations. The
stylesheet was written at call 64 and first compiled at call 81, 17 calls and 7 edits later; after
that the compiles came at 91, 95, and 101, at batch boundaries rather than between edits.

The stale write: call 59 was a 29,951-character page write, composed over two minutes, rejected
because a parallel lane had replaced the file at 05:55; calls 60-62 re-read the file and adopted the
parallel design rather than overwrite it.

The late skill load: call 82 loaded the skill after the build, and the third full write at call 84
changed the mode row and forced the selector renames at calls 85-86.

The corrections the checklist caught: the three `box-shadow` declarations at calls 76-78, the
two-card split in a three-column grid at calls 88-90, and the diamond's inherited radius at call 94.

The false alarms: calls 65-66 treated `&#8230;` as a hex color and used a token regex that returned
nothing; calls 92-93 reported a span imbalance that was 15 closing tags written with a newline. Fix
the check, not the markup.

The evidence is `Documentation/Design/Dissection-Templater.md`, sections 4 and 5.
