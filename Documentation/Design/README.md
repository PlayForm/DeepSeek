# The design lab

Every component, machine, and page gets a **storyboard**: a Markdown file that holds the design as a
drawing, the decisions behind it, the research it borrows from, and the history of its iterations.
The storyboard is written before the component and updated after it, so the design survives the
context that produced it and a later agent can implement, extend, or overrule it.

The lab is the folder of storyboards plus the dev route that renders them. It is where decisions are
made and where they are verified; the `.astro` and `.tsx` files are what a decision becomes.

## The layers of iteration

A page is not one decision. It is at least four layers, and each has its own storyboard section and
its own history:

| Layer | What it decides | Where it lives |
| --- | --- | --- |
| **Research** | what the source says, and which corpus the shape borrows from | the storyboard's `## The sources` section |
| **Copy** | the claim, the caption, the labels, the one sentence a reader leaves with | the storyboard's `## The copy` section |
| **Design** | the layout, the machines, their order and proportion | the storyboard's `## The layout` section |
| **Implementation** | the component, the data, the mount | the code, and the storyboard's `## The history` |

A storyboard is done when all four are filled and the last history entry names the page that proves
it. A storyboard that has a layout and no copy is a sketch; one with copy and no layout is a draft.

## The storyboard schema

1. **The claim** - the sentence and the question the page answers.
2. **The sources** - the files read, the corpus borrowed from, and what was taken from each.
3. **The copy** - every string the page will print, in order, so the words are decided before the
   markup.
4. **The layout** - the page in ASCII, one band per machine, named.
5. **The machines** - what each adds, and the component that draws it.
6. **The decisions** - the choices that could have gone the other way, and why they did not.
7. **The history** - dated, appended, never rewritten.

## The lab route

`/design/` is a dev-only route that lists the storyboards and renders one at a time, so a reader can
compare the drawing with the page it produced. The route is gated the same way the library is: it
never ships.

## The iteration protocol

1. **Pick the subject** - a component, a machine, or a page.
2. **Write the storyboard** - sources, copy, layout, machines, decisions.
3. **Render it in the lab** - the storyboard is now readable next to the built page.
4. **Implement** - the code follows the layout; a deviation is a decision and gets its own line.
5. **Append the history** - date, what changed, why, and the page that proves it.
6. **Repeat** - a later agent starts at step 1 with the storyboard already in front of it.

## What the storyboards are for

They exist because the most expensive failure in this project was a design that lived only in a
conversation. When the context compacted, the design was gone and a lane rebuilt it from a summary,
which is why pages arrived thin. A storyboard is a file: it survives compaction, it can be read by a
lane with no history, and it can be argued with before it is built.

## The views

A plugin page is not one page. It is one page seen from several views, and the views divide into two
kinds, which is the distinction the page must make visible.

**The shared views** are the same for every plugin, because the harness, the conversation, the family,
and the person are the same system whichever plugin is installed. A reader who scrolls from one plugin
to the next stays on the same view, and only the plugin's marks change.

| View | What it shows | Whose perspective |
| --- | --- | --- |
| **Conversation** | the turn as a document: the prompt, the steps, the tool calls, the results, the records | the conversation's |
| **Harness** | the seams, the dispatch mode, the waterfall, the ledger write, the state a run can feed | the harness's, which is the mechanistic reading |
| **Family** | the neighbours at the same seam, the arm order, the prepend discipline, what the twin does | the other plugins' |
| **Person** | what the user sees and does not: the wait, the prompt, the silence, the refusal | the user's |

**The architecture view is not shared.** Every plugin encodes its behavior differently - a gate, a
chain pass, an update stage, a four-tier ladder, a store with a retriever - so the architecture view
is bespoke per plugin and its storyboard draws it. A plugin whose architecture view looks like another
plugin's is a plugin whose page has not been understood yet.

The page renders every view and shows one. The switcher sits under the claim, the views are anchors,
and a reader who follows a link from another plugin's page lands on the same view with a different
plugin's marks - which is the point: the system is shared, the plugin is the difference.

## The sources a storyboard may borrow from

- `Temporary/Corca/` - the specimens, the curated notes, the composition catalogue.
- `Temporary/` - the design contracts, the page recipes, the placement atlas.
- `~/Developer/Documentation/Module/ui/` - the geometry and state models of the advanced corpus.
- `~/Developer/Documentation/Module/deepseek-harness/docs/` - the harness's own behavior.
- `Classic/packages/` and `EffectTS/packages/` - the plugin's source, its `SCHEME.md`, its tests.
- `~/.dsh/skills/` - the skills that carry the rules this repository works under.

Borrow the mechanic and the composition; never the colour, the radius, the font, or the shadow.
