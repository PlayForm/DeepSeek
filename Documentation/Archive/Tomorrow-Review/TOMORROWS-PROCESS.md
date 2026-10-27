---
title: The Tomorrow Review - tomorrow's process (the re-run, 19 items)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-07
status: complete
registry: Documentation/Archive/Tomorrow-Review/TOMORROWS-PROCESS.md
index: Documentation/INDEX.md
statuses:
	- name: tomorrow's process (the 19-item re-run)
		state: open
		evidence: this document; the master record Documentation/Plans/TOMORROW-REVIEW.md section 4
---

# TOMORROW'S PROCESS (THE RE-RUN)

> Granular topic document distilled from the descriptive plan preserved 2026-10-07
> (Documentation/Plans/TOMORROW-REVIEW.md section 4 - byte-preserved; the master record remains the
> authoritative source).

---

The user will run the whole process again as the review-driven pass:

1. **The review.**

    The user reviews the preserved state (this document + the handoff + the site), the
    staged/modified tree (nothing committed), the correctness agent's output, and the case-study
    third pass's output.

2. **The case-review agent's mandate** (user-set 2026-10-07).

    The review of the case study must EMPHASIZE THE STRUCTURE OF WHY IT WAS WRITTEN LIKE THIS.

    It covers the structural rationale (why the architecture/decisions are shaped the way they are),
    NOT the HOW (the process mechanics).

3. **The site fixes.**

    The `/workbench/` page does NOT work (user-flagged 2026-10-07), so reproduce it on the dev
    server and repair or rebuild per the designed functionality.

    The site's remaining feedback follows the directions.

    THE TYPOGRAPHY DIRECTION (user-set 2026-10-07, for the site-fix agent): INCREASE THE FONT SIZES,
    NEVER text-xs (no tiny 10-12px text), and NO JetBrains Mono.

    Use another open-source + sharper mono where a mono is genuinely needed (IBM Plex Mono, the
    CodeEditorLand/WebSite's choice), otherwise a great SANS for the larger headings + NORMAL TEXT
    SIZES for the smaller ones.

    Borrow heavily from `~/Developer/Application/CodeEditorLand/WebSite`'s design (its type system +
    conventions).

4. **The corrections.**

    The review's findings land as new packages, with the agents + the smokes/site-build as the
    arbiter.

