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

> Granular topic document distilled from the descriptive plan preserved
> 2026-10-07 (Documentation/Plans/TOMORROW-REVIEW.md section 4 -
> byte-preserved; the master record remains the authoritative source).

---

The user will run the whole process again - the review-driven pass:

1. **The review**: the user reviews the preserved state (this document +
   the handoff + the site) - the staged/modified tree (nothing
   committed), the correctness agent's output, the case-study third
   pass's output.
2. **The case-review agent's mandate** (user-set 2026-10-07): the review of the case study must EMPHASIZE THE STRUCTURE OF WHY IT WAS WRITTEN LIKE THIS.
   It covers the structural rationale (why the architecture/decisions are shaped the way they are), NOT the HOW (the process mechanics).
3. **The site fixes**: the `/workbench/` page does NOT work (user-flagged 2026-10-07 - reproduce on the dev server, repair or rebuild per the designed functionality).
   The site's remaining feedback per the directions.
   THE TYPOGRAPHY DIRECTION (user-set 2026-10-07, for the site-fix agent): INCREASE THE FONT SIZES, NEVER text-xs (no tiny 10-12px text).
   NO JetBrains Mono - use another open-source + sharper mono where a mono is genuinely needed (IBM Plex Mono - the CodeEditorLand/WebSite's choice), otherwise a great SANS for the larger headings + NORMAL TEXT SIZES for the smaller ones.
   Borrow heavily from `~/Developer/Application/CodeEditorLand/WebSite`'s design (its type system + conventions).
4. **The corrections**: the review's findings land as new packages
   (agents + the smokes/site-build as the arbiter).
5. **The finishing work**: the submodule structure (#16), the gitignores,
   the ncuBin re-pin, the naming refinements, the releases' publish
   polish (the per-repo conventions: the CC0 LICENSE + CONTRIBUTING +
   CODE_OF_CONDUCT + CHANGELOG - adopted at the monorepo root, carried
   to each repository).
6. **THE FULL-FILE ANONYMIZATION SCAN** (user-instructed 2026-10-07):
   The user removed the "~/Developer/" links and text themselves.
   ANOTHER ANONYMIZATION AGENT runs tomorrow to scan ALL files for the remaining personal references (the "~/Developer/", the "/Volumes/CORSAIR", the "/Users/nikola", the "Nikola" mentions, the personal use-case language) and removes them.
   The smokes/site-build is the arbiter.
   The smoke-asserted code constants (the ncuBin value) are re-pinned + rebuilt per the decision.
7. **THE GRANULAR INCONSISTENCY SCAN** (user-instructed 2026-10-07) -
   the MOST GRANULAR agent to discover the inconsistencies + the
   peculiar details missed. CONCRETE STARTING RESIDUES (quantified):
   - THE CC0 ADOPTION: 49 files still carry "MIT" - the 24 package.json
     `"license": "MIT"` fields (Classic + EffectTS), the READMEs'
     shields.io license badges (MIT), the Site's badge references - the
     CC0 sweep.
   - The code inconsistencies: the cross-implementation drifts, the
     stale version badges, the remaining absolute paths in the
     non-asserted places, the old-name residues outside the Boilerplate,
     the README/SCHEME/package.json mismatches, the EffectTS-vs-Classic
     doc drift, the peculiar details (the stale counts, the leftover
     references) - sweep EVERYTHING + report the full findings with the
     fixes (the smokes/site-build as the arbiter).
8. **THE TERM-LINKING AGENT** (user-instructed 2026-10-07): a separate
   agent links the technical terms - `LlmRuntime`, the `StreamChunk`
   vocabulary, the `fs/observed` + `fs/write-intent` events, the
   `llm/stream` waterfall, the dsh-* packages, the cordis Context, the
   storage domain, the seams - ACROSS the website + the READMEs + the
   documentation into the ACTUAL `https://github.com/deepseek-ai/
   deepseek-harness` repository, using the
   `https://github.com/deepseek-ai/deepseek-harness/tree/master/...`
   links (the agent verifies the repo's actual tree paths first - the
   terms map to the matching source files/dirs; every linked term
   resolves; no dead links; the surrounding prose unchanged).
9. **THE OUR-REPO TERM-LINKING AGENT** (user-instructed 2026-10-07,
   AFTER item 8): a second linking agent maps the SAME terms (the ones
   we use in OUR code repository - LlmRuntime, the stream vocabulary,
   the events, the seams...) to OUR OWN repository's tree -
   `https://github.com/PlayForm/DeepSeek/tree/Current` links (the
   monorepo's GitHub repo, the Current branch) - each term links to the
   matching source in our tree (the packages' Source files, the docs,
   the site).
10. **THE LYCHEE LINK-CHECKING METHODOLOGY AGENT** (user-instructed
    2026-10-07): a separate agent FULLY implements the link-checking
    methodology through lychee - exactly like the
    `~/Developer/Application/CodeEditorLand/Land` lychee setup does
    (the lychee.toml + the report conventions - read Land's lychee.toml
    + the lychee-report.md as the reference) - WITHOUT disclosing the
    source: the methodology adopted (the config, the CI/script, the
    report format) for the DeepSeek project, no attribution to Land.
    The full link verification across the site + the READMEs + the docs
    (incl. the two linking agents' links) with the report generated.
11. **THE DISCLOSURE-CLEANUP AGENT** (user-instructed 2026-10-07):
    a cleanup pass over the disclosure/attribution statements - e.g.
    where the docs/site say "borrowed from" / "adopted from X" - even
    though the sources are the USER'S OWN projects
    (`~/Developer/Application/CodeEditorLand/*`, the style repositories
    like Aphrodite, Compress, and the others). The disclosure passes
    get cleaned per the user's preference (the attribution statements
    adjusted or removed where the sources are the user's own.
    The
    methodology stays, the attribution prose cleaned.
    The site's
    DESIGN.md's source attribution + the docs' "adopted from" notes are
    the starting points.
12. **The live battery**: the whole family re-verified live (the ledgers,
    the interlock, the escape hatch, the direct-govern, the v2 domain)
    after any source change - the `~/.dsh` originals stay live.
13. **The commit protocol**: the user commits (incrementally per folder
    with `git gcommit-hermes` when they decide); the agents never commit.
    (ANNOTATED record: `git gcommit-hermes` refers to the gcommit
    command's hermes heritage - the historical attribution; this line is
    record-only, a future-pass candidate; RESOLVED - the hermes
    de-branding is already done across the family, and this line itself
    is the residue: it stays as the record, marked as the historical
    artifact - annotate-only, no deletion.)
14. **THE README AGENT** (user-instructed 2026-10-07, in the queue AFTER
    the corrections): the monorepo root `README.md` + the other READMEs
    (EffectTS/README.md, Boilerplate/README.md - both MISSING - and the
    alignment of the existing Classic/README.md + Test/README.md) - in
    the STRUCTURE + STYLE of `~/Developer/Application/PlayForm/Aphrodite`
    (its section flow: Install, The Problem, How It Works, Architecture,
    Tools, Configuration, Performance, Contributing, License) but with
    the DeepSeek style (the terse, factual, hyphenated voice; the tabs
    formatting; the @-sentence vocabulary; the ledger-string contract;
    the VERIFIED smoke totals 733 Classic / 746 EffectTS - never the
    stale 671/795/808 figures; NO attribution prose - Aphrodite is the
    user's own; NO personal paths) - describing FULLY what the plugins
    do (the 12 packages, the three implementations, the seams, the
    stream gate, the governance chains).
15. **THE NPM PUBLISHING AGENT** (user-instructed 2026-10-07 - LATER,
    a separate future session): allow publishing the packages to npmjs
    for easy installation. NOT dispatched in this batch.
16. **THE RESTRUCTURING AGENT** (user-instructed 2026-10-07, in the queue
    AFTER the corrections agent, applied SYSTEMATICALLY ON EACH PAGE):
    the diagram-first concept-block treatment - ONE independently
    explainable concept per block.
    Each block is in the order: a visible
    diagram placeholder (dashed, with a stable `data-diagram` id +
    implementation instructions for a future diagram agent) → a short
    descriptive heading → one or two short paragraphs explaining ONLY
    that concept.
    Preserve technical meaning, identifiers, literals,
    caveats ("may"/"only"/"never").
    Separate ownership, composition, policy, activation, entry points.
    Keep sequential steps together.
    No repetition.
    Semantic elements + CSS gaps for spacing (NEVER <br>
    or line breaks).
    <code> for identifiers.
    Quotes of ledger strings
    stay byte-exact.
    PLUS: replace ALL ASCII arrows (the "→" and "->"
    glyphs) with actual colored visual icons (an inline SVG arrow icon
    in the Harness Blue, sized to the text) except where the arrow is
    part of a code/ledger literal.
    The site-wide sweep: EVERY page's
    dense prose + EVERY arrow occurrence (191 "→" + 82 "->" measured).
17. **THE DIAGRAM-IMPLEMENTATION AGENT** (noted for a later batch): the
    diagram placeholders get implemented as real diagrams per their
    data-diagram ids + embedded instructions. NOT dispatched yet.
18. **THE SYNTAX-HIGHLIGHTING AGENT** (user-instructed 2026-10-07, in
    the queue AFTER the restructuring agent): add syntax highlighting to
    the code/JSON/YAML blocks on the site pages (e.g. /setup/ - the JSON
    currently looks unhinted). BORROW the
    ~/Developer/Application/CodeEditorLand/WebSite approach (verified:
    Astro markdown + Shiki, `syntaxHighlight: "shiki"`, `theme:
    "github-dark"`, the `--shiki-dark` CSS-variable bridge in its
    Base.astro) - adapted for the site's manual <pre><code> blocks in
    .astro pages (e.g. Shiki's codeToHtml in the frontmatter, or the
    markdown route) - with the DeepSeek style (the Harness Blue voice,
    the bumped typography, IBM Plex Mono for code). No attribution
    prose (the WebSite is the user's own).
19. **THE CORE-PAGE RESTRUCTURE AGENT** (user-instructed 2026-10-07 -
    DEDICATED to the hook-dsh-core page treatment, PAUSED for now - the
    restructuring agent #16 treats EVERY page EXCEPT the core page; this
    agent owns hook-dsh-core.astro): implement the reusable
    `@Component/Concept.astro` component (Props: Id / Title / Diagram;
    `data-diagram={Id}` + `data-diagram-status="placeholder"` on the
    dashed placeholder; label + brief; h3 title; slot body; the
    .concept/.concept__diagram/.concept__title/.concept__body styles;
    the shared .concept-list + .concept-values styles) + restructure the
    core page per the user's spec: "How It Works" -> "Core Architecture"
    (Two halves, one library; Structure versus substitution), "Governance
    Helpers" (Section / Default / Suppress / Policy / Refusal / Update
    envelope / Activate), "Normalization Helpers" (the six tables /
    Replace / ReplaceMap / the {text, count} contract), "Stream Dispatch"
    (Chunk / Block / ToolArgs / the raw marker / dispatch guarantees) -
    each as a diagram-first Concept block; the remaining sections per the
    block plan (Hero / Where It Fits / In the DeepSeek Harness / The
    Problem / In Action / The Config / The Ledger); remove the old
    Diagram constant. FIRST FLAG (never silently fix or guess) the
    content conflicts: the dependency-free CLASSIC vs EFFECT-TS variant
    wording (badge + family-position), library vs plugin wording, the
    ReplaceMap quote-map example (the em dash should survive a
    quote-only map), "the core owns no ledger strings" breadth, the
    `<Module>:` prefix vs Suppress(module, kind, cause), the
    "all twelve plugins" vs library wording, the identity-preservation
    wording. Keep exceptions beside their rules, examples beside their
    helpers, literals byte-exact.
