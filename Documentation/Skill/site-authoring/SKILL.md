---
name: site-authoring
description:
    "The Site/ lane: Astro source map, design system, page anatomy, live content model, Mermaid
    diagram pipeline, build-as-verification rule, accuracy rules for registry and model claims,
    Cloudflare Pages deployment."
whenToUse:
    Before editing any file under Site/ (pages, components, layout, library, styles, public assets,
    diagrams), adding a page or nav entry, changing the 404 or deploy config, or verifying a site
    claim about the family.
version: 2.2.0
updated: 2026-10-29
---

# Site Authoring

The site is a static Astro build that documents the plugin family.

It is its own git repository, and its built output in `Site/Target/` is what users receive.

This skill states the lane's laws, the source map, the content model, and the accuracy rules the
site has been burned by.

## The goal: mechanistic interpretability

The site's purpose, in the owner's words, is mechanistic interpretability: to show what a plugin
does to the harness, what it does to the conversation, and how the harness works without it.

Three questions organize every page that makes a claim about behavior:

1. **What does the harness do here without the family?** The default turn, stage by stage, is the
   baseline every page compares against, and a page that claims an improvement must show the default
   beside it.
2. **What does this plugin change at this seam?** The payload it reads, the payload it writes, and
   what the model, the conversation, and the disk each see differently afterwards.
3. **Why is that better, and more secure, than the default?** The claim is marketing in tone and
   evidence in substance: it names the property (deterministic output, bounded context, a write
   guard, cost visibility) and shows the mechanism that produces it.

The site is a showcase, so the register is confident and short; it is not a spec sheet, so every
number and every mechanism still comes from the tree or from the authored maps.

The long-term direction is an operational dashboard: the same model of the turn, driven by a real
trace instead of a static example. A page built for the dashboard is built so that a live source can
replace the sample without changing the layout.

## The second goal: mechanistic inter-operability

Interpretability asks what one plugin does. Inter-operability asks what the family does together,
and it is a separate claim that needs its own evidence.

Three questions organize a page about composition:

1. **Who fires first at this seam?** A seam is a list of listeners, not a single hook. The order is
   the bundle's order plus each package's `prepend` or `append`, so a page that shows two plugins at
   one seam must show which of them sees the other's output.
2. **What does one plugin's output do to the next plugin's input?** The family is designed around
   this: the CCR gate compresses the bytes the normalizers already rewrote, because the bundle order
   puts CCR outside the normalize arms. A page that claims composition shows that chain, not a list
   of packages.
3. **Does the same behavior hold in both release trees?** Classic and Effect-TS are one behavior in
   two trees, so a claim about composition is a claim about both, and a page that shows one tree
   silently is a page that will drift.

## The iteration

The site grows one mechanism at a time, and each cycle runs the same six steps. A cycle that skips a
step produces a page that looks finished and is not.

1. **Research.** Read the harness documentation for the stage and the plugin source for the arm that
   acts there. Never write a mechanism page from memory of a README.
2. **Data.** Author the mechanism into `Source/Content/<Name>.ts`, with a header comment naming the
   document or source each field came from. The page never carries a fact the data file does not.
3. **Module.** Build the component that renders the data, with variants, so the next page reuses it
   instead of writing a second shape.
4. **Device.** Choose the visual by the question: a rail for order, a matrix for coverage, a graph
   for topology, a trace for a timeline, a chart for a quantity, a split for a comparison. A page
   that picks the device first picks the wrong one.
5. **Library.** Cytoscape with fCoSe for topology, the Instrument visual language of the UI module
   (`~/Developer/Documentation/Module/ui`) for quantities, and plain CSS for rails and matrices. A
   library is justified when the device needs interaction or layout the CSS cannot do. The question
   is never "does a chart look advanced" but "does this device answer the page's question better
   than a sentence"; a chart that answers a question nobody asked is a regression, and a page that
   avoids a chart because charts feel decorative is the opposite mistake.
