---
name: site-authoring
description:
    "The Site/ lane: the Astro source map, the design system, page anatomy, live content model,
    Mermaid diagram pipeline, build-as-verification rule, accuracy rules for registry and model
    claims, and the Cloudflare Pages deployment."
whenToUse:
    Before editing any file under Site/ (pages, components, layout, library, styles, public assets,
    diagrams), when adding a page or nav entry, when changing the 404 or deploy config, or when a
    site claim about the family must be verified.
version: 2.0.0
updated: 2026-10-20
---

# Site Authoring

The site is a static Astro build that documents the plugin family. It is its own git repository, and
its built output in `Site/Target/` is what users receive. This skill states the lane's laws, the
source map, the content model, and the accuracy rules the site has been burned by.

## When to use

- Any edit under `Site/Source/`, `Site/Public/`, `Site/astro.config.ts`, `Site/package.json`, or
  `Site/Scripts/`.
- Adding or renaming a page, a nav entry, a 404 link, or a diagram.
- A site claim about packages, counts, models, or publication state.
- Do not use for: the family's package code (`plugin-system`) or the global docs (`Documentation/`).

## The lane laws

1. **No dev servers.** Never start `astro dev`. The dev output differs from the built output, and
   "it works in dev" is not evidence.
2. **No `tsc` runs.** The build type-checks through Astro's pipeline; a separate `tsc` is not the
   arbiter.
3. **No git mutations.** The site is its own repository; report READY-TO-COMMIT for `Site/` files.
4. **The build is the verification.** Run `cd Site && pnpm prepublishOnly`, then inspect the built
   HTML and CSS in `Site/Target/`.
5. **Documentation-first content.** Page copy derives from the packages' real READMEs, schemes, and
   sources, not from invention.
6. **Byte-faithful glyphs need `raw-write`.** The normalize hooks are active while authoring; a
   deliberate glyph goes through `raw-write` (`instructional-writing`).

## The source map

```text
Site/
  Source/
    Layout/Base.astro        the shell: head, SEO, fonts, nav, footer
    Component/               Badge, Card, PageHero, SectionHeader,
                             Terminal, CodeBlock, Compare, Concept,
                             Configurator, FlavorBadge, InstallDemo,
                             Seams, Showcase, StatsBand, SupportsButton,
                             TerminalTray, BrandIcon, ArrowIcon
    pages/                   index, plugins, setup, versions, flavors,
                             models, workbench, matrix, case-study,
                             plugins/<15 detail pages>
    Library/                 Content.ts (the facts), Live.ts (build-time
                             readers), Links.ts (the URL registry),
                             FileIcon.ts, DiagramNav.ts
    Content/Mermaid/         Render.mjs (the diagram pipeline)
    Script/                  client scripts
    Stylesheet/              Base.css (Tailwind), Global.css (tokens)
  Public/                    static assets: 404.html, _headers,
                             Manifest.json, robots.txt, assets/
  Scripts/                   Drift-Guard.mjs
  Target/                    the built site (the deployment artifact)
```

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

## The page anatomy

A page is `Base` plus a sequence of sections:

1. `Base` - the title, description, canonical, Open Graph, JSON-LD.
2. The eyebrow row - badges naming the page's category.
3. `PageHero` - the title and the sub-paragraph.
4. Sections - `SectionHeader`, then the content: cards, tables, concepts with diagrams, terminal
   demos, code blocks.
5. The notation - the closing statement.
6. The footer - navigation and the copyright.

One `<h1>` per page (the hero). Headings descend in order. Every image has alt text; every icon that
conveys meaning has an accessible label.

## Voice and vocabulary

The site speaks in the family's own terms. One word per concept, everywhere:

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

1. One claim per sentence; the claim is checkable.
2. Active voice, named actor.
3. Concrete verbs; no "leverage", "seamless", "robust", "by construction".
4. No absolutes unless true: every, always, zero, never.
5. Short declaratives; one longer sentence per paragraph at most.
6. Headings as claims, not labels.
7. Second person for instructions, third for descriptions.
8. Cut the page about itself; no internal notes.

## The design system

- Blue and white only; `--color-primary` and `--color-primary-container` from `Global.css`.
- Inter for prose, IBM Plex Mono for code and labels.
- 1px hairlines for every surface boundary; zero elevation (no shadows, no gradients).
- The 8pt spacing rhythm; the `--radius-*` scale.
- The type scale's floor is 13px; body copy stays readable.
- `prefers-reduced-motion` guards for every animation.

## The Mermaid pipeline

Diagrams are `.mmd` sources rendered by `Source/Content/Mermaid/Render.mjs` into inline SVG. Run
`pnpm Diagrams` after a source change. The renderer's limits:

- **The wrap budget**: labels wrap per word; a label must survive wrapping with its spaces.
- **List markers**: a label that opens with syntax-shaped characters is parsed as flowchart syntax;
  use the quoted forms (`["..."]`, `{"..."}`).
- **`<>` and quotes**: entity-escape them (`&lt;`, `&gt;`, `&quot;`).
- **The space law**: wrapped words are joined with no-break spaces at render time; the `.mmd`
  sources stay ASCII.
- **The containment law**: every label box must sit inside the viewBox; a render whose label pokes
  out fails rather than shipping cropped.

## The accuracy rules

The site has been burned by claims that were true in a document and false in the tree. Before
shipping a claim:

| Claim                        | Verify with                                         |
| ---------------------------- | --------------------------------------------------- |
| Package count and names      | `ls Classic/packages EffectTS/packages`             |
| Smoke totals                 | the manifest line in each tree's `smokes/README.md` |
| Release version              | the package manifests                               |
| Model names                  | `task-routing`'s catalog; `list_subagent_models`    |
| npm publication              | the registry itself, per package                    |
| A planned feature is shipped | `Documentation/Plans/` status, not the plan text    |

Never say a package is on npm unless the registry confirms that package at that version. The install
snippets on a detail page are a promise; a 404 breaks the primary conversion path.

## The workflow

1. Read the page and the components it uses.
2. Change the source (and `Content.ts` for a figure).
3. If a diagram changed, `pnpm Diagrams`.
4. Build: `cd Site && pnpm prepublishOnly`.
5. Verify the built output: the page count, the changed strings in `Site/Target/`, and `pnpm Drift`.
6. Report READY-TO-COMMIT with the `Site/` file list.

## Verification

- `pnpm prepublishOnly` exits zero.
- `find Site/Target -name "*.html" | wc -l` equals the expected page count.
- The changed strings appear in the built HTML.
- `pnpm Drift` passes.
- The nav, the 404, and the sitemap agree on the page set.

## Anti-patterns

| Mistake                                | Cost                      | Do instead                     |
| -------------------------------------- | ------------------------- | ------------------------------ |
| `astro dev` as the check               | Ships unbuilt assumptions | Build and inspect `Target/`    |
| A hardcoded count in a page            | Drifts from the tree      | Read `Content.ts`              |
| An unverified npm claim                | A broken install path     | Check the registry per package |
| A new page missing from the nav or 404 | A page nobody can find    | Update Base and the 404        |
| A diagram label over the viewBox       | A cropped diagram ships   | Fix the source, re-render      |

## References

| File                                 | Covers                                                   | Read when                         |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------- |
| `references/lane.md`                 | The lane laws, the accuracy rules, and the audit lessons | Before any site edit              |
| `references/structure-and-design.md` | The source map, the components, the tokens               | Building or styling a page        |
| `references/build-and-deploy.md`     | The scripts, the build, the diagrams, and Pages          | Building, deploying, or debugging |