5. **The finishing work.**

    The work covers the submodule structure (#16), the gitignores, the ncuBin re-pin, the naming
    refinements, and the releases' publish polish: the per-repo conventions of the CC0 LICENSE +
    CONTRIBUTING + CODE_OF_CONDUCT + CHANGELOG, adopted at the monorepo root and carried to each
    repository.

6. **THE FULL-FILE ANONYMIZATION SCAN** (user-instructed 2026-10-07).

    The user removed the "~/Developer/" links and text themselves, and ANOTHER ANONYMIZATION AGENT
    runs tomorrow to scan ALL files for the remaining personal references (the "~/Developer/", the
    "/Volumes/CORSAIR", the "/Users/nikola", the "Nikola" mentions, the personal use-case language)
    and removes them.

    The smokes/site-build is the arbiter.

    The smoke-asserted code constants (the ncuBin value) are re-pinned + rebuilt per the decision.

7. **THE GRANULAR INCONSISTENCY SCAN** (user-instructed 2026-10-07).

    The MOST GRANULAR agent discovers the inconsistencies + the peculiar details missed.

    CONCRETE STARTING RESIDUES (quantified):

    - THE CC0 ADOPTION: 49 files still carry "MIT", namely the 24 package.json `"license": "MIT"`
      fields (Classic + EffectTS), the READMEs' shields.io license badges (MIT), and the Site's
      badge references, so the CC0 sweep applies.
    - The code inconsistencies: the cross-implementation drifts, the stale version badges, the
      remaining absolute paths in the non-asserted places, the old-name residues outside the
      Boilerplate, the README/SCHEME/package.json mismatches, the EffectTS-vs-Classic doc drift, and
      the peculiar details (the stale counts, the leftover references), swept EVERYWHERE with the
      full findings reported alongside the fixes and the smokes/site-build as the arbiter.

8. **THE TERM-LINKING AGENT** (user-instructed 2026-10-07).

    A separate agent links the technical terms (`LlmRuntime`, the `StreamChunk` vocabulary, the
    `fs/observed` + `fs/write-intent` events, the `llm/stream` waterfall, the dsh-* packages, the
    cordis Context, the storage domain, the seams) ACROSS the website + the READMEs + the
    documentation into the ACTUAL `https://github.com/deepseek-ai/deepseek-harness` repository,
    using the `https://github.com/deepseek-ai/deepseek-harness/tree/master/...` links.

    The agent verifies the repo's actual tree paths first, so the terms map to the matching source
    files/dirs, every linked term resolves, no dead links remain, and the surrounding prose stays
    unchanged.

9. **THE OUR-REPO TERM-LINKING AGENT** (user-instructed 2026-10-07, AFTER item 8).

    A second linking agent maps the SAME terms (the ones we use in OUR code repository: LlmRuntime,
    the stream vocabulary, the events, the seams...) to OUR OWN repository's tree through
    `https://github.com/PlayForm/DeepSeek/tree/Current` links (the monorepo's GitHub repo, the
    Current branch).

    Each term links to the matching source in our tree: the packages' Source files, the docs, and
    the site.

10. **THE LYCHEE LINK-CHECKING METHODOLOGY AGENT** (user-instructed 2026-10-07).

    A separate agent FULLY implements the link-checking methodology through lychee, exactly like the
    `~/Developer/Application/CodeEditorLand/Land` lychee setup does (the lychee.toml + the report
    conventions, reading Land's lychee.toml and the lychee-report.md as the reference) WITHOUT
    disclosing the source.

    The methodology (the config, the CI/script, the report format) is adopted for the DeepSeek
    project with no attribution to Land, and the full link verification runs across the site + the
    READMEs + the docs (including the two linking agents' links) with the report generated.

11. **THE DISCLOSURE-CLEANUP AGENT** (user-instructed 2026-10-07).

    A cleanup pass runs over the disclosure/attribution statements, for example where the docs/site
    say "borrowed from" or "adopted from X", even though the sources are the USER'S OWN projects
    (`~/Developer/Application/CodeEditorLand/*`, the style repositories like Aphrodite, Compress,
    and the others).

    The disclosure passes get cleaned per the user's preference, with the attribution statements
    adjusted or removed where the sources are the user's own: the methodology stays, the attribution
    prose is cleaned.

    The site's DESIGN.md's source attribution + the docs' "adopted from" notes are the starting
    points.

12. **The live battery.**

    The whole family is re-verified live (the ledgers, the interlock, the escape hatch, the
    direct-govern, the v2 domain) after any source change, and the `~/.dsh` originals stay live.

13. **The commit protocol.**

    The user commits incrementally per folder with `git gcommit-hermes` when they decide, and the
    agents never commit.

    (ANNOTATED record: `git gcommit-hermes` refers to the gcommit command's hermes heritage, the
    historical attribution; this line is record-only, a future-pass candidate.

    RESOLVED: the hermes de-branding is already done across the family, and this line itself is the
    residue, so it stays as the record, marked as the historical artifact, annotate-only with no
    deletion.)

14. **THE README AGENT** (user-instructed 2026-10-07, in the queue AFTER the corrections).

    The work covers the monorepo root `README.md` + the other READMEs (EffectTS/README.md and
    Boilerplate/README.md, both MISSING) and the alignment of the existing Classic/README.md +
    Test/README.md.

    It follows the STRUCTURE + STYLE of `~/Developer/Application/PlayForm/Aphrodite` (its section
    flow: Install, The Problem, How It Works, Architecture, Tools, Configuration, Performance,
    Contributing, License) but with the DeepSeek style: the terse, factual, hyphenated voice; the
    tabs formatting; the @-sentence vocabulary; the ledger-string contract; the VERIFIED smoke
    totals 733 Classic / 746 EffectTS, never the stale 671/795/808 figures; NO attribution prose,
    because Aphrodite is the user's own; and NO personal paths.

    The READMEs describe FULLY what the plugins do (the 12 packages, the three implementations, the
    seams, the stream gate, the governance chains).

15. **THE NPM PUBLISHING AGENT** (user-instructed 2026-10-07, LATER, a separate future session).

    The agent allows publishing the packages to npmjs for easy installation, and it is NOT
    dispatched in this batch.

16. **THE RESTRUCTURING AGENT** (user-instructed 2026-10-07, in the queue AFTER the corrections
    agent, applied SYSTEMATICALLY ON EACH PAGE).

    The agent applies the diagram-first concept-block treatment: ONE independently explainable
    concept per block.

    Each block follows the order: a visible diagram placeholder (dashed, with a stable
    `data-diagram` id + implementation instructions for a future diagram agent) → a short
    descriptive heading → one or two short paragraphs explaining ONLY that concept.

    Preserve technical meaning, identifiers, literals, and caveats ("may"/"only"/"never"), and
    separate ownership, composition, policy, activation, and entry points.

    Keep sequential steps together, avoid repetition, use semantic elements + CSS gaps for spacing
    (NEVER <br> or line breaks), use <code> for identifiers, and keep quotes of ledger strings
    byte-exact.

    PLUS: replace ALL ASCII arrows (the "→" and "->" glyphs) with actual colored visual icons (an
    inline SVG arrow icon in the Harness Blue, sized to the text), except where the arrow is part of
    a code/ledger literal.

    The site-wide sweep covers EVERY page's dense prose + EVERY arrow occurrence (191 "→" + 82 "->"
    measured).

17. **THE DIAGRAM-IMPLEMENTATION AGENT** (noted for a later batch).

    The diagram placeholders get implemented as real diagrams per their data-diagram ids + embedded
    instructions, and the agent is NOT dispatched yet.

18. **THE SYNTAX-HIGHLIGHTING AGENT** (user-instructed 2026-10-07, in the queue AFTER the
    restructuring agent).

    The agent adds syntax highlighting to the code/JSON/YAML blocks on the site pages (e.g. /setup/,
    where the JSON currently looks unhinted).

    BORROW the ~/Developer/Application/CodeEditorLand/WebSite approach (verified: Astro markdown +
    Shiki, `syntaxHighlight: "shiki"`, `theme: "github-dark"`, the `--shiki-dark` CSS-variable
    bridge in its Base.astro), adapted for the site's manual <pre><code> blocks in .astro pages
    (e.g. Shiki's codeToHtml in the frontmatter, or the markdown route), with the DeepSeek style
    (the Harness Blue voice, the bumped typography, IBM Plex Mono for code).

    No attribution prose, because the WebSite is the user's own.

19. **THE CORE-PAGE RESTRUCTURE AGENT** (user-instructed 2026-10-07, DEDICATED to the lib-dsh-core
    page treatment and PAUSED for now).

    The restructuring agent #16 treats EVERY page EXCEPT the core page, and this agent owns
    lib-dsh-core.astro.

    It implements the reusable `@Component/Concept.astro` component (Props: Id / Title / Diagram;
    `data-diagram={Id}` + `data-diagram-status="placeholder"` on the dashed placeholder; label +
    brief; h3 title; slot body; the .concept/.concept__diagram/.concept__title/.concept__body
    styles; the shared .concept-list + .concept-values styles).

    It also restructures the core page per the user's spec: "How It Works" -> "Core Architecture"
    (Two halves, one library; Structure versus substitution), "Governance Helpers" (Section /
    Default / Suppress / Policy / Refusal / Update envelope / Activate), "Normalization Helpers"
    (the six tables / Replace / ReplaceMap / the {text, count} contract), and "Stream Dispatch"
    (Chunk / Block / ToolArgs / the raw marker / dispatch guarantees), each as a diagram-first
    Concept block.

    The remaining sections follow the block plan (Hero / Where It Fits / In the DeepSeek Harness /
    The Problem / In Action / The Config / The Ledger), and the old Diagram constant is removed.

    FIRST FLAG (never silently fix or guess) the content conflicts: the dependency-free CLASSIC vs
    EFFECT-TS variant wording (badge + family-position), the library vs plugin wording, the
    ReplaceMap quote-map example (the em dash should survive a quote-only map), the "the core owns
    no ledger strings" breadth, the `<Module>:` prefix vs Suppress(module, kind, cause), the "all
    twelve plugins" vs library wording, and the identity-preservation wording.

    Keep exceptions beside their rules, examples beside their helpers, and literals byte-exact.