6. **Verify.** Build, then the link scan, the structural audit, the spacing scan, the plural scan,
   and a browser check of every island, because a hydrated-looking island that never drew is the
   failure mode the scans cannot see.

The composition facts are data, not prose: the order of the arms, the prepend discipline, and the
seams that run independently belong in an authored map, the same way the behavior map holds the
seams.

## Every content edit goes through the edit tool

A file is changed by reading it and then editing it, never by a shell command that rewrites it. No
`sed`, no `perl -pi`, no `python - <<PY` heredoc, no `node -e` that writes, no `cat >` that replaces
a file. The shell is for the build, the checks, and reading the tree; it is not a text editor.

The reason is not style. A scripted rewrite:

- skips the read, so the edit is made against a memory of the file rather than the file;
- cannot see the surrounding context that decides whether the change is right;
- fails silently on a pattern that matched twice, and writes the wrong line;
- leaves no diff-shaped record of intent, only a new file.

This project has the scars: a `perl -pi` that doubled every `&__` in a stylesheet, a `node -e`
splice that inserted a second `Data:` line into a record, a `python` patch that replaced a binding
with a block whose closing brace it guessed. Each cost a build cycle and a repair.

The rule for a lane is the same as for the parent: `read`, then `edit` or `write`. A lane that
cannot express the change with those tools has not understood the file yet.

## The route a lane takes

The site's work divides at the same line the content divides at, and the route follows the work.

- **Mechanical lanes** - a rename, a sweep, a data file filled from a table, a component built to a
  fixed prop list - go to the cheap route. The spec is complete enough that judgement adds nothing.
- **Judgement lanes** - a page's composition, which machines a plugin's page carries, the order of
  its sections, the sentence a reader leaves with, a rewrite of a page that has become five shallow
  sections - go to the judgement route at max effort. A cheap lane asked to design will produce a
  template, and a template is the failure the owner names when they say a page is "empty".

The tell is in the spec: a spec that says _what the page must show_ is judgement work, and a spec
that says _which string goes where_ is mechanical. Route by the spec, not by the file count.

## What a presentation lane reads

A lane that authors a plugin's presentation reads all of this before it writes a line, and the spec
names every path:

1. **The plugin's source, in both trees.** `Classic/packages/<slug>/Source/` and the EffectTS twin
   `EffectTS/packages/ets-<slug>/Source/`. A claim about behavior is a claim about both trees, and a
   twin that differs is a fact the page carries.
2. **The plugin's aim.** Its `README.md`, the plans under `Documentation/Plans/`, and the family
   documents: the root `README.md`, `Documentation/PLUGINS/PLUGIN-FAMILY.md`,
   `Documentation/FRAMEWORK.md`. The aim is what the diagram is about; without it the page draws the
   mechanism and misses the point.
3. **The harness's side.** `~/Developer/Documentation/Module/deepseek-harness/docs/`: the
   architecture, the capability seams, the event matrix, the tool pipeline, the agent lifecycle, the
   session format.
4. **The visual research.** `Temporary/Corca/` is the visual authority and every lane that builds or
   composes UI is given it by path. The specimens are the mechanics, not the skin:
   `Specimens/Components.html` (the line and gutter, the pending block, the chip, the tab, the
   table, the paint-order trap), `Specimens/Flow.html` (lane, sequence, state),
   `Specimens/Observatory.html` (radial and graph forms), `Specimens/Plugin.html` (the triptych and
   the per-plugin composition), `Specimens/Session.html` and `Specimens/Trace-Prototype.html` (the
   document and inspector), `Curated/Components.md`, `Design-Tokens.md`, `Interaction-Model.md`,
   `Representations.md`, and `Compositions.md` (the operator table and the three anti-combinations).
   `Temporary/` also holds the design contracts and the page recipes. Borrow the mechanic and the
   composition; never the colour, radius, font, or shadow.
5. **The diagram corpus.** `Diagram/` at the repository root: one Mermaid flowchart per package,
   grouped into six capability families, plus the root architecture and the four integration paths.
   It is the reference for what a machine on a page should express - a real branch, a real
   pass-through, a real ledger write - not artwork to paste.
