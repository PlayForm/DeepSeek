# Deck

## The claim

The axes a reader turns, stacked as cards: the first one readable, the rest peeking at the bottom and
right with their indices on the exposed edge, and the hand fans on hover so every label stays in
reach. The machine shows the shape of a choice rather than the table of its values.

The machine answers: **which axes does a reader turn, and what does each one do?**

## The sources

| Source | What was taken |
| --- | --- |
| `Site/Source/Component/Deck.astro` | The stack: one card per axis, the label and the two-digit index in the head, the body under it, and the `--index` and `--count` custom properties the stylesheet uses for the offsets. |
| `Site/Source/Stylesheet/Component/Deck.scss` | The geometry: a 320 by 210px stack, each card inset 8px per index, a 16px smaller card, `z-index: calc(10 - var(--index))`, a 64px spread and a 4 degree rotation on hover, and the first card's 2px accent left edge. |
| `Site/Source/pages/setup.astro` | The mount: the `Axis` section, with three axes chosen by name from `Axis` and the body taken from each one's `Turn`. The `Grid` below the deck holds all eight. |
| `Site/Source/Content/Axis.ts` | The three bodies the mounted instance prints, and the five the deck leaves to the grid. |
| `Site/Source/Library/Preview.astro` | The dev mount and its two legend labels, `Stack` and `Top card`. |
| `Temporary/Corca/Curated/Components.md` | The card: a 1px hairline, a small radius, a shadow that floats it. The deck's cards are that grammar with an offset instead of a shadow. |
| `Temporary/component-page-composition-recipes.json` | M11.R03, profile review summary: a value and a change affordance per line, with the change returning to the relevant input. The deck is the shape of that review without the affordance, because the setup page's grid is the reference. |
| `~/Developer/Documentation/Module/ui/src/registry/overtrue/ribbon-card.tsx` | The card as a container with a head and a body, which the deck borrows, and the ribbon as a badge on it, which the deck refuses: a deck card has no status to report. |

The borrow is a mechanic (a small set of choices shown as objects rather than rows), a geometry (a
stack with a per-index offset), and a state model (stacked, and fanned; the first card is always the
readable one).

## The copy

The section that mounts it prints `Axis` and `The eight axes a reader actually turns, across the
family. The exact field and default live on each package's page; this is the shape of the choice.`

The machine prints, in order:

1. `The axes, stacked` (the list's label, for assistive technology)
2. `enabled`
3. `01`
4. `on: the listener stops returning the payload untouched`
5. `threshold`
6. `02`
7. `a smaller number: the hook acts sooner and on more results`
8. `replacement`
9. `03`
10. `another character or string: the normalizer writes what you name`

The machine prints no figure beyond the index. The three cards are the first three of the eight axes
the grid below carries, and the deck does not print which three it chose.

## The layout

```
+----------------------------------------------------------------------+
| DECK                                                                 |
| three axes as cards, the first readable, the rest peeking            |
+----------------------------------------------------------------------+
|      +---------------------------------------------------+           |
|      | enabled                                        01 |           |
|      | on: the listener stops returning the payload      |           |
|      | untouched                                         |           |
|      +---------------------------------------------------+           |
|        +---------------------------------------------------+         |
|        | threshold                                      02 |         |
|        | a smaller number: the hook acts sooner            |         |
|        +---------------------------------------------------+         |
|          +---------------------------------------------------+       |
|          | replacement                                    03 |       |
|          | another character or string: the normalizer       |       |
|          +---------------------------------------------------+       |
| at rest: 8px per index, 16px inset. on hover: 64px spread, 4 degrees |
+----------------------------------------------------------------------+
```

The sketch is 72 columns. The stack is capped at 320 by 210px, so three cards fit with 16px of
exposed edge each; the first card carries the accent left edge and the highest `z-index`, and every
card keeps its index in the exposed edge. On hover the cards fan to 64px apart and 4 degrees each,
and the first card stays on top.

## The machines

Deck adds the shape of a choice. `Grid` below it is the reference table of the same eight axes, and
`Configuration` on a package page is the exact field with its default; the deck is the hand a reader
turns before either.

| Neighbour on the same page | What it already says | What Deck must not say |
| --- | --- | --- |
| Grid | all eight axes, what each ships as, and what turning it does | a fourth card, or a card per row |
| Configuration | the exact field, type, default, and meaning | the default as a card body |
| StatBand | the counts above the page | the axis count |
| Diagram | the path a reader takes, install to confirm | the deck as a step of that path |

When the deck is given fewer than two cards it renders a single card with no offset, which is the
honest shape for a stack of one.

## The decisions

| Decision | The alternative rejected | Why |
| --- | --- | --- |
| Three cards | All eight axes as cards | A hand of eight is unreadable at 210px. Three is a hand a reader can hold, and the grid below carries the full matrix without pretending to be a deck. |
| A stack | A carousel | A carousel hides the second card entirely and needs a control. A stack shows every card's edge and index, so the set is visible before anything moves. |
| The fan is a hover | A click to expand | The peeking edges are not enough to read the second and third bodies. A hover exposes them without a click and without a control the page would have to style. |
| The first card keeps the top `z-index` | Rotating the first card away with the rest | The readable face must never go behind another card. The fan moves the others aside; the first one stays put. |
| The accent edge is on the first card only | An accent edge on every card | The stack's order is the claim, and the accent marks the readable card. Eight accents would mark nothing. |
| The cards are not selectable | A click that opens the axis's package page | The deck is the shape of the choice; the grid below is the reference. A link would turn the deck into navigation and the fan into a menu. |
| The label is mono and the body is prose | Both in prose | The label is a field name a reader will meet again in a configuration table. The mono face says so, and the body stays a sentence. |
| No default value on a card | Printing each axis's shipped default | The default is a fact about a package, not about the axis. The grid prints `Ships as`, and the package page prints the exact value. |
| Motion is guarded, the deck is complete without it | A fan that requires motion to read | The indices are visible at rest, so the deck states its order with no motion at all. The fan is an affordance, and `prefers-reduced-motion` removes it without removing the content. |

## The history

### v1 - 2026-10-31

Built on 2026-10-31. Mounted on `/setup`, inside the `Axis` section, above the grid of all eight
axes, and on the dev component route `/library/deck`. The page that proves it is the setup page,
where the three cards sit directly above the table that holds the other five.

What is not drawn yet: the other five axes, which the grid carries as rows, and the shipped default
of each of the three cards, which the grid's `Ships as` column states. The deck shows what turning an
axis does; it does not show what the axis is set to before anyone turns it.
