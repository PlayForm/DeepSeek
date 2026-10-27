---
title: Site Update - the durable specification
category: Archive/Site
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Site/SITE-UPDATE-NOTE.md
index: Documentation/INDEX.md
statuses:
  - name: the new-functionality site reflection (ccr, granular scopes, overpass, tool-coach)
    state: implemented
    evidence: the site lanes B/A/C landed; 24 pages
  - name: the supports buttons under the pin and govern showcases
    state: implemented
    evidence: the aria-expanded chips and hidden panels; the click bug fixed
  - name: the dedicated tool-coach section (coachy colors)
    state: implemented
    evidence: the two-column coaching board and the judge demo
  - name: the separate tool-coach plugin page
    state: implemented
    evidence: plugins/hook-dsh-tool-coach.astro
  - name: the plugin READMEs' new-functionality sections
    state: implemented
    evidence: the SITE-C lane; the four granularity facts in all 14 flavor READMEs
---

# Site Update - NOTE FOR A FUTURE AGENT (2026-10-19)

> Status: **NOTED, NOT IMPLEMENTED.**
>
> This is the durable specification for updating the family website (`~/Developer/Application/PlayForm/DeepSeek/Site/`, the Astro site, `Site/Source/pages/*.astro` + `Site/Source/Component/*.astro`).
>
> A subsequent agent implements it after the in-flight family work settles.

## The requirements (user-mandated, 2026-10-19)

1. **Include each and every new functionality of the original plugins** (and update their READMEs).

    The new functionality since the last update of the site starts with the CCR hook (`hook-dsh-ccr` - tool-output compression, the `<<<CCR:hash|type|size>>>` markers, `ccr_retrieve`, auto-expand).
    It continues with the full-granular normalization control (the volatile `scopes` surface: conversation / reasoning / toolInput / toolResults / files / batch, `toolResultsExempt`, the live volatile toggles through `loader/volatile-update`).
    It also covers the overpass mechanism (the `tools/post-execute` + `agent/pre-step` arms, the `normalize-overpass` command including the files sweep).
    It ends with the tool-coach guardian plugin (`hook-dsh-tool-coach` - adversarial detection, the dynamic `ctx.tools.schemas()` instruction fetch, the four delivery channels, the optional `enforce` deny tier).

2. **Homepage - Pinned manifests / Governed pins.**

    On the homepage under the "Pinned manifests, deterministically" and "Governed pins, silently" boxes (`Site/Source/pages/index.astro:331` and `:341`), add a text on the right underneath each box that says "supports: Cargo.toml, package.json".
    Render it as buttons, and when the reader clicks them they must display the above changes correctly (for example the use case shows which manifests the governor or pinner actually handle and how).

3. **Include absolutely all of the new functionality into the Site's descriptions + pages as well.**

    The plugin and product pages, the matrix, flavors, versions, workbench, and setup pages, in short every place that describes the family, must reflect the new features.

4. **A new homepage section for the tool-coach plugin.**

    The section is dedicated, in the same style, visibly displayable, and interactive just like the others, but in different colors (red/orange, "coachy") and with a different structure than the rest, because the plugin is a guardian and coach rather than a governance module, and the section should feel distinct.

5. **A special, separate page for the tool-coach plugin.**

    The page follows the pattern of the other plugins, which each have their own page under `Site/Source/pages/plugins/`.

## Site facts (verified 2026-10-19, for the implementer)

- Pages: `Source/pages/{index,plugins,plugins/,flavors,matrix,models,setup,versions,workbench,case-study}.astro`.
- Homepage sections at `index.astro:331` ("Pinned manifests, deterministically") and `:341` ("Governed pins, silently").
- Component library in `Source/Component/` (Card, Badge, CodeBlock, Configurator, Concept, Compare, InstallDemo, Showcase, StatsBand, Terminal, FlavorBadge, ...).
- The site builds through the family tooling (the `Build` command of `@playform/build`, see the Site package.json), and the docs mention `cd Site && pnpm build` / `prepublishOnly` with outDir `Target`.

## Acceptance criteria (for the future agent)

- Every new feature above is described on the site (homepage sections, the plugin pages, and the READMEs).
- The "supports:" buttons under the two homepage boxes exist and expand to the use cases when the reader clicks them.
- The tool-coach has its own homepage section (coachy colors, distinct structure) and its own page under `Source/pages/plugins/`.
- The site builds green (the deterministic build, zero errors), and the full family arbiter is unaffected.
