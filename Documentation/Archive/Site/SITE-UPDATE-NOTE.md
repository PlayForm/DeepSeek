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

> Status: **NOTED, NOT IMPLEMENTED.** The durable specification for updating
> the family website (`~/Developer/Application/PlayForm/DeepSeek/Site/` - the
> Astro site, `Site/Source/pages/*.astro` + `Site/Source/Component/*.astro`).
> A subsequent agent implements it after the in-flight family work settles.

## The requirements (user-mandated, 2026-10-19)

1. **Include each and every new functionality of the original plugins** (and
   update their READMEs). The new functionality since the site's last update:
   - the CCR hook (`hook-dsh-ccr` - tool-output compression, the
     `<<<CCR:hash|type|size>>>` markers, `ccr_retrieve`, auto-expand);
   - the full-granular normalization control (the volatile `scopes`
     surface: conversation / reasoning / toolInput / toolResults / files /
     batch, `toolResultsExempt`, the live volatile toggles via
     `loader/volatile-update`);
   - the overpass mechanism (the `tools/post-execute` + `agent/pre-step`
     arms, the `normalize-overpass` command incl. the files sweep);
   - the tool-coach guardian plugin (`hook-dsh-tool-coach` - adversarial
     detection, the dynamic `ctx.tools.schemas()` instruction fetch, the
     four delivery channels, the optional `enforce` deny tier).
2. **Homepage - Pinned manifests / Governed pins**: on the homepage under
   the "Pinned manifests, deterministically" and "Governed pins, silently"
   boxes (`Site/Source/pages/index.astro:331` and `:341`), underneath each
   box add a text on the right that says "supports: Cargo.toml, package.json"
   - rendered as BUTTONS; when clicked they must display the above changes
   correctly (e.g. the use case - show which manifests the governor/pinner
   actually handle and how).
3. **Include absolutely all of the new functionality into the Site's
   descriptions + pages as well** (the plugin/product pages, the matrix,
   flavors, versions, workbench, setup pages - every place that describes
   the family must reflect the new features).
4. **A new homepage section for the tool-coach plugin**: dedicated, in the
   same style, visibly displayable and interactive just like the others -
   but in **different colors (red/orange - "coachy")** and with a
   **different structure than the rest** (it is a guardian/coach, not a
   governance module - the section should feel distinct).
5. **A special, separate page for the tool-coach plugin**, just like the
   other plugins have their own pages (see `Site/Source/pages/plugins/`).

## Site facts (verified 2026-10-19, for the implementer)

- Pages: `Source/pages/{index,plugins,plugins/,flavors,matrix,models,setup,versions,workbench,case-study}.astro`.
- Homepage sections at `index.astro:331` ("Pinned manifests,
  deterministically") + `:341` ("Governed pins, silently").
- Component library in `Source/Component/` (Card, Badge, CodeBlock,
  Configurator, Concept, Compare, InstallDemo, Showcase, StatsBand,
  Terminal, FlavorBadge, ...).
- The site builds via the family tooling (the `@playform/build` `Build`
  command - see the Site package.json; the docs mention `cd Site && pnpm
  build` / `prepublishOnly` with outDir `Target`).

## Acceptance criteria (for the future agent)

- Every new feature above is described on the site (homepage sections +
  the plugin pages + the READMEs).
- The "supports:" buttons under the two homepage boxes exist and expand to
  the use cases when clicked.
- The tool-coach has its own homepage section (coachy colors, distinct
  structure) + its own page under `Source/pages/plugins/`.
- The site builds green (the deterministic build, zero errors) and the
  full family arbiter is unaffected.