6. **The advanced UI corpus.** `~/Developer/Documentation/Module/ui/`: 113 registry compositions
   under `src/registry/overtrue/` and 45 page-level components under `src/components/overtrue/`,
   each a complete React + Tailwind + SVG composition. The ones a page usually needs are
   `trace-waterfall`, `radial-gauge`, `activity-rings`, `event-timeline`, `bullet-chart`,
   `distribution-bar`, `service-map`, `deploy-pipeline`, `steps`, `log-stream`, `json-viewer`,
   `detail-list`, `tree-view`, `ribbon-card`, and `activity-heatmap`. Borrow the geometry, the state
   model, and the labelling rule; never the component, the Tailwind class, or the dependency.
7. **The component inventory.** Every component under `Source/Component/`, with its props, because
   the composition is limited by what the lane knows exists.

The output is not the safest diagram. It is the densest true one: the machines that together express
the plugin's function, its side effects on the conversation, the disk, and the log, and the harness
rule that makes it possible. Two plugins whose kinds differ get compositions organised differently,
and the spec says so.

## When to use

- Any edit under `Site/Source/`, `Site/Public/`, `Site/astro.config.ts`, `Site/package.json`, or
  `Site/Scripts/`.
- Adding or renaming a page, a nav entry, a 404 link, or a diagram.
- A site claim about packages, counts, models, or publication state.
- Do not use for: the family's package code (`plugin-system`) or the global docs (`Documentation/`).

## The lane laws

1. **The dev server.**

    Never start `astro dev`.

    The dev output differs from the built output, and "it works in dev" is not evidence.

2. **The type check.**

    No `tsc` runs.

    The build type-checks through Astro's pipeline; a separate `tsc` is not the arbiter.

3. **The git surface.**

    No git mutations.

    The site is its own repository; report READY-TO-COMMIT for `Site/` files.

4. **The verification.**

    Run `cd Site && pnpm prepublishOnly`, then inspect the built HTML and CSS in `Site/Target/`.

5. **The content.**

    Page copy derives from the packages' real READMEs, schemes, and sources, not from invention.

6. **The glyphs.**

    Byte-faithful glyphs need `raw-write`.

    The normalize hooks are active while authoring; a deliberate glyph goes through `raw-write`
    (`instructional-writing`).

## The build-time source

The site prints facts that live in the monorepo, and `Site/` deploys on its own, so the monorepo
arrives as a submodule at `Site/Module/DeepSeek`.

Three anchors resolve the package trees, in this order, inside `Source/Library/Package.server.ts`:

1. `DSH_SOURCE_ROOT`, when it is set.
2. The monorepo above the site, found by walking up from the working directory (local development).
3. `Site/Module/DeepSeek` (the deployment, where the site is checked out alone).

`Scripts/Prepare.ts` runs before `astro build` and checks the submodule out when the trees are
missing, so a clean clone builds with no manual command.

The change order is a law:

- Every package fact originates in the monorepo, not in the site.
- A change lands there first, is committed, and is pushed.
- The site then pulls it into `Site/Module/DeepSeek` with `git -C Module/DeepSeek pull --ff-only`.
- Never edit inside `Module/DeepSeek`. It is a checkout of the monorepo; the edit belongs to no
  commit the site can publish, and the next update discards it.

The submodule URL in the committed `.gitmodules` is part of the build, because the deployment clone
fails before the build command runs:

| URL form                                     | Result on the builder                             |
| -------------------------------------------- | ------------------------------------------------- |
| `https://github.com/PlayForm/DeepSeek.git`   | clones; the repository is public                  |
| `ssh://git@github.com/PlayForm/DeepSeek.git` | `Host key verification failed`, the deploy aborts |

`Prepare.ts` also sets the HTTPS URL before it clones, so a checkout that recorded an SSH remote
still fetches.

## The source map

