---
title: The single document template for the Documentation tree
category: Documentation root
kind: standard
date: 2026-10-20
status: active
registry: Documentation/ARCHIVE-STYLE.md
index: Documentation/INDEX.md
statuses:
    - name: the YAML frontmatter convention
      state: implemented
      evidence: this document; applied to every document in the conversion
    - name: the status vocabulary (seven fixed values)
      state: implemented
      evidence: section 4
    - name: the folder tree (Plans/Researches/Guides/Reports/Archive)
      state: implemented
      evidence: the conversion; Documentation/INDEX.md
    - name: the conversion procedure (move, frontmatter, refs)
      state: implemented
      evidence: the conversion session's report
    - name: style source - the HPC system in Aphrodite .hermes
      state: resolved
      evidence: classification/TAXONOMY.md - one schema, metadata headers
    - name: the user amendments (no status tables; real YAML frontmatter)
      state: implemented
      evidence: the parent's verbatim corrections, 2026-10-20
    - name: new-document self-registration rule
      state: open
      evidence: enforced by convention only - no lint gate checks it yet
---

# ARCHIVE-STYLE - The Single Document Template for the Documentation Tree

> One style for EVERY document in the Documentation tree, so ANY later document, and ANY reader, can
> navigate the archive the same way EVERY time. The style takes its conventions from the HPC
> (Halted-Process Classification) system and the plans in
> ~/Developer/Application/PlayForm/Aphrodite/.hermes: ONE fixed metadata schema everywhere, a real
> YAML frontmatter block at the very top of the document that carries BOTH the document facts AND
> the per-functionality status entries, then the original body. Per the amendments of the user
> (2026-10-20): NO markdown tables for status anywhere in the archive, and NO prose key-value
> headers, because the metadata is an actual YAML frontmatter block (delimited by --- lines, YAML
> fields and nested lists/objects).

> **The 2026-10-21 role-prefix migration**: the four packages renamed that day read `lib-dsh-core`,
> `ets-lib-dsh-core`, `plugin-dsh-normalize-file` and `ets-plugin-dsh-normalize-file`, and the
> planned panel packages read `client-dsh-panel-family` and `client-dsh-panel-family-host`. The
> documents below carry the new names, and the original names stay in git history.

---

## 1. The two fixed parts

EVERY document is built from two parts, in this order:

1. **The frontmatter block.**

    The very first thing in the file, delimited by `---` lines.

    The frontmatter block holds the document fields (section 2) plus the `statuses:` list (section
    3), with ONE entry per functionality described.

2. **The body.**

    The original content, which starts with its own title heading, untouched.

    The prose, the sections, and the quoted ledger strings stay byte-exact.

Nothing from the original content is removed or rewritten when a document is converted.

The conversion is the frontmatter block plus the updated cross-references.

The `statuses:` entries are the face of the document toward the archive.

The body is the one-shot record of what was attempted.

## 2. The document fields (the frontmatter, part one)

Seven fields, always the same keys, plain YAML scalars:

    ---
    title: <the document title, ASCII>
    category: <Plans|Researches|Guides|Reports|Plugins|Brand|Archive/Topic|Documentation root>
    kind: <living-record|living-plan|queued-plan|research-output|guide|report|one-shot-record|standard>
    date: <YYYY-MM-DD - the original date of the work, never the conversion date>
    status: <active|complete|superseded|planned>
    registry: <the document's own path from the Documentation root>
    index: Documentation/INDEX.md
    ---

The document-level `status` values: active (living and current), complete (the attempt is finished),
superseded (a later document replaced it), and planned (NOTHING started yet).

## 3. The statuses list (the frontmatter, part two)

After the fields, the `statuses:` key holds ONE list entry PER FUNCTIONALITY, FEATURE, DECISION, OR
PROBLEM that the document describes, which are the things a reader would want to check against
reality.

EACH entry is a nested mapping (the YAML object-in-list style of the example of the user):

    statuses:
      - name: smoke-suite restructure
        state: implemented
        evidence: 207 suites - node Maintain/Run/Smokes/Index.mjs last line
      - name: ccr_search
        state: open
        evidence: R1 - retrieval-only today, no search/list API
      - name: live-containers mount
        state: open
        evidence: the plugin ships enabled=false - the IDLE-forever posture

- `name` - the functionality, named the way the body names it. NO markdown, NO quotes; avoid a colon
  inside the value.
- `state` - ONE value from the vocabulary in section 4.
- `evidence` - the concrete proof: the last line of a command, a commit hash, a file path, or "this
  document only" when NOTHING exists outside the document. Keep the value a plain YAML scalar (NO
  colon-space, NO leading dash, NO quotes unless required).

## 4. The status vocabulary (fixed, seven values)

