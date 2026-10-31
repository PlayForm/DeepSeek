# Pass log - the manual sheet

A design pass over one existing page: `Site/Source/pages/_Manual.astro` (the dev route `/manual/`)
and `Site/Source/Stylesheet/Manual.scss`. The bands and the facts stay; the UI inside them changes.
The log is written in the order the work happened, one entry per decision, and it records what was
rejected as well as what was built.

## Step 1 - Read the component specimen and its measured CSS

Read: `Temporary/Corca/Specimens/Components.html`, `Temporary/Corca/Specimens/Components.css`.

Took: the line as the base unit - a grid of a 35px gutter and a body, a band drawn by an absolutely
positioned `::before` with a 10px radius, and the content lifted with
`position: relative; z-index: 1` so the band cannot paint over the text it highlights. The gutter
carries the address, the collapse toggle is invisible until the line is hovered, the chip is a
hairline plate, the tab states selection with a fill, the table draws its column dividers with
pseudo-elements instead of borders, and the pending block is the system's one dark surface.

Decided: the band-plus-lifted-content mechanic is the page's core hover grammar, because the sheet
already has addressable rows (the decisions, the ledger lines) that were flat. Rejected: the 10px
and 999px radii, the Geist face, the `0 10px 30px` card shadow, and the 70% black blurred tooltip.
The site's law is square surfaces, Inter and IBM Plex Mono, and zero elevation; a borrowed mechanic
has to survive that translation or it is not borrowed, it is copied.

Built: nothing yet. This entry is the note the pass starts from.

## Step 2 - Read the flow specimen

Read: `Temporary/Corca/Specimens/Flow.html`.

Took: the swimlane as a rail plus a track - a fixed name column on the left, the track on the right,
a hairline through the middle, and an axis under it. The event is a chip positioned by percentage,
the active path is the accent, the state machine is a row of pills joined by labelled edges, and the
fan-out is one producer with a short line to N consumers. The legend is a row of the same atoms, not
a colour key.

Decided: the two-world canvas should read as two lanes sharing one rail and one axis, not as two
lists of labels above two hairline grids. The axis is the one thing the old page lacked: it says the
seven stages are one coordinate, so the same stage in the other world is comparable. Rejected:
absolute percentage positions for the nodes. The page already has seven named columns; positioning
by inline percentages would duplicate the geometry and drift from the labels at every width. A
shared `grid-template-columns` is the same percentage track with one source of truth.

Built: nothing yet.

## Step 3 - Read the state specimen

Read: `Temporary/Corca/Specimens/States.html`.

Took: the state vocabulary, cell by cell - line at rest, hover, selected, empty, meta, prose; call
pending, done, failed, denied, background; result chip, expanded, empty, truncated, binary, shared;
step open, collapsed, running, failed, nested; job open, settled, killed, instant; reference
outbound, inbound, dangling; interaction focus, keyboard, insert, append. The focus cell is a chip
with a soft ring, the job cell is a track with a fill, and the boundary cell is a label between two
rules.

Decided: the page needs a named state for every control it keeps, not a hover colour on each box.
The job track's fill and the focus ring are the two most reusable. Rejected: the red and amber local
rules (`failed`, `denied`, `dangling`). This page has no failure, no denial, and no dangling
reference; importing the colours would be set dressing. The site's one sanctioned second hue is
`--color-warn`, and it stays unused here.

Built: nothing yet.

## Step 4 - Read the session specimen

Read: `Temporary/Corca/Specimens/Session.html`.

Took: the three-zone session shell, the rail row that carries `data-on` for the current step, the
tab pair at the top of the rail, the document line as a gutter number plus a body, the inspector's
five tabs with an underline for the selected one, the object card's left-bordered key/value rows,
and the pending dot with its pulse.

Decided: the sheet's own session machine already exists as an island, so this specimen's lesson is
the rail row's current state and the inspector's tab underline - both are selection, not decoration.
Rejected: the pill-shaped rail tabs and the floating composer with a shadow. The sheet is a
document, not an application shell; a composer on a study sheet would be a control that does
nothing.

Built: nothing yet.

## Step 5 - Read the plugin specimen, which already speaks the site's tokens

Read: `Temporary/Corca/Specimens/Plugin.html`.

