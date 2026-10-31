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

## The folder, when a storyboard grows

A storyboard starts as one file. When it has more than one version, it becomes a folder, because the
history, the screenshots, and the source excerpts are as much of the design as the drawing is:

```
Documentation/Design/<Name>/
  README.md            the current storyboard: claim, sources, copy, layout, machines, decisions
  History/
    V1.md              the complete layout at v1, repeated in full rather than diffed
    V2.md
  Shot/
    V1-1440.png        the built page at that version, 1440 wide
    V1-390.png         and at 390, because a machine that breaks on a phone is not done
  Source/
    <file>.md          the excerpts the storyboard cites, kept so the citation survives a refactor
```

**Screenshots are for the reader, not for the agent.** Every version is captured at two widths and
stored in `Shot/`, and the storyboard embeds them with a relative path. An agent does not read them:
the ASCII drawing is what it implements, and the screenshot is what a person compares against the
drawing. An agent reads a screenshot only when a defect is reported that the DOM cannot explain, and
then it says so in the history.

**The ASCII is a summary, not the design.** A drawing can hide the complexity a corpus offers, which is
why the `## The sources` section names what was taken from `~/Developer/Documentation/Module/ui/`,
from `Temporary/`, and from the harness docs, and why `Source/` keeps the excerpts. The drawing is the
arrangement; the sources are the substance.

**The nesting is the history.** A later agent opens the folder and sees every version, every
screenshot, and every excerpt, in order, without a conversation. That is the point: a design that
lives in a folder survives the context that made it.

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

## The requirements, mapped to the lab

Every request the owner made maps to a layer of the lab and an artefact, so a requirement cannot be
lost between a conversation and a lane. The row numbers are the ones in
`Temporary/Lane/Requirement.md`.

| The requirement | The lab layer | The artefact |
| --- | --- | --- |
| Redesign the site piece by piece (1) | design | one storyboard per page, implemented in order |
| TypeScript and Astro only, Solid islands, deep Sass (2) | implementation | the code, checked by the build |
| Copy rules: short, singular, present-tense (3) | copy | the storyboard's `## The copy`, written before the markup |
| `&nbsp;` at every boundary (4) | implementation | the code, checked by the scan |
| Cloudflare, the submodule, no `../` (5, 26) | implementation | `Package.server.ts`, `Prepare.ts`, the deploy gate |
| Skills in `~/.dsh` and `Documentation/Skill` (6) | research | the skills, updated as the method changes |
| Dev surfaces must not ship (7) | implementation | the `Dev` gate on `/library/` and `/design/` |
| Setup pages address the user (8) | copy | the storyboard's copy for `/setup/` |
| No live session data (9) | design | the simulation, labelled once |
| Mechanistic interpretability (10) | design | the Harness view on every plugin page |
| Mechanistic inter-operability (11) | design | the Family view, and the twin comparison |
| Visual exploration before the cabinet (12) | design | the machines before the chrome |
| Read the plugin code, not the README (13) | research | the `## The sources` section, and the Detail pass |
| Adapt the Corca research (14) | research | the `## The sources` section names the specimen |
| A plugin page demonstrates by change (15) | design | the Conversation view with the plugin toggled |
| Eight showcases, twelve recipes (16) | design | the storyboard per page, the operator table |
| Each plugin's résumé, visually (17) | design | the Showcase dossier per plugin |
| Compound the nav pages (18) | design | the compound map, one storyboard per compound |
| All components, all permutations (19) | implementation | the registry, the library, the design lab |
| The Corca corpus (20) | research | named in every storyboard |
| The ui corpus (21) | research | named in every storyboard |
| Rich visual over text (22) | copy | the caption is one line, the machine carries the rest |
| A heavy session, with and without (23) | design | the Session view and its face switch |
| Read `SCHEME.md`, translate by hand (24) | research | the Scheme machine per package |
| The Detail pass (25) | design | the Detail machines per package |
| The lane history compounds (27) | research | `Temporary/Lane/` |
| The component matrix (28) | research | `Documentation/Component/` |
| Verify the subject exists (29) | research | the package must be in `Classic/` or `EffectTS/` |
| Route design to max effort (30) | implementation | the spec's route line |
| The views: shared and architectural | design | the view switcher on every plugin page |

## The sources a storyboard may borrow from

- `Temporary/Corca/` - the specimens, the curated notes, the composition catalogue.
- `Temporary/` - the design contracts, the page recipes, the placement atlas.
- `~/Developer/Documentation/Module/ui/` - the geometry and state models of the advanced corpus.
- `~/Developer/Documentation/Module/deepseek-harness/docs/` - the harness's own behavior.
- `Classic/packages/` and `EffectTS/packages/` - the plugin's source, its `SCHEME.md`, its tests.
- `~/.dsh/skills/` - the skills that carry the rules this repository works under.

Borrow the mechanic and the composition; never the colour, the radius, the font, or the shadow.
