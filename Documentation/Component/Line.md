# Line

The addressable row of a document: a sequence number outside the measure, a kind, a name, and the
record the line carries. It is the atom every trace, conversation, and flow is made of.

Source: `Site/Source/Component/Line.astro`, `Site/Source/Stylesheet/Component/Line.scss`.

## The matrix

| Dimension   | spec    | prototype | build   | state   | compose | verify | document  |
| ----------- | ------- | --------- | ------- | ------- | ------- | ------ | --------- |
| Structure   | done    | done      | done    | -       | done    | done   | this file |
| State       | partial | done      | done    | partial | done    | done   | partial   |
| Data        | done    | -         | done    | -       | done    | -      | partial   |
| Time        | -       | -         | -       | -       | -       | -      | -         |
| Interaction | partial | -         | done    | -       | done    | -      | partial   |
| Composition | done    | done      | done    | -       | done    | done   | partial   |
| Rendering   | done    | -         | done    | -       | done    | done   | done      |
| Access      | partial | -         | partial | -       | -       | -      | partial   |
| Style       | done    | done      | done    | -       | done    | done   | done      |
| Failure     | -       | -         | -       | -       | -       | -      | -         |
| Evidence    | -       | -         | -       | -       | done    | done   | partial   |
| Evolution   | -       | -         | -       | -       | -       | -      | -         |

## 1. Structure

`line` is a grid: `line__gutter` (fixed width, the measure's outside) and `line__body`. The body is
three parts in one flow: `line__kind` (a mono label, uppercase, the record's kind), `line__name`
(the event name as the harness writes it), and `line__slot` (whatever the caller passes, usually the
record's own content). The kind and the name sit on one line; the slot flows beneath when it holds a
block and beside when it holds a phrase.

## 2. State

Drawn today: default, `data-current="true"` (the selected line), and `Foldable` (the chevron on the
gutter, hover only). Not drawn: hover on the line itself, focus-visible for a keyboard reader, a
disabled line, a stale line (a record whose source is gone), a line in a folded parent.

The state machine the component implies: `default -> hover -> current`, and
`foldable -> folded -> expanded`, with `current` reachable from any of them. The library draws the
first three and not the last three, which is why this cell is `partial`.

## 3. Data

Accepts `Seq` (number or string), `Kind`, `Name`, `Foldable`, `Current`, and a slot. The slot is
untyped, so the component can carry a phrase, a badge, a table, a nested list, or nothing.

Shapes in use: a one-line record (the trace document), a record with a result span (the plugin
pages), a record with a nested child list (the session view, in progress), a record whose slot is a
full machine (the flow rows).

Not yet handled: a line with no `Seq` (a continuation row), a line whose `Name` is a path long
enough to overflow, a line with two slots.

## 4. Time

Nothing is defined. The component has no transition, no reveal, and no staleness rule. If the line
should fade when its record is superseded, or reveal its slot on expand, this cell is where that is
specified - and it is empty, so no page should assume it.

## 5. Interaction

`Foldable` renders a chevron that appears on hover. Nothing else is interactive: the line is not a
button, it does not link, and it does not select itself. Selection is the caller's job, which is why
the plugin pages pass `Current` and the trace page passes it from the island.

Missing: keyboard focus, `aria-expanded` for a foldable line, a click target that does not fight a
link inside the slot.

## 6. Composition

Parents: `Trace` (a list of lines), the plugin pages (a mock conversation), the harness page, the
flow (`flow-line` rows are not `Line`s, deliberately - they are a different atom), the session view.

Children: `Gutter` (always), and through the slot: `Badge`, `Term`, `Pending`, `CodeBlock`, a nested
list, or a machine.

The constraint the composition implies: a line inside a line needs the outer one to be `Foldable`,
and no page does that yet.

## 7. Rendering

Server-rendered, no island, no hydration. The only client behaviour a line has is whatever the slot
puts there, which is why the trace page's inspector is an island beside the document and not inside
a line.

## 8. Access

`role="listitem"` on the row, so a list of lines needs a `role="list"` parent - the trace page and
the plugin pages both provide one. The kind is a visual label, not a heading; the name is text, not
a link.

Missing: `aria-current` for the selected line, an accessible name for the fold chevron,
`aria-expanded` on the foldable row, and a print rule (a line should not break across pages).

## 9. Style

Consumes: `--color-line`, `--color-ink`, `--color-ink-faint`, `--color-accent`, `--gutter-trace`,
`--space-*`, `--text-xs`, `--font-mono`, `--leading-*`. No variants beyond the `data-kind` and
`data-current` attributes.

Densities: one. A compact line (for a long document) and a display line (for a single record shown
large) are both plausible and neither exists.

## 10. Failure

Nothing is defined. A line with an empty `Name`, a `Seq` of zero, or a slot that throws would render
as a blank row. The session view is the first caller that will stress this.

## 11. Evidence

`/trace/` - the document, with the inspector island beside it. `/package/[slug]/` - the mock
conversation on the dissected packages. `/harness/` - the turn's stages, one line each. `/plugin/` -
no longer uses it (the section was removed when the invented plugins went).

## 12. Evolution

No version, no deprecation. The line has changed once: `Kind` moved from a `data-kind` only to a
visible label when the plugin pages needed the kind readable without the attribute. A future change
worth naming: a `Dense` prop, if the compact density is built.

## What the next pass does

The `state` column: draw hover, focus-visible, folded, expanded, empty-name, and overflow in the dev
library, then add `aria-current`, `aria-expanded`, and the print rule. That pass makes three cells
`done` and unblocks the session view's nested lines.