Took: the triptych geometry (default, interjection, result) and the line grammar translated into the
site's own tokens: a 28px gutter, a body with the tool in mono and a hairline underline, a result
reference pushed right, a denied row with a 2px warn edge, a pending row with an accent-soft fill
and a pulsing dot, a dashed seam box, and a pipeline stage lit by an accent border.

Decided: the artifacts band is this triptych - baseline, the rewrite, the explanation - and the
middle panel is the interjection, so it gets the accent. The plugin specimen proves the borrow can
be done with the site's tokens only, so the page can take the geometry without taking a single
foreign value. Rejected: the warn badge. The page's one warning-shaped fact is the no-op, and an
absence is not a warning.

Built: nothing yet.

## Step 6 - Read the trace prototype

Read: `Temporary/Corca/Specimens/Trace-Prototype.html`.

Took: the document's gutter and its hover band with the lifted body (the paint-order trap, written
out); the gutter chevron that appears on hover; the reasoning block behind a click; the lane row
with a bar whose `left` and `width` are percentages of the run; the inspector's field stack; the
composer that grows on `:focus-within`.

Decided: the paint-order trap is the first thing to port, because the sheet's rows will get a hover
band and a static child would disappear under it. The lane's percentage fill becomes the stage
axis's live span. Rejected: the fixed three-column shell and the composer. The manual is one column
with a single embedded machine; adding rails would duplicate the machine's own layout.

Built: nothing yet.

## Step 7 - Read the observatory

Read: `Temporary/Corca/Specimens/Observatory.html` (markup and CSS; the event payload is data, not
design).

Took: the explorer tree's current row (`data-active` with an accent-soft fill and an accent label),
the group label with a count, the family pill as colour-as-data, the mode glyphs, the inspector's
tab row, the object card's 26px glyph plate and its left-bordered rows, the schema row's hover band,
the pipeline strip with a passed stage, and the lane's percentage fill.

Decided: the current-row marker is the one to take for the ledger list and the sibling list, because
those two lists are the same six modules in two forms and the current one should read as one object
across both. Rejected: colour per tool family and the glyph-per-mode vocabulary. The page has one
family (the six normalizers) and no tool taxonomy to colour.

Built: nothing yet.

## Step 8 - Read the measured anatomy and the token mapping

Read: `Temporary/Corca/Curated/Components.md`, `Temporary/Corca/Curated/Design-Tokens.md`.

Took: the seven rules - one accent, one dark surface, hairlines not borders, radius tells you what a
thing is, the measure is sacred, the band paints above static content, every hover is an affordance.
Also the 720px measure with a 35px gutter, the empty node as the only dark rectangle, the node type
scale with its tracking curve, and the two-tone headline where the frame is grey and the claim is
black.

Decided: the page's accent budget is the real problem, not its absence. The current sheet accents
the diamonds, every replace exit, the ledger panel, both plates, every lamp, the chain's own hops,
the caption keys and the modes at once, so no accent means anything. The pass spends the accent on
five meanings only: the selected mode, the live path, the current row, the primary artifact, and the
proof plate's copy control. Rejected: the radius ladder (the site is square), the Geist and Peano
faces, the oklch palette, and the 720px measure for the mono tables - a seven-column track needs the
sheet's full width.

Built: nothing yet.

## Step 9 - Read the interaction model and the representations

Read: `Temporary/Corca/Curated/Interaction-Model.md`, `Temporary/Corca/Curated/Representations.md`.

Took: the document as the unit, the block as the addressable container, the node as an object with
an identity that survives its rendering, the split between structure and appearance, the hint
grammar (preview, accept, ignore, scope, invalidate, recover), and the rule that per-object colour
is data. The representations note's table of what becomes interactive is the most useful page: the
line on hover, the node on click, the object list in the panel, the suggestion on typing, the hint
on `=`.

Decided: the node payload is a second rendering of the same record, not new information, so it can
repeat the legend's words without inventing a fact. The "current" identity is carried by one marker
(a lamp) everywhere the object appears. Rejected: colour per variable - the page's identities are
six modules and one hook, and six hues would be decoration; the site has one accent and the page
keeps it.

Built: nothing yet.

## Step 10 - Read the state walk and the trace model

Read: `Temporary/Corca/Curated/State-Walk.md`, `Temporary/Corca/Curated/Trace-UX-Model.md`.

Took: the line state table - rest, hover, selected, collapsed, running, failed, referenced - and the
non-negotiables: one accent, one dark surface, every line addressable, references as chips, output
elsewhere, collapse as the default gesture for anything derived. Also the gutter as the address and
the band as the selection.