```text
Site/
  Source/
    Layout/Base.astro        the shell: head, SEO, nav, footer, skip link
    Component/               Badge, VersionPill, Breadcrumb, Definitions,
                             Table, Card, PackageCard, PageHero,
                             SectionHeader, StatsBand, Callout, CodeBlock,
                             Terminal, EmptyState, Pager, CopyButton.tsx
    Component/Graph/         Explorer.tsx (the Solid cytoscape island)
    pages/                   index, package, package/<slug>, showcase,
                             behavior, explore, tl, setup, reference,
                             case-study, marketplace, connect, 404, and the
                             development-only _Library.astro and
                             _Component.astro (mounted by astro.config only
                             when the dev server runs or SITE_DEV=1)
    Library/                 Package.server.ts (the monorepo reader),
                             Surface.server.ts (the README surface reader),
                             Marketplace.server.ts (the generated index),
                             Component.ts (the component roster),
                             Content.ts (the site's words), Links.ts (the
                             URL registry), Flag.ts (the dev gate),
                             Preview.astro (the library demo)
    Library/Graph/           Catalogue.server.ts (the serializable graph)
    Content/                 Summary.ts (one authored line per package)
    Stylesheet/              Base.css (Tailwind), Global.css (tokens and
                             primitives), Material.scss (the cabinet
                             mixins), Component/*.scss, Layout/Shell.scss
  Public/                    Manifest.json, robots.txt
  Scripts/                   Prepare.ts (checks out the submodule)
  Module/DeepSeek/           the monorepo, a submodule (the build input)
  Target/                    the built site (the deployment artifact)
```

## The development surfaces

The component library is a working surface, not published content: it exists so a component can be
seen beside its own contract.

- Its routes are mounted from `astro.config.ts`, not auto-routed from `pages/`, so a production
  build publishes no library route at all.
- The flag is `Source/Library/Flag.ts`: `SITE_DEV=1`, or the dev server, turns it on.
- Every link to it is gated by the same flag (`Links.ts` sitemap, the home page card).
- A production build has 131 pages; a development build has 147. A count of 147 in `Target/` means
  the flag leaked into a release.

## The content model

`Source/Library/Content.ts` is the single source of truth for every dynamic figure the site renders.

