# The Bands

This file gives each band one geometry, one rule weight, and the states its controls can express.

## The rule

Assign each band one geometry from the seven and one rung from the weight ladder; no two neighboring
bands may share a geometry.

Declare the states the control has, and only those; choose the native element that carries the
state.

Write the paint-order trap with its `z-index` lift and its comment, put the focus ring on the thing
the eye is on, and give an inspector a default subject.

## The detail

The seven geometries: a tray, a triptych, a ruled spine, a cell grid, a two-column split, a display
pair, and an embedded machine.

The weight ladder: 2px ink opens the page or a panel, 1px strong separates the bands, and 1px line
divides the inside of a machine.

The state set: default, hover, focus-visible, active, selected or current, disabled, and expanded. A
reveal target has no selected state, a reading surface has no press, and an informational target has
a plate and no band.

| Need | Element |
| --- | --- |
| One of N | A native radio group, styled, with `:has` for the dependent view. |
| A disclosure | `<details>` and `<summary>`. |
| A one-shot action | A `<button>`. |
| A list | `<ol>` or `<ul>`; a key/value set, `<dl>`. |

The manual sheet's assignment: the head (a 72px mark plate, a 2px ink rule, a lamp stamp), the
spec strip (six cells with 1px gaps), the mode row (one segmented track of four radios), the
two-world canvas (a 96px rail, one stage axis, fourteen focusable nodes, a seven-slot inspector
defaulting to stage 3), the artifact triptych (three cards with before and after tags), the
decision spine (eight `<details>` rows with the condition behind a `condition` summary), the
registers (two leaf grids with a default plate), the seam (six sibling cards and six ledger rows,
cross-highlighted), the dispatch (a seam tray, a chain, and the one dark proof plate with
`CopyButton`), the split (two ruled columns), the pair (two plates with a dim compare), the reach
(on and off channels), the knob (a dashed no-op), and the run (the session island, dimmed except
the selected record).

The trap: `.sheet__decision-summary::before` is the band, the summary's children are at
`z-index: 1`, and the comment beside the rule says why; `Line.scss` carries the original.

The evidence is `Documentation/Design/Dissection-Design.md`, section 3, and
`Documentation/Design/Pass-Log.md`, Steps 15-24.