Decided: the decision spine's condition is derived content (it explains a branch, it is not the
branch), so it belongs behind a disclosure; the exits are the branch and stay visible. This is the
site's own Flow rule ("the row is the picture; the note is the reason") applied to the spine.
Rejected: a three-column trace layout for the sheet. The sheet is a study document; its one
three-column machine is the session island under Expand, and duplicating it would be the
anti-combination the compositions note names.

Built: nothing yet.

## Step 11 - Read the compositions and the anti-combinations

Read: `Temporary/Corca/Compositions.md`.

Took: the operators - stack, split, triptych, diff pair, timeline, ladder, fork, matrix - and the
anti-combinations: two pictures of one fact, a badge where a line would do, a matrix with one axis.
The plugin recipes are a reminder that each band should have one dimension the prose cannot carry.

Decided: the artifacts band is a diff pair inside a triptych (baseline, the rewrite, the
explanation); the pair band is a ladder (one code point, one replacement, one reader); the registers
are a matrix of two axes (the register and the leaf); the spine is a disclosure list; the seam band
is two forms of one list. Rejected: adding a sequence under the dispatch chain (the chain is already
an order), and adding a second diagram of the two worlds.

Built: nothing yet.

## Step 12 - Read the overtrue compositions for their micro-mechanics

Read: `~/Developer/Documentation/Module/ui/src/registry/overtrue/event-timeline.tsx`,
`trace-waterfall.tsx` (structure), `detail-list.tsx`, `filter-bar.tsx` (the chip and focus rules),
`command-palette.tsx` (the focused row and the key hint), `tree-view.tsx` (the row and current
markers), `json-viewer.tsx` (copy on the focused node), `log-stream.tsx` (the live tail),
`radial-gauge.tsx` / `activity-rings.tsx` (structure only), `metric-group.tsx`, `stat-card.tsx`,
`status-badge.tsx`, `ribbon-card.tsx`, `notification-center.tsx` (structure), `deploy-pipeline.tsx`
(the stage states), `steps.tsx`, `heatmap-chart.tsx`, `bullet-chart.tsx`, and
`~/Developer/Documentation/Module/ui/src/components/overtrue/segmented-control.tsx`.

Took: the radio group as the correct primitive for a one-of-four view switch (segmented-control);
the readout anchored at the value's percentage with a focus-visible twin (bullet-chart); the rail,
marker and connector with a current marker (event-timeline, steps); the row that carries
`data-selected` and draws its ring on the row, not the item (tree-view); the divided label/value
list (detail-list); the dot that means a state and the live pulse (status-badge); the 1px-gap grid
that draws dividers with the background (metric-group); the focused row and the key hint
(command-palette); the copy action on the focused node (json-viewer); the stage states
(deploy-pipeline).

Decided: the mode row becomes a real radio group, so selection is native, arrow keys work, and the
focus ring has something to sit on. The register grid and the meta strip borrow the 1px-gap divider
because it wraps without a broken first-of-row border. The stage payload becomes an inspector strip
with a default subject rather than a popover per node: one slot holds both worlds' reading of the
stage, so the compare is one object, the track never shifts, and the first and last stages cannot
push a plate past the canvas edge. Rejected: the pulse on a static sheet (motion that explains
nothing), the semantic status palette, the pill radius, the shadows, and any new component: every
mechanic is rebuilt in the sheet's own classes.

Built: nothing yet.

## Step 13 - Read the site's own grammar before inventing a new one

Read: `Site/Source/Component/Flow.astro`, `Site/Source/Stylesheet/Component/Flow.scss`,
`Site/Source/Stylesheet/Component/Line.scss`, `Site/Source/Stylesheet/Component/SessionRecord.scss`,
`Site/Source/Stylesheet/Component/Lane.scss`, `Site/Source/Component/CopyButton.tsx`,
`Site/Source/Stylesheet/Component/CopyButton.scss`, `Site/Source/Stylesheet/Material.scss`,
`Site/Source/Stylesheet/Global.css`, `Site/Source/Layout/Base.astro`,
`Site/Source/Component/SessionView.tsx`, `Site/Source/Component/SessionRecord.tsx`.