`Live.ts` reads the monorepo at build time (package versions, smoke manifests, package directories,
the factory's method sections); when a live source is missing, the documented fallback is served and
the build never fails.

Rules:

- Never hardcode a figure a page can read from `Content.ts`.
- A new figure gets a live reader in `Live.ts` and a fallback in `Content.ts`, or it is documented
  as a fallback-only value.
- `pnpm Drift` checks the fallbacks against the repo; run it after a figure changes.

## Facts are read, presentations are authored

The site has two kinds of content and they are produced two different ways.

**Facts are read.** A version, a count, a knob's default, a dependency edge, a changelog line: the
build reads them from the tree, and a page never types one by hand.

**Presentations are authored.** What a plugin _is_, what its page should show first, which picture
carries its dimension, and which sentence a reader leaves with: none of that is in a manifest, and a
page that derives it from a README's prose is a page that reads like a README. A presentation is
written by hand from the research, in the site's voice, and it lives in a `Source/Content/*.ts` map
next to the facts it frames.

The rule this replaces is worth naming, because it was tried and rejected: rendering a package's
README sections on its page. It fills space and says nothing a reader came for, and it turns the
site into a renderer rather than a presentation. The page that needs more content gets an authored
portrait, not a pasted document.

## A rich visual explanation beats a paragraph

A section leads with a machine and the prose is its caption. The machine carries the structure; the
sentence says what the reader is looking at, never what it means.

- A list is rows with a mark, not a sentence with commas.
- A rule is the two sides of the rule drawn, not a paragraph that describes both.
- A sequence, a branch, a size, a lifetime: each has a machine, and the paragraph that used to
  describe it is deleted rather than shortened.
- A caption is one line. Two lines means the machine is not doing its job yet.

The test is a pair of reads. With the machines hidden, the page must still read as a page and not as
a list of captions. With the prose hidden, the page must still say everything it came to say. A page
that fails the second read is a page of text with illustrations.

## The page anatomy

A page is `Base` plus a sequence of sections:

1. `Base` - the title, description, canonical, Open Graph, JSON-LD.
2. The eyebrow row - badges naming the page's category.
3. `PageHero` - the title and the sub-paragraph.
4. Sections - `SectionHeader`, then the content: cards, tables, concepts with diagrams, terminal
   demos, code blocks.
5. The notation - the closing statement.
6. The footer - navigation and the copyright.

One `<h1>` per page (the hero).

Headings descend in order.

Every image has alt text; every icon that conveys meaning has an accessible label.

## Voice and vocabulary

The site speaks in the family's own terms.

One word per concept, everywhere:

| Term       | Means                                                | Not                |
| ---------- | ---------------------------------------------------- | ------------------ |
| plugin     | a loadable DSH package (the factory, a hook, a tool) | the npm artifact   |
| package    | the npm artifact and its directory                   | a loaded plugin    |
| hook       | an event listener registered on a seam               | the package        |
| flavor     | one normalize transform (dash, quotes, ...)          | the whole family   |
| normalizer | the seven-package normalize family                   | one transform      |
| ledger     | the durable per-module log                           | the console output |
| bundle     | the built package (`Target/`)                        | the source         |

Voice rules:

1. **The claim.**

    One claim per sentence; the claim is checkable.

2. **The voice.**

    Active voice, named actor.

3. **The verbs.**

    Concrete verbs; no "leverage", "seamless", "robust", "by construction".

4. **The absolutes.**

    No absolutes unless true: every, always, zero, never.

5. **The length.**

    Short declaratives; one longer sentence per paragraph at most.

6. **The headings.**

    Headings as claims, not labels.

7. **The person.**

    Second person for instructions, third for descriptions.

8. **The self-reference.**

    Cut the page about itself; no internal notes.

## The design system

The restraint is in the skin, never in the structure. The tokens keep every page in one visual
language; they do not license a thin page.

- Blue and white only; `--color-primary` and `--color-primary-container` from `Global.css`.
- Inter for prose, IBM Plex Mono for code and labels.
- 1px hairlines for every surface boundary; zero elevation (no shadows, no gradients). Depth comes
  from layering, density, and rules, not from blur.
- The 8pt spacing rhythm; the `--radius-*` scale.
- The type scale's floor is 13px; body copy stays readable.

What that leaves open, and what a page should use:

- **Density.** A page may carry six or seven machines. A section is not a paragraph with a picture
  beside it; it is a machine with a caption.
- **Geometry.** Arcs, rings, cascades, ribbons, radial fans, grids of marks, stacked decks: any
  arrangement CSS and inline SVG can draw, as long as every value is a token.
- **Motion.** Transitions and reveals that explain a change are wanted; they are guarded by
  `prefers-reduced-motion`, not avoided.
- **Contrast.** Accent fills, accent washes, warn fills, and inverted panels are the vocabulary for
  emphasis. A page that uses one accent fill per screen is underusing the language.
- **Scale.** A display line, a hero number, a full-bleed band: the type scale exists to be used at
  its top end, not only at its floor.

## The Mermaid pipeline

Diagrams are `.mmd` sources rendered by `Source/Content/Mermaid/Render.mjs` into inline SVG.

Run `pnpm Diagrams` after a source change.

The renderer's limits:

- **The wrap budget**: labels wrap per word; a label must survive wrapping with its spaces.
- **List markers**: a label that opens with syntax-shaped characters is parsed as flowchart syntax;
  use the quoted forms (`["..."]`, `{"..."}`).
- **`<>` and quotes**: entity-escape them (`&lt;`, `&gt;`, `&quot;`).
- **The space law**: wrapped words are joined with no-break spaces at render time; the `.mmd`
  sources stay ASCII.
- **The containment law**: every label box must sit inside the viewBox; a render whose label pokes
  out fails rather than shipping cropped.

## The accuracy rules

The site has been burned by claims that were true in a document and false in the tree.

A page is named for the mechanism it shows, never for a generic product noun. "Value" is not a page;
"Model behavior" is, because it says what the reader will see. The rule covers the route, the page
title, the navigation label, the hero, and every section heading: if a label could sit on any
product's website, it is the wrong label. The user corrected this on 2026-10-29 after a page shipped
titled "Value".

Before shipping a claim:

| Claim                        | Verify with                                         |
| ---------------------------- | --------------------------------------------------- |
| Package count and names      | `ls Classic/packages EffectTS/packages`             |
| Smoke totals                 | the manifest line in each tree's `smokes/README.md` |
| Release version              | the package manifests                               |
| Model names                  | `task-routing`'s catalog; `list_subagent_models`    |
| npm publication              | the registry itself, per package                    |
| A planned feature is shipped | `Documentation/Plans/` status, not the plan text    |

Never say a package is on npm unless the registry confirms that package at that version.

The install snippets on a detail page are a promise; a 404 breaks the primary conversion path.

## The Astro scoping rules

An Astro frontmatter helper is not visible inside `getStaticPaths`.

Astro lifts `getStaticPaths` out of the page's frontmatter to module scope, where only the imports
are visible, so a function defined later in the frontmatter is undefined when `getStaticPaths` runs
and the build fails with `TitleFor is not defined` or `TraceFiles is not defined` - two builds
failed exactly that way. Data that a route generator needs comes from an import
(`@Library/Graph/Stories.mjs`, `@Library/Graph/Groups.mjs`, `@Library/Graph/Traces.mjs`), and
`Source/pages/showcase/[slug].astro` is the pattern: it resolves the roster titles inside
`getStaticPaths` from the imported roster.

## The layout rules for mounted components

A component built as a full-viewport application frame needs an explicit bounded height when it is
mounted inside an article page, because the component's own layout assumes the whole viewport. The
Explorer's workbench grid computes its height as `calc(100vh - var(--header-height))` from the
stylesheet, so a page that embeds the explorer mounts it with the `Compact` prop, whose inline
`--explorer-height` (520px by default) replaces the viewport-derived height; a mount that skips the
bound lets the frame swallow the page and pushes the article's own sections below the fold.

A component mounted as a direct grid child must not become a fourth auto-placed child of a three-row
template, because a grid whose template names exactly three rows turns the extra child into an
implicit fourth row that steals the canvas row's height. The Explorer's legend therefore rides
inside the `ControlBar` as a collapsed disclosure rather than standing beside it in the grid.

## The workflow

0. **The source.**

    A package fact is changed in the monorepo first, committed, and pushed; the site then pulls it
    into `Site/Module/DeepSeek`. A change made inside the submodule is not a change.

1. **The read.**

    The page and the components it uses are read.

2. **The change.**

    The source is changed (and `Content.ts` for a figure).

3. **The diagrams.**

    If a diagram changed, `pnpm Diagrams`.

4. **The build.**

    `cd Site && pnpm prepublishOnly`.

5. **The output.**

    The built output is verified: the page count, the changed strings in `Site/Target/`, and
    `pnpm Drift`.

6. **The report.**

    READY-TO-COMMIT is reported with the `Site/` file list.

## Verification

- `pnpm prepublishOnly` exits zero.
- `pnpm Check` exits zero: it reads the built output and fails on a broken link, a page without
  exactly one h1 or a title or a description, a skipped heading level, a duplicate id, a digit glued
  to a word, a space before punctuation, or a plural count. It also reports how many pages carry an
  island, because an island that hydrated but never drew is invisible to the other checks.
- `find Site/Target -name "*.html" | wc -l` equals the expected page count.
- The changed strings appear in the built HTML.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree on the page set.
- Every island opened in a real browser, not inferred from markup.

`Check.ts` reads verbatim content (tables and preformatted blocks) out of the text before it judges
spacing or plurals, because the site's voice does not govern a README's sentence, and it reads a
block-level tag as a space and an inline tag as nothing, because `</a>.` is not "README . Install".

One log line is known noise: `@playform/compress` intermittently prints
`SyntaxError: Unexpected end of input` or `Invalid empty selector` after inlining the pages. It is a
race in the compressor's parallel CSS buffer, not a defect in the site: two consecutive builds of
the same tree produce it in one and not the other, and every page stays well formed. Confirm the
pages and the scans, and do not chase the line; chase it only if a page fails to render.

## Anti-patterns

| Mistake                                | Cost                      | Do instead                     |
| -------------------------------------- | ------------------------- | ------------------------------ |
| `astro dev` as the check               | Ships unbuilt assumptions | Build and inspect `Target/`    |
| A hardcoded count in a page            | Drifts from the tree      | Read `Content.ts`              |
| An unverified npm claim                | A broken install path     | Check the registry per package |
| A new page missing from the nav or 404 | A page nobody can find    | Update Base and the 404        |
| A diagram label over the viewBox       | A cropped diagram ships   | Fix the source, re-render      |

## The component families and the unification decision

The site now carries seven component families under `Source/Component/`:

| Family         | Role                                                   | Count |
| -------------- | ------------------------------------------------------ | ----- |
| `Layout/`      | the six global shells plus nine simple section modules | 15    |
| `Anatomy/`     | the advanced M01-M20 implementations                   | 19    |
| `Mechanism/`   | the X01-X12 readers and the `MechanismFor` dispatcher  | 14    |
| `Workspace/`   | the O15-O23 and W01-W04 readers                        | 49    |
| `Observatory/` | the data-path strip, B01-B06 and O24-O32               | 52    |
| `Suggesters/`  | C01-C06 and O33-O42                                    | 56    |
| `Ui/`          | the shared primitives                                  | 4     |

The dispatcher (`MechanismFor.astro`) resolves four families by stem: a static import map for the
mechanisms and an eager `import.meta.glob` for the other three. Effect-TS twins are never mapped
onto a Classic reader; they keep their own state with a link to the Classic readers.

**One tree, one slot vocabulary.** A starter library (`Source/UI/{Primitive,Module,Layout}` with its
own typed records and per-family slots) describes the same 30 contracts as this build's `Ui/` +
`Layout/` + `Anatomy/` with five generic slots (`intro`, `primary`, `secondary`, `evidence`,
`closing`). Pick one before touching a route; the route adoptions already use the five-slot
vocabulary, and two live systems are worse than one imperfect one.

**The anatomy mount map** (not yet mounted; the Layout module of the same id is mounted):

| Route                                    | Anatomy components                                             |
| ---------------------------------------- | -------------------------------------------------------------- |
| `/explore/`, `/tl/`                      | M02 SourceIntegrityRail, M08 EvidenceReader, M20 OutcomeRecord |
| `/`, `/case-study/`, `/showcase/[slug]/` | M05 ArtifactDifference                                         |
| package pages                            | M06 DecisionEvidence, M17 TypedRelationship                    |
| `/reference/`                            | M09 OriginInspector                                            |
| `/connect/`                              | M18 DeliveryReceipt                                            |

A page mounts one implementation per contract id, never both; the collision is not the `data-module`
value but duplicate instance state, document-wide selectors and `id`s.

**The four known defects** (from the integration review, with their locations): the selection strip
compares `Package.Name` against the scoped name (`SelectionStrip.astro:87`); the attachment
derivation filters on kind `"seam"` and misses listener-only contributions; O29, O31 and O32 are
absent from the Observatory table; `ObjectCollection.astro:206` renders regardless of
`Body === "not-captured"`; and `ArtifactDifference.astro:224` sets "unchanged" from the native
outcome without comparing the values.

## References

| File                                 | Covers                                                   | Read when                         |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------- |
| `references/lane.md`                 | The lane laws, the accuracy rules, and the audit lessons | Before any site edit              |
| `references/structure-and-design.md` | The source map, the components, the tokens               | Building or styling a page        |
| `references/build-and-deploy.md`     | The scripts, the build, the diagrams, and Pages          | Building, deploying, or debugging |
