# The component matrix

A component is a small product. It has dimensions, a lifecycle, and a set of systems that each
contribute something it cannot do alone. This file holds the method; one dossier per component holds
the evidence.

## The dimensions

| #   | Dimension   | The question it answers                                      |
| --- | ----------- | ------------------------------------------------------------ |
| 1   | Structure   | what parts, in what nesting, at what measured geometry       |
| 2   | State       | every state it can be in, and every transition between them  |
| 3   | Data        | the shapes it accepts, their cardinality, empty and overflow |
| 4   | Time        | appearance, transition, reveal, staleness, load              |
| 5   | Interaction | pointer, keyboard, focus, selection, drag                    |
| 6   | Composition | what it nests into, what nests into it, which slots it fills |
| 7   | Rendering   | server, island, hydration, progressive enhancement           |
| 8   | Access      | roles, labels, announcements, reduced motion, print          |
| 9   | Style       | which tokens it consumes, which variants, which densities    |
| 10  | Failure     | what it shows when the data is missing, partial, or slow     |
| 11  | Evidence    | the pages that use it, the screenshots, the tests            |
| 12  | Evolution   | version, deprecation, what supersedes it                     |

## The stages

Every dimension passes through seven stages, in this order:

`spec` - what it must be, in one paragraph. `prototype` - the smallest thing that shows the shape.
`build` - the component and its stylesheet, tokens only. `state` - every state drawn, in the dev
library. `compose` - mounted on a page, inside a real machine. `verify` - the checks pass and the
page was read in a browser. `document` - this dossier's cell filled, with a link to the evidence.

Eighty-four cells per component. The work is a pass over a **row**, never a pass over a component:
the `state` row across the inventory is one pass, the `compose` row is the next, and each pass is
shallow and complete.

## The systems a component depends on

| System                                       | What it owns                                           |
| -------------------------------------------- | ------------------------------------------------------ |
| the token layer (`Global.css`)               | every colour, radius, font, and spacing value          |
| the build (`Astro`)                          | the server render, the route, the static output        |
| the runtime (`Solid`)                        | anything that must respond after load                  |
| the readers (`Source/Library/*.server.ts`)   | the data the component draws                           |
| the checker (`Scripts/Check.ts`)             | links, structure, spacing, plurals                     |
| the registry (`Source/Library/Component.ts`) | the props, states, and densities the library claims    |
| the library (`/library/`)                    | the permutations, visible to a lane before it composes |
| the tests (`Source/Test/`)                   | the contract, where a component has one                |

A component that ignores one of these is a component that will be rebuilt.

## The recursion

A `Line` is a `Gutter`, a `Badge`, and a body. A `Trace` is `Line`s. A session is a `Trace` plus
`Lane`, `Ribbon`, and `Inspector`. The matrix applies at every level with the nouns changed: a
machine's "structure" is its composition of atoms, a page's "state" is the reader's path through it,
a plugin's "data" is the records it writes.

## The dossiers

| Component       | State   | Composition | Evidence                                               |
| --------------- | ------- | ----------- | ------------------------------------------------------ |
| [Line](Line.md) | partial | partial     | the trace document, the plugin pages, the harness page |
| Gutter          | -       | -           | -                                                      |
| Trace           | -       | -           | -                                                      |
| ...             |         |             |                                                        |

A cell is `-` when nothing is known, `partial` when some states are drawn, and `done` when every
state and every composition is drawn and evidenced. The table is the work queue: the next pass takes
a column, not a row of components.