Took: the house disclosure - Flow puts a row's reason behind a `why` summary so a long flow reads as
labels, not sentences; the 40px index track; the 2px left edge whose colour is the row's kind; the
dotted pass and the dashed fail as the site's grammar for "nothing happened" and "quiet". Line.scss
writes the paint-order trap out loud. SessionRecord uses a band and a `data-current` state.
Lane.scss positions spans by percentage and distinguishes kinds by fill weight, not hue. CopyButton
is the one existing island that does something CSS cannot, and CodeBlock mounts it `client:visible`.
Material.scss gives the label mixin, the slab, and the tray. Global.css already zeroes every
animation and transition under `prefers-reduced-motion`.

Decided: the decision condition uses Flow's disclosure grammar verbatim (a `condition` summary under
the row, not a hover-only reveal), and the row keeps Flow's 40px index and 2px edge. The proof plate
is the page's one dark surface, built from `--color-ink` and `--color-surface`, because the ledger
line is the one fact the whole sheet exists to prove. The copy action reuses CopyButton rather than
writing an island. Rejected: a new component file, a new token, a JS island for the mode switch, and
a hover-only condition (it would hide the reason from keyboard users and from print).

Built: nothing yet. The page is still untouched.

## Step 14 - Audited the sheet before changing it

Read: `Site/Source/pages/_Manual.astro`, `Site/Source/Stylesheet/Manual.scss` (the staged versions,
715 and 1064 lines), and the compiled token file `Site/Source/Stylesheet/Global.css`.

Took: the audit method from the state walk - enumerate what the page can show, then find the states
it never renders. The page had eleven bands, all with `padding-block: var(--rhythm-head)`, all with
a 1px `--color-line-strong` top rule, and one hover (the mode pills). Every band weighed the same,
every box was a hairline rectangle, and the accent was on the diamonds, the replace exits, the
ledger panel, both pair plates, the chain's own hops, the caption keys, the lamps, the cards and the
modes at once.

Decided: the work order is tokens and geometry first, states second, interactions third, motion
last, because a state added to a flat box is still a flat box. The audit also fixed the acceptance
list: no band may keep the same top-rule weight as its neighbour, no accent may appear without a
named meaning, and every control must have a focus state that is visible on the thing the eye is
looking at. Rejected: a full page rebuild. The information architecture was right; the pass is
inside the bands.

Built: nothing. The audit is the baseline the next entries measure against.

## Step 15 - Rebuilt the identity band and the spec strip

Read: `Temporary/Corca/Curated/Components.md` (the card and the table), `overtrue/detail-list.tsx`,
`overtrue/metric-group.tsx`, `Site/Source/Stylesheet/Component/SectionHeader.scss` (the house
header).

Took: the 1px-gap divider from metric-group (the background shows through the gap, so a wrapping
grid never leaves a stray first-of-row border); the divided label/value row from detail-list; the
2px opening rule and the gutter from the sheet's own document grammar.

Decided: the six meta facts become a spec strip of six cells, not a run of `key value` pairs
separated by a middot. The run read as prose and gave the package name no room; the strip gives each
fact a label above its value and a divider that survives the wrap. The package mark gets a 72px
plate, the stamp becomes a status plate with a hollow lamp, and the head closes with a 2px ink
rule - the heaviest line on the page, because the identity band opens the document. Rejected:
keeping the meta as one line (it forced the long package name to wrap mid-token with no label
alignment) and putting the stamp in the accent (the stamp is a claim about the drawing, not a live
state).

Built: the head with the mark plate, the title, the subtitle and the lamp stamp; the six-cell spec
strip with the 1px-gap dividers; the 2px ink head rule; the 2px ink panel opener.

## Step 16 - Turned the four mode pills into a radio-driven switch