- **implemented** - the functionality exists in code and its arbiter verifies it (the smokes, the
  build, the live battery). Use `implemented (PoC)` when a PoC covers the functionality but the full
  plan has open gaps (the grades in Documentation/Reports/POC-GAP-ANALYSIS.md), and never
  "complete".
- **resolved** - the problem or decision was settled.
- **in-progress** - started but NOT landed its final verification.
- **open** - described or decided but NOTHING exists yet.
- **superseded** - a later decision replaced it (name it in evidence).
- **deferred** - explicitly postponed (name the condition).
- **rejected** - considered and declined (name the reason).

## 5. The evidence discipline

- EVERY status entry cites something checkable, or honestly says "this document only".
- Statuses come from the actual state and NEVER from the own optimism of the document. The
  authoritative sources are the document itself, Documentation/Plans/TOMORROW-REVIEW.md (the full
  record), the git log, the runner (node Maintain/Run/Smokes/Index.mjs, its last line), and the
  built site.
- An entry may be open even in a document whose document-level status is complete. The statuses list
  records per-functionality truth, and the document-level status records the lifecycle of the
  document.

## 6. The section structure (the body)

The body keeps the original content.

Where a document is written new, it follows this four-part arc (the shape of the HPC plans):

1. The intent - what was attempted and why.
2. The attempt - the design, the plan, the research.
3. The outcome - what landed, with the evidence (the statuses).
4. The residuals - what remains open (the open/deferred entries).

## 7. The formatting rules

1. **The ASCII rule.**

    ASCII only in new content.

    The existing unicode in the original bodies stays byte-exact, because the quoted ledger strings
    are part of the smoke contract and are NEVER rewritten.

2. **The position.**

    The frontmatter block is the FIRST thing in the file.

    It sits before the title heading, delimited by `---` lines.

3. **The schema.**

    One fixed schema across the whole tree, so the meaning of a key is the same in EVERY document
    (the HPC convention).

4. **The metadata form.**

    NO markdown tables for status anywhere in the archive and NO prose key-value headers, because
    the metadata is real YAML frontmatter only (the amendments of the user, 2026-10-20).

    Ordinary tables inside the original bodies stay untouched.

5. **The cross-references.**

    Cross-references use paths from the Documentation root, e.g.
    Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md, so grep finds a moved file.

6. **The registration.**

    New documents register themselves: add the registry path to Documentation/INDEX.md when a
    document is added.

7. **The paragraphs.**

    The prose paragraphs hold one idea per paragraph.

    A long paragraph (over ~400 characters, or one that runs several ideas together) is split at the
    topic-sentence boundary, each new paragraph starts with its own lead sentence
    (`It also registers...`, `The @-sentence identity:`), and ONE blank line separates it from the
    previous one.

    Long enumerations of methods or features become bullet lists, and the inline markdown (bold,
    links, code spans) stays verbatim.

    Prettier re-wraps each paragraph at the configured printWidth.

    The worked example (2026-10-25): the single block of the dash-normalizer README becomes three
    paragraphs (the role, the raw-write tool, the identity and the visibility) with the same words.

## 8. The conversion procedure

1. **The move.**

    The file moves to its category folder (mv, byte fidelity, NO content change on the move).

2. **The frontmatter.**

    The YAML frontmatter block is prepended above the title.

3. **The statuses.**

    The statuses list is written, ONE entry per functionality, with states from the actual state.

4. **The references.**

    EVERY cross-reference in the tree that pointed at the old path is updated.

5. **The index.**

    The document is added to Documentation/INDEX.md.

## 9. The folder tree (the categories)

    Documentation/
      INDEX.md              the archive index + the status dashboard
      ARCHIVE-STYLE.md      this standard
      FRAMEWORK.md          the distilled requirements + the skill framework
      Brand/                the branding
      Plans/                the living + queued plans (the work that has not landed)
      Researches/           the research outputs (the questions that were answered)
      Guides/               the operating manuals (how to run and test the family)
      Reports/              the audits and diagnoses (what was investigated)
      Plugins/              the plugin registry documents
      Archive/              the one-shot records of completed attempts
        Smoke-Restructure/  the smoke-suite restructure
        Site/               the site updates and the case study
        Live-Containers/    the live containers research, requirements, design
        Tool-Coach/         the tool-coach plans
        Split/              the Classic/EffectTS split decisions
        CCR/                the CCR hook plans
        Normalize/          the normalize-family plans
      Handoff/              (untouched) the original handoff tree
      Skill/                (untouched) the loadable skills

The untouched trees (Handoff/, Skill/) keep their own internal structure.

Handoff/ is the original delivery record and Skill/ is the home of the loadable skills, and BOTH are
referenced by path from the harness and from this document.
