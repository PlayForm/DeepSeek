---
title: The brand brief
category: Brand
kind: living-record
date: 2026-10-07
status: active
registry: Documentation/Brand/BRANDING.md
index: Documentation/INDEX.md
statuses:
    - name: the brand brief (the colors, the type, the voice)
      state: implemented
      evidence: the Site follows it; blue and white, Inter and IBM Plex Mono
    - name: the remote-agent generation briefs
      state: implemented
      evidence: the self-contained brief in this file
---

# BRANDING.md - The DeepSeek Harness Plugin Family for PlayForm

> The brand brief now lives in `Documentation/Brand/`, and two documents refer to it:
> `../Plans/DSH-MONOREPO-PLAN.md` (the Site design) and `../Handoff/Register.md` (item #12 - the
> Handoff tree was erased on 2026-10-09, so the reference stays as the historical record).

This file is a self-contained brief.

Give this file to a REMOTE agent to make two deliverables: **(A) a complete branding manual** for
the family (plugins, versions, models, and flavors), and **(B) a simple sample webpage design
instruction set** with a static blue/white mockup.

EVERY fact that the agent needs is in this file, so do NOT make the agent learn the codebase.

---

## 1. THE FAMILY (what we are)

The **DeepSeek Harness Plugin Family for PlayForm**, or "the family", is a set of plugins for the
DeepSeek Harness (DSH) desktop agent platform, and it ships under the @playform ecosystem.

The family has ONE mission:

> **Control the output of the model and govern the files of the project.** The harness normalizes
> the output of EVERY model to clean, consistent characters (dashes, quotes, ellipsis, spaces,
> invisible characters, and full-width forms). The harness governs EVERY project manifest
> (canonicalized, pinned, and updated) automatically, visibly, and under the control of the author.

The family is **model-agnostic** because it normalizes the output of ANY LLM (the reference models
that the harness runs are DeepSeek V4 Flash and GLM 5.3 Flash).

The family is **flavor-based** because it uses ONE small transform for each character family and
shares ONE pure core.

## 2. THE PRODUCT INVENTORY (twelve packages)

The family has a hierarchical organization, so read EVERY name as a sentence of segments:
`<kind> @ <platform> @ <role> @ <domain>`.

| Package                        | The @-sentence                     | Role                                                                                                |
| ------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `plugin-dsh-factory`           | Plugin @ DSH @ Factory             | The service: 17 methods - state, ledger, journal, the shared write executor, the direct-govern fold |
| `lib-dsh-core`                 | Lib @ DSH @ Core                   | The pure library: transforms, tables, the stream gate, the update envelope, the activation composer |
| `hook-dsh-package-governor`    | Hook @ DSH @ Governor @ Package    | Canonicalize package.json chain pins + the update stage                                             |
| `hook-dsh-package-pinner`      | Hook @ DSH @ Pinner @ Package      | Pin package.json public deps to exact versions                                                      |
| `hook-dsh-cargo-governor`      | Hook @ DSH @ Governor @ Cargo      | The Cargo.toml governor (chain + normalization + cargo upgrade)                                     |
| `hook-dsh-normalize-dash`      | Hook @ DSH @ Normalize @ Dash      | Em/en dashes -> hyphen in model output                                                              |
| `hook-dsh-normalize-quotes`    | Hook @ DSH @ Normalize @ Quotes    | Curly quotes -> straight                                                                            |
| `hook-dsh-normalize-ellipsis`  | Hook @ DSH @ Normalize @ Ellipsis  | U+2026 -> "..."                                                                                     |
| `hook-dsh-normalize-spaces`    | Hook @ DSH @ Normalize @ Spaces    | Unicode spaces -> ASCII                                                                             |
| `hook-dsh-normalize-invisible` | Hook @ DSH @ Normalize @ Invisible | Zero-width/format chars removed                                                                     |
| `hook-dsh-normalize-fullwidth` | Hook @ DSH @ Normalize @ Fullwidth | Full-width -> half-width                                                                            |
| `plugin-dsh-normalize-file`    | Plugin @ DSH @ Normalize @ File    | Normalize files already on disk (the explicit tool)                                                 |

The alphabetical order groups the family in a natural way: the kind comes first (hook, plugin, or
lib).

Then come the roles (core, governor-cargo, governor-package, normalize-*, pinner-package,
plugin-factory).

Then come the domains.

## 3. THE VERSIONS (three)

1. **The Boilerplate.**

    The current and complete development codebase.

    The reference implementation, which is NOT released.

2. **The Classic Release.**

    The official release that comes from the boilerplate: cleaned, de-personalized, restructured
    (fewer comments, improved code), with ONE repository for each package.