Read: `components/overtrue/segmented-control.tsx`, `Specimens/Components.css` (`.tab`),
`Specimens/Session.html` (the tab underline), `Curated/State-Walk.md` (the state walk's focus step).

Took: the radio group as the primitive for a one-of-four view switch, the selected fill, the focus
ring on the control rather than on an invisible input, and the press feedback.

Decided: the pills become one segmented track of four native radios. The old anchors had a selected
state only through `:target`, which no screen reader announces and which a reader can lose by
editing the URL; a radio group is announced, arrow-key navigable, and its checked state is the
selected state. The face carries an index, the name, and the chip's lamp; the checked face takes the
accent-soft fill and a 2px accent edge, the unchecked faces take the inset on hover, the press steps
down a pixel, and the focus ring sits inside the face. The disabled state is declared even though no
view is unavailable today, because a mode whose package cannot answer would take it. The panels
switch with `:has` on the checked radio. Rejected: a JS island for the switch (CSS and a native
radio cover it), the 999px pill radius (the site is square), and an underline-only selected state
(the fill is stronger at this size).

Built: the segmented mode track with default, hover, active, focus-visible, checked and disabled
states; the panel `:has` switching; the `sheet-reveal` animation on the panel that arrives.

## Step 17 - Rebuilt the two-world canvas around one axis and one inspector

Read: `Specimens/Flow.html` (the swimlane rail, the axis, the percentage fill),
`Specimens/Trace-Prototype.html` (the gutter and the line band),
`Temporary/Flywheel/PlayForm-Two-Worlds-Four-Graph-Projections.html` (the cross-world counterpart),
`overtrue/bullet-chart.tsx` (the readout), `Specimens/States.html` (the focus cell).

Took: the lane's rail plus track plus axis; the live path as a fill; the cross-world counterpart as
a highlight; the readout's discipline of anchoring the detail to the value; the document gutter.

Decided: both worlds share one `--track` template and one ruler, so a stage is the same column at
every width. The live path is the ruler's 2px accent span from stage 3 to stage 6 and the 2px accent
connectors on those four nodes; the absent stage is a dashed connector and no marker, because
nothing listens there. Each node is a focusable reveal trigger: hover or focus lights the same
column in both worlds and swaps the inspector strip below the tracks. The strip holds both worlds'
reading of one stage - name, kind, bytes, path - so the compare is one object, and it defaults to
stage 3, the seam, so it is never empty. The stage's `sr-only` text carries kind and path for
readers who never hover. Rejected: a popover per node (two popovers for one compare, and a plate
that cannot hold its anchor at the first and last stage), inline percentage positions (the grid
template is the one geometry), and a horizontal scroll container (the vertical rail at 860px is the
responsive state instead).

Built: the ruler with seven ticks and the live span; the two lanes with the shared rail; the
fourteen nodes with hover, focus-visible, current and empty states; the cross-highlight; the
seven-slot inspector strip with the default subject; the caption; the responsive vertical rail.

## Step 18 - Rebuilt the artifact cards as a diff pair

Read: `Specimens/Plugin.html` (the triptych), `Curated/Compositions.md` (the diff pair),
`Specimens/States.html` (the card and the focus cell).

Took: the triptych geometry (default, interjection, result) and the diff pair's one-mark comparison;
the card as a bounded object; the focus ring on the card.

Decided: the three cards keep their order and gain a `before`/`after` tag on the two artifacts, the
value at the largest mono step, and the explanation as a key/value list. The PlayForm card is the
primary artifact, so it gets the accent edge and the accent value, not a full accent fill - the fill
would spend the accent on a whole panel for one fact. A card is a reading surface, not a button: it
lifts 2px on hover or focus, its top edge grows a 2px bar (ink for the neutral cards, accent for the
primary), and its note steps from muted to ink, so the explanation is what the focus state reveals.
Rejected: clamping the notes (they already fit two lines; hiding them would be theater), a cursor
change or a press state (the card does nothing when pressed), and the accent fill on the primary
card.

Built: the triptych with the before/after tags; the card hover and focus lift, the growing top edge,
the note emphasis; the fact list with hairline dividers.

## Step 19 - Rebuilt the decision spine as a disclosure list

Read: `Site/Source/Component/Flow.astro` and `Flow.scss` (the `why` disclosure, the 40px index, the
2px kind edge), `overtrue/tree-view.tsx` (the current row), `overtrue/event-timeline.tsx` (the
marker), `Specimens/States.html` (the focus cell).

Took: Flow's rule that the row is the picture and the note is the reason, so the reason sits behind
a disclosure; the 40px index track; the 2px left edge; the current-row marker; the diamond as the
decision shape.

Decided: each decision is a `<details>` whose summary keeps the name and the exit chips and whose
body holds the condition under a `condition` key. The exits stay visible because a branch is the
spine's content; the condition is the reason and is the one thing the row expands to show. The first
row is open so the pattern is taught. The row's left edge is ink when open, the diamond fills ink,
and the caret rotates; the exits carry their tone as geometry (filled square rewrites, hollow
passes, dashed strips) rather than as accent. The summary gets the paint-order band: an absolutely
positioned `::before` behind children lifted to `z-index: 1`, with the trap written in the comment.
The summary also gets an active press, a focus-visible ring inside the row, and a hover band.
Rejected: a hover-only condition (keyboard and print lose it), a static condition column (the task
asks the row to expand, and the reason is derived content), and accent for the open row (the accent
keeps meaning the live path).

Built: the spine with eight details rows; the summary grid with the index, diamond, name, exits and
caret; the condition body; the tone squares; the paint-order band; the open, hover, focus-visible
and active states.

## Step 20 - Rebuilt the registers as a leaf grid with a default plate

Read: `Specimens/Components.css` (the chip, the lamp, the tooltip), `overtrue/detail-list.tsx`,
`overtrue/tree-view.tsx` (the row states), `Specimens/States.html` (the focus cell).

Took: the 1px-gap cell grid from metric-group; the lamp as the state dot; the plate above the target
from the tooltip.

Decided: the two registers are two leaf grids in one tray each. A leaf carries a 5px lamp (filled
accent when the default is on, hollow when it is off), the name in mono, and a plate above it that
reads `default: on` or `default: off` on hover or focus. The plate is the whole interaction: the
leaf is informational, so it gets no hover band, no cursor change and no selected state. The default
is also in the accessibility tree as a visually hidden span, so the plate is an enhancement and not
the only carrier. Rejected: accent-soft fills for the on leaves (half the grid would be accent), a
permanent default column (the register label already says the defaults, and a column would double
the width), and a click-to-toggle control (the page is a study sheet, not the config editor).

Built: the two register grids; the leaves with default, hover, focus-visible, on and off states; the
default plates; the inset focus ring.

## Step 21 - Rebuilt the seam as two forms of one list, with a cross-highlight

Read: `Specimens/Observatory.html` (the current row), `Curated/Representations.md` (one identity
across forms), `Specimens/States.html` (the reference chips), `overtrue/status-badge.tsx` (the dot).

Took: the current-row marker; the rule that one object keeps one identity in every rendering; the
dot as a state signal.

Decided: the six sibling cards and the six ledger lines are the same six modules in two forms, so
the pointer on either form lights the other, and the current module keeps the accent in both. The
sibling card carries the lamp; the ledger row does not, because the row is a line and a lamp on six
lines would be noise. Both current items take `aria-current`. The cross-highlight excludes the
current item so the accent is never overwritten by a hover. Rejected: merging the two lists into one
(the point is that the order and the proof are different views of the same fact), and the accent on
every sibling.

Built: the sibling cards with the lamp and the current marker; the ledger rows with the current
marker; the six-by-six cross-highlight; the aria-current states.

## Step 22 - Rebuilt the dispatch and made the ledger line the page's one dark surface

Read: `Specimens/Trace-Prototype.html` (the line and gutter), `Specimens/Plugin.html` (the seam
box), `Site/Source/Component/CopyButton.tsx` and its stylesheet,
`Site/Source/Component/CodeBlock.astro` (the `client:visible` mount).

Took: the seam contract as a key/value tray; the chain as numbered rows; the dark surface as the one
place where work is happening; the copy island as the one thing CSS cannot do.

Decided: the seam table and the chain stay, but the chain's own hops take a 2px ink edge and the
borrowed hop a dashed edge, and the step numbers become plates. The ledger line becomes a dark plate
built from `--color-ink` and `--color-surface` - the one dark surface, because the line is the fact
the sheet exists to prove - with the copy control inside it. The copy control reuses CopyButton
rather than writing an island; it is the only new client component, and it is mounted
`client:visible` because the panel is hidden until Explain is chosen. Rejected: the accent-soft
ledger panel (the accent was doing the proof's work), a continuous vertical rail behind the chain
(it would dangle past the last hop), and a hand-written clipboard handler.

Built: the seam tray; the chain rows with the ink/dashed edges and the step plates; the dark ledger
plate; the CopyButton with its hover, active, focus-visible and copied states.

## Step 23 - Rebuilt the split, the pair, the reach, the knob and the run

Read: `Specimens/Plugin.html` (the split and the pipeline stage), `Curated/Compositions.md` (the
diff pair and the absence), `Specimens/States.html` (the job bar and the focus cell),
`Specimens/Observatory.html` (the pipeline strip).

Took: the ruled two-column split; the pair as a diff; the state chip; the absence as a dashed, inset
surface; the dim-and-lift for the run.

Decided: the library/package split becomes two ruled columns with a 2px ink label rule (accent on
the package side) and a square marker per item, not two more boxes. The pair becomes a diff:
pointing at one plate dims the other and darkens the arrow. The reach's off channel becomes dashed
and inset, with a hollow lamp and a dashed state chip; the on channels keep the solid border and the
accent lamp. The no-op becomes the page's absence: dashed, inset, quiet. The run keeps the dimming
but adds `:focus-within`, so a keyboard reader gets the same un-dim as a pointer. Rejected: a toggle
for the pair (a hover compare is enough and needs no state), a badge for the no-op (an absence is
not a warning), and a boxed card for the library/package split (the ruled columns differentiate it
from the artifact triptych by geometry).

Built: the owned columns; the pair with the dim compare; the reach channels; the knob and the dashed
no-op; the run's focus-within dimming; the closing foot.

## Step 24 - Added the motion and the reduced-motion guard

Read: `Curated/Components.md` (the measured 90ms and 120ms), `Site/Source/Stylesheet/Global.css`
(the motion tokens and the global guard), `overtrue/steps.tsx` (the rail and marker transitions).

Took: the site's `--motion-crisp` and `--motion-snap` with their easing curves; the principle that
motion explains a change; the zero-duration global guard.

Decided: two keyframes only - `sheet-reveal` for a panel arriving and `sheet-subject` for the
inspector changing subject - plus transitions for the hover band, the card lift, the pair dim, the
caret and the leaf plate. Nothing loops, nothing pulses, and nothing moves without a state change.
The local reduced-motion block removes the two animations, the transitions and the press transforms,
so a reduced-motion reader gets the end state without a jump. Rejected: the pending pulse (the page
has no pending work), the shimmer, the gradient, and any animation longer than the snap token.

Built: the two keyframes; the state transitions; the reduced-motion guard.

## Step 25 - Verified with the tools the brief allows

Read: the compiled stylesheet, the visible text of the staged page and the new page, the file bytes.

Took: the sass compiler as the stylesheet arbiter, an HTML parser as the markup balance check, a
word-level text diff as the fact check, and a byte scan for non-ASCII.

Decided: the site build is out of scope by the brief, so the verification is the stylesheet compile,
the markup balance, the text diff and the ASCII scan. The compile passes, the only unbalanced tag is
`</Base>` (the parser reads `Base` as the void `base`, a known artifact), the visible text differs
by additions only plus the eight conditions moved from the summary column into the disclosure, and
the two files are ASCII with entities at every boundary. No screenshot was taken, because none was
asked for and the build is not the arbiter here. Rejected: running the dev server to look at the
page (the brief forbids the build) and trusting the formatter as the only check.

Built: no files. The verification notes are the step's output.

## Step 26 - Parameterized the run, and cut its content to the activation

Read: `Site/Source/Component/SessionView.tsx`, `SessionTree.tsx`, `SessionDocument.tsx`,
`LaneStrip.tsx`, `InspectorLive.tsx`, `Site/Source/Content/Session.ts`, the live page at
`http://localhost:9999/manual/`, and the plugin's real ledger at
`~/.dsh/playform/hook-dsh-normalize-ellipsis.log`.

Took: the island's own grammar - the lane, the tree, the document, the inspector, the face switch -
as the frame for the activation. The user's correction was that the run component is the right
component and is shown where it should be, but it reads the trace page's forty-record session
instead of the manual's own activation, and the page needs less content. The mechanic is therefore
not a new machine: it is a `Data` prop on the shared machine, a one-turn run behind it, and the face
switch as the before/after control.

Decided: add a `SessionData` interface and a `Session` default to `Content/Session.ts`; give the
helpers an optional data argument; add `Data?` and `Start?` to `SessionView` and `Data?` to the
tree, the document, and the lane, so the trace and package pages keep the shared session unchanged.
Create `Content/Manual.ts` with one turn, one step, three records (the context, the assistant
message the hook rewrote, and the read of the replacer), and one plugin; the assistant's `Default`
outcome carries the U+2026 code points and the `Family` outcome carries the three ASCII dots, the
`normalized` state, the two-code-point note, and the plugin's effect. The manual page mounts
`<SessionView Data={Manual} Start={7} client:load />`, so the inspector opens on the record the hook
rewrote. The spot's marked record becomes `[data-current="true"]` rather than the family gate's
`__by`, because the manual's current record is the activation; the band title becomes "One turn, the
hook brought out" and its note "one turn - the rewrite selected - the rest muted". The durations are
authored at 1.2s, 6s, and 0.8s so the lane's axis reads 0s, 2s, 4s, 6s, 8s instead of rounding a
1.4s run to three identical ticks. Rejected: editing the shared session (it would change the trace
and package pages), copying the SessionView into a manual-only component (the shared machine is the
simplicity the user asked to keep), removing the island (the user wants it shown), and cutting the
page's bands (the "less content" is the run's forty records, not the study sheet's information
architecture).

Built: the `SessionData` type and the `Session` default; the optional data arguments; the four
component props; `Content/Manual.ts`; the manual's mount and the spot's current-record marker; the
band title and note. The live page renders the activation: the lane at 8s with one step and three
records, the tree with one turn, one step, three records and one acting plugin, the document with
records 04, 07, and 09, and the inspector on 07 showing `Plugin hook-dsh-normalize-ellipsis`,
`Effect rewrote 2 code points to six dots`, `State normalized`, and `Note 2 code points`; the face
switch shows the same record with U+2026 in Default and three dots in Family. The page's HTML fell
from 318 KB to 267 KB. Verified by the user's already-running dev server (a read of the rendered
page, not a build), the stylesheet compile, the ASCII scan, and the one-`h1`/no-`{" "}` checks.

