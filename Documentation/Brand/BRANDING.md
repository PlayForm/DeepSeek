# BRANDING.md - The DeepSeek Harness Plugin Family for PlayForm

> The brand brief migrated to `Documentation/Brand/` — referenced by
> `../Plans/DSH-MONOREPO-PLAN.md` (the Site design) and `../Handoff/Register.md` (item #12).

A self-contained brief. Give this file to a REMOTE agent to generate: **(A) a complete branding
manual** for the family (plugins + versions + models + flavors), and **(B) a simple sample webpage
design instruction set** (with a static blue/white mockup). Every fact needed is in this file - do
not require the agent to know the codebase.

---

## 1. THE FAMILY (what we are)

The **DeepSeek Harness Plugin Family for PlayForm** - "the family" - is a set of plugins for the
DeepSeek Harness (DSH) desktop agent platform, published under the @playform ecosystem. The family
has one mission:

> **Tame the model's output and govern the project's files.** Every model's output is normalized to
> clean, consistent characters (dashes, quotes, ellipsis, spaces, invisible characters, full-width
> forms), and every project manifest is governed (canonicalized, pinned, updated) - automatically,
> visibly, and under the author's control.

The family is **model-agnostic**: it normalizes the output of ANY LLM (reference models the harness
runs: DeepSeek V4 Flash, GLM 5.3 Flash). The family is **flavor-based**: one small transform per
character family, sharing one pure core.

## 2. THE PRODUCT INVENTORY (twelve packages)

The family is organized hierarchically - read every name as a sentence of segments:
`<kind> @ <platform> @ <role> @ <domain>`.

| Package                        | The @-sentence                     | Role                                                                                                |
| ------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `dsh-plugin-factory`           | Plugin @ DSH @ Factory             | The service: 17 methods - state, ledger, journal, the shared write executor, the direct-govern fold |
| `hook-dsh-core`                 | Lib @ DSH @ Core                   | The pure library: transforms, tables, the stream gate, the update envelope, the activation composer |
| `hook-dsh-package-governor`    | Hook @ DSH @ Governor @ Package    | Canonicalize package.json chain pins + the update stage                                             |
| `hook-dsh-package-pinner`      | Hook @ DSH @ Pinner @ Package      | Pin package.json public deps to exact versions                                                      |
| `hook-dsh-cargo-governor`      | Hook @ DSH @ Governor @ Cargo      | The Cargo.toml governor (chain + normalization + cargo upgrade)                                     |
| `hook-dsh-normalize-dash`      | Hook @ DSH @ Normalize @ Dash      | Em/en dashes -> hyphen in model output                                                              |
| `hook-dsh-normalize-quotes`    | Hook @ DSH @ Normalize @ Quotes    | Curly quotes -> straight                                                                            |
| `hook-dsh-normalize-ellipsis`  | Hook @ DSH @ Normalize @ Ellipsis  | U+2026 -> "..."                                                                                     |
| `hook-dsh-normalize-spaces`    | Hook @ DSH @ Normalize @ Spaces    | Unicode spaces -> ASCII                                                                             |
| `hook-dsh-normalize-invisible` | Hook @ DSH @ Normalize @ Invisible | Zero-width/format chars removed                                                                     |
| `hook-dsh-normalize-fullwidth` | Hook @ DSH @ Normalize @ Fullwidth | Full-width -> half-width                                                                            |
| `hook-dsh-normalize-file`      | Hook @ DSH @ Normalize @ File      | Normalize files already on disk (the explicit tool)                                                 |

The alphabetical order groups the family naturally: the kind first (hook/plugin/lib), then the roles
(core, governor-cargo, governor-package, normalize-*, pinner-package, plugin-factory), then the
domains.

## 3. THE VERSIONS (three)

1. **The Boilerplate** - the current, complete development codebase. The reference implementation;
   not released.
2. **The Classic Release** - the official release derived from the boilerplate: cleaned,
   de-personalized, restructured (fewer comments, improved code), one repository per package.
3. **The Effect-TS Release** - the official release re-implemented on Effect-TS v4: external
   trace-ability (tracing spans over the chains), ecosystem interaction (Effect's
   transformers/processors), the same behavior, the same ledger strings.

Both official releases ship side by side; the family is versioned with a dual badge (CLASSIC /
EFFECT-TS).

## 4. THE MODELS

The family serves AI models, not the reverse. The normalize family rewrites what a model emits - so
the branding speaks of "model output", "streams", "transcripts" - clean, consistent characters in
everything the model writes. The governance family acts on the files the author (human or model)
touches. The voice: "the model's output, governed and clean".

## 5. THE FLAVORS

A **flavor** is one member of the normalize family (dash, quotes, ellipsis, spaces, invisible,
fullwidth, file). A **role** is one member of the governance family (governor, pinner). The branding
must give each flavor/role a distinct visual treatment (a badge) while keeping one family look.

## 6. THE DESIGN CONSTRAINTS (NON-NEGOTIABLE)

- **BLUE AND WHITE ONLY.** One brand blue, white, and neutral greys. No other hues anywhere. Blue
  tints (derived from the one blue) are allowed.
- **CLEAN HEADERS.** Headers are typography-first: generous whitespace, no decoration, no gradients,
  no shadows - just type, alignment, and hierarchy.
- **MINIMAL.** Grids, whitespace, and one accent color do the work.

## 7. THE BRANDING MANUAL - WHAT TO PRODUCE (deliverable A)

A complete identity system, one document, covering:

1. **Identity** - the family name treatment, a proposed tagline (one line, blue/white mindset), the
   mission statement (from section 1).
2. **Logo** - a wordmark concept (the family name + the @-sentence hierarchy as a visual motif), a
   proposed abstract mark (clean, geometric, blue/white), the usage rules (clear space, minimum
   sizes, the wrong uses).
3. **Color** - the exact brand blue (name + hex + usage ratios: e.g. 80% white/20% blue), the blue
   tints, the neutral greys, the accessibility contrast notes.
4. **Typography** - a clean header typeface + a clean body typeface (propose specific families), the
   size scale, the header hierarchy (H1/H2/H3 rules - "clean headers").
5. **Components** - cards, buttons, badges (the flavor/role/version badges - one per flavor/role:
   dash, quotes, ellipsis, spaces, invisible, fullwidth, file, governor, pinner; and the version
   badges: CLASSIC / EFFECT-TS), tables (the package inventory), code blocks, the header/nav
   component.
6. **Voice** - the tone (clean, technical, confident), the vocabulary (the @-sentences, "flavor",
   "role", "the family"), short do/don't examples of copy.
7. **Package-level branding** - each of the twelve packages: a one-line identity + its badge/icon
   treatment.
8. **Applications** - the README header layout, the website header, the docs, the package badges on
   a registry page.

## 8. THE SAMPLE WEBPAGE - WHAT TO PRODUCE (deliverable B)

A simple single-page design for the family website, blue/white, clean headers. Produce BOTH:

1. **The instruction set** (a written design spec): the page sections in order, the layout grid, the
   spacing scale, the blue/white usage per section, the clean-header treatment for each heading
   level, the component usage, the responsive notes.
2. **A static mockup** (one self-contained HTML file with embedded CSS, blue/white only): the page
   with:

    - **The clean header**: the family name + the tagline, minimal nav (Products / Versions /
      Flavors / Models).
    - **The hero**: one strong sentence (the mission), clean type, white space, one blue accent.
    - **The products grid**: the twelve packages grouped by role (Core & Factory / Governance /
      Normalize), each card with its name + the @-sentence + its badge.
    - **The versions section**: CLASSIC vs EFFECT-TS, two clean cards, one line each.
    - **The models section**: one line - model-agnostic, the reference models named.
    - **The flavors section**: the badge row (the seven normalize flavors + the two governance
      roles).
    - **The footer**: minimal, the family name + the @-sentence motif.

## 9. THE OUTPUT FORMAT

- The branding manual: a Markdown document (`BRANDING-MANUAL.md`).
- The webpage: the design spec (Markdown) + the mockup (one `index.html` file, embedded CSS, no
  external dependencies, no other colors than blue/white/greys).
- Nothing else; no codebase access needed.

---

_The family: DeepSeek Harness Plugin Family for PlayForm - Hook @ DSH @ Governor @ Cargo. Clean.
Governed. Normalized._