3. **The Effect-TS Release.**

    The official release that is re-implemented on Effect-TS v4: external trace-ability (tracing
    spans over the chains), ecosystem interaction (the transformers and processors of Effect), the
    same behavior, and the same ledger strings.

Both official releases ship side by side.

The family carries a dual badge for its version (CLASSIC / EFFECT-TS).

## 4. THE MODELS

The family serves AI models and NOT the reverse.

The normalize family rewrites what a model emits, so the branding speaks of "model output",
"streams", and "transcripts" with clean, consistent characters in everything that the model writes.

The governance family acts on the files that the author (human or model) touches.

The voice is "the output of the model, governed and clean".

## 5. THE FLAVORS

A **flavor** is ONE member of the normalize family (dash, quotes, ellipsis, spaces, invisible,
fullwidth, or file).

A **role** is ONE member of the governance family (governor or pinner).

The branding must give EACH flavor and role a distinct visual treatment (a badge) while it keeps ONE
family look.

## 6. THE DESIGN CONSTRAINTS (NON-NEGOTIABLE)

- **BLUE AND WHITE ONLY.** Use ONE brand blue, white, and neutral greys. Use NO other hues anywhere.
  Blue tints that come from the ONE blue are allowed.
- **CLEAN HEADERS.** Headers put typography first: generous whitespace, NO decoration, NO gradients,
  and NO shadows, only type, alignment, and hierarchy.
- **MINIMAL.** Grids, whitespace, and ONE accent color do all the work.

## 7. THE BRANDING MANUAL - WHAT TO PRODUCE (deliverable A)

A complete identity system in ONE document that covers:

1. **Identity.**

    The treatment of the family name, a proposed tagline (ONE line with a blue/white mindset), and
    the mission statement from section 1.

2. **Logo.**

    A wordmark concept (the family name and the @-sentence hierarchy as a visual motif), a proposed
    abstract mark (clean, geometric, blue/white), and the usage rules (clear space, minimum sizes,
    and the wrong uses).

3. **Color.**

    The exact brand blue (name, hex, and usage ratios such as 80% white and 20% blue), the blue
    tints, the neutral greys, and the accessibility contrast notes.

4. **Typography.**

    A clean header typeface and a clean body typeface (propose specific families), the size scale,
    and the header hierarchy (H1/H2/H3 rules for "clean headers").

5. **Components.**

    Cards, buttons, badges (the flavor, role, and version badges - ONE for each flavor and role:
    dash, quotes, ellipsis, spaces, invisible, fullwidth, file, governor, and pinner; plus the
    version badges CLASSIC / EFFECT-TS), tables (the package inventory), code blocks, and the
    header/nav component.

6. **Voice.**

    The tone (clean, technical, confident), the vocabulary (the @-sentences, "flavor", "role", and
    "the family"), and short do/don't examples of copy.

7. **Package-level branding.**

    For EACH of the twelve packages: a one-line identity and its badge or icon treatment.

8. **Applications.**

    The README header layout, the website header, the docs, and the package badges on a registry
    page.

## 8. THE SAMPLE WEBPAGE - WHAT TO PRODUCE (deliverable B)

Produce a simple single-page design for the family website with blue/white and clean headers.

Produce BOTH:

1. **The instruction set.**

    A written design spec with the page sections in order, the layout grid, the spacing scale, the
    blue/white usage for each section, the clean-header treatment for EACH heading level, the
    component usage, and the responsive notes.

2. **The static mockup.**

    ONE self-contained HTML file with embedded CSS and blue/white only, which holds the page:

    - **The clean header**: the family name, the tagline, and a minimal nav (Products / Versions /
      Flavors / Models).
    - **The hero**: ONE strong sentence (the mission), clean type, white space, and one blue accent.
    - **The products grid**: the twelve packages grouped by role (Core & Factory, Governance, and
      Normalize), with EACH card that shows its name, its @-sentence, and its badge.
    - **The versions section**: CLASSIC compared with EFFECT-TS in two clean cards, with ONE line
      each.
    - **The models section**: ONE line that states model-agnostic and names the reference models.
    - **The flavors section**: the badge row with the seven normalize flavors and the two governance
      roles.
    - **The footer**: a minimal footer with the family name and the @-sentence motif.

## 9. THE OUTPUT FORMAT

- The branding manual: a Markdown document (`BRANDING-MANUAL.md`).
- The webpage: the design spec (Markdown) plus the mockup (ONE `index.html` file, embedded CSS, NO
  external dependencies, and NO other colors than blue/white/greys).
- NOTHING else; NO codebase access is necessary.

---

_The family: DeepSeek Harness Plugin Family for PlayForm - Hook @ DSH @ Governor @ Cargo. Clean.
Governed. Normalized._
