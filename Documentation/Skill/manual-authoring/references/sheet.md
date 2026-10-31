# The Sheet

This file fixes the sheet's band inventory, its dossier, and its copy list.

## The rule

One claim, the bands in order, the exact copy, and a layout drawing; every band names the machine it
draws and the source it came from.

Build from the dossier, not from a conversation, and append a dated section when the design changes.

## The detail

The dossier schema in `Documentation/Showcase/README.md` is the claim, the layout in ASCII, the
machines, the data, and the history; the history repeats the whole layout, not a diff.

The band inventory of the ellipsis sheet: the title band with the package mark, the title, and the
`CONCEPT / ILLUSTRATIVE` stamp; the subtitle; the mode row; the two-world canvas; the artifact
triptych; the decision spine; the registers; the seam (siblings and ledger); the dispatch (the seam
tray, the chain, the dark proof plate); the split; the pair; the reach; the knob and the no-op; and
the run.

The copy list is exact: the glyph pair (`U+2026` and `...`), the table heads (`Code point`,
`Becomes`, `Name`, `Rule`), the rule line, the reach rows, the knob and its default, and the no-op
branch.

The frame sources: `Temporary/Corca/Specimens/Plugin.html` for the triptych, `Flow.html` for the
lane, `Session.html` and `Trace-Prototype.html` for the document and the inspector, and
`Documentation/Showcase/<slug>.md` for the layout the sheet must implement.

The evidence is `Documentation/Showcase/hook-dsh-normalize-ellipsis.md` and
`Documentation/Design/Dissection-Templater.md`, sections 2 and 3.