## What the pass learned

1. **Audit the accent before you add a state.** Count every place the accent appears and name the
   meaning it carries. If two meanings share it, or one meaning appears eleven times, the page is
   flat regardless of how many hovers you add. Spend it on five meanings at most, and make the rest
   carry weight through geometry.

2. **Give each band one geometry and one rule weight.** A tray, a triptych, a ruled spine, a cell
   grid, two columns, a display pair and an embedded machine are seven different pictures; a page of
   identical hairline boxes is one picture repeated. Let 2px ink open a page or a panel, 1px strong
   separate bands, and 1px line divide the inside of a machine.

3. **Use the native element for the state.** A radio group for one-of-N, `<details>` for a
   disclosure, `:has` for the dependent view. They bring keyboard behavior, announcement and the
   selected state for free. Write a JS island only for what CSS genuinely cannot do - here, the
   clipboard.

4. **The paint-order trap is a required comment and a required z-index.** Any absolutely positioned
   band that marks a row needs its content at `z-index: 1` or higher, or the band hides the text it
   is pointing at. Write the trap in the stylesheet next to the rule so the next agent does not
   remove the lift as redundant.

5. **Put the focus ring on the thing the eye is on.** The stage node's ring belongs on its marker,
   not around the whole column; the mode's ring belongs on the face, not on the hidden input; the
   decision's ring belongs inside the row. A ring around a whole cell reads as a selected box and
   loses the state it is meant to show.

6. **A hover that only decorates is a defect; a hover that reveals a fact is an affordance.** Give
   an informational target a payload plate and no band; give a selectable row a band and a current
   marker. The difference tells a reader what can be clicked without a cursor change.

7. **An inspector needs a default subject.** If a strip can be empty, start it on the page's subject
   (here, the seam at stage 3), and let the pointer and the keyboard move it. An empty inspector is
   a missing state, not a neutral one.

8. **Read the site's own components before porting a foreign one.** Flow already has the disclosure,
   the 40px index and the 2px kind edge; Line already has the band and the trap; Lane already has
   the percentage fill; CopyButton already has the island. Reusing them is cheaper and keeps the
   page in the house grammar; the foreign corpus supplies the mechanic, not the markup. When a page
   needs a different subject from a shared machine, parameterize it with a default - a `Data` prop
   and the module's own run as the fallback - rather than copying it, editing the shared data, or
   deleting it. The component is the simplicity; the data is the content, and the content is what
   should change when a page needs less of it.

9. **Verify with the tools the brief allows.** Compile the stylesheet, balance the markup with a
   parser, diff the visible text to prove the facts survived, and scan the bytes for non-ASCII. A
   visual check that needs a forbidden build is not a check; say what you could not verify.

10. **Write only the states the control has.** A reveal target has no selected or disabled state; a
    reading surface has no press. Inventing them makes a document look clickable and teaches the
    reader the wrong affordance. Declare the states that are expressible (a disabled mode, an absent
    stage) and say in the log why the rest are absent.
