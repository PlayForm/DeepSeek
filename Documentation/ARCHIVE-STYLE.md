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

> One style for EVERY document in the Documentation tree, so ANY later document - and ANY reader -
> can navigate the archive the same way EVERY time. The style takes its conventions from the HPC
> (Halted-Process Classification) system and the plans in
> ~/Developer/Application/PlayForm/Aphrodite/.hermes: ONE fixed metadata schema everywhere, a real
> YAML frontmatter block at the very top of the document carrying BOTH the document facts AND the
> per-functionality status entries, then the original body. Per the user's amendments (2026-10-20):
> NO markdown tables for status anywhere in the archive, and NO prose key-value headers - the
> metadata is an actual YAML frontmatter block (delimited by --- lines, YAML fields and nested
> lists/objects).

> **The 2026-10-21 role-prefix migration**: the four packages renamed that day read `lib-dsh-core`,
> `ets-lib-dsh-core`, `plugin-dsh-normalize-file` and `ets-plugin-dsh-normalize-file`, and the
> planned panel packages read `client-dsh-panel-family` and `client-dsh-panel-family-host`; the
> documents below carry the new names, and the original names remain in git history.

---

## 1. The two fixed parts

EVERY document is built from two parts, in this order:

1. **The YAML frontmatter block** - the very first thing in the file, delimited by `---` lines. The
   frontmatter block: the document fields (section 2) plus the `statuses:` list (section 3), ONE
   entry per functionality described.
2. **The body** - the original content starting with its own title heading, untouched. The prose,
   the sections, the quoted ledger strings stay byte-exact.

Nothing from the original content is removed or rewritten when a document is converted. The
conversion is the frontmatter block + updated cross-references. The `statuses:` entries are the
document's face toward the archive. The body is the one-shot record of what was attempted.

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
superseded (a later document replaced it), planned (NOTHING started yet).

## 3. The statuses list (the frontmatter, part two)

After the fields, the `statuses:` key with ONE list entry PER FUNCTIONALITY, FEATURE, DECISION, OR
PROBLEM the document describes - the things a reader would want to check against reality. EACH entry
is a nested mapping (the YAML object-in-list style of the user's example):

    statuses:
      - name: smoke-suite restructure
        state: implemented
        evidence: 207 suites - node Maintain/Run-Smokes.mjs last line
      - name: ccr_search
        state: open
        evidence: R1 - retrieval-only today, no search/list API
      - name: live-containers mount
        state: open
        evidence: the plugin ships enabled=false - the IDLE-forever posture

- `name` - the functionality, named the way the body names it. NO markdown, NO quotes; avoid a colon
  inside the value.
- `state` - ONE value from the vocabulary in section 4.
- `evidence` - the concrete proof: a command's last line, a commit hash, a file path - or "this
  document only" when NOTHING exists outside the document. Keep the value a plain YAML scalar (NO
  colon-space, NO leading dash, NO quotes unless required).

## 4. The status vocabulary (fixed, seven values)

- **implemented** - the functionality exists in code and is verified by its arbiter (the smokes, the
  build, the live battery). Use `implemented (PoC)` when a PoC covers the functionality but the full
  plan has open gaps (the grades in Documentation/Reports/POC-GAP-ANALYSIS.md) - never "complete".
- **resolved** - the problem or decision was settled.
- **in-progress** - started but NOT landed its final verification.
- **open** - described or decided but NOTHING exists yet.
- **superseded** - a later decision replaced it (name it in evidence).
- **deferred** - explicitly postponed (name the condition).
- **rejected** - considered and declined (name the reason).

## 5. The evidence discipline

- EVERY status entry cites something checkable - or honestly says "this document only".
- Statuses come from the actual state, NEVER from the document's own optimism. The authoritative
  sources are: the document itself, Documentation/Plans/TOMORROW-REVIEW.md (the full record), the
  git log, the runner (node Maintain/Run-Smokes.mjs - its last line), and the built site.
- An entry may be open even in a document whose document-level status is complete. The statuses list
  records per-functionality truth. The document-level status records the document's lifecycle.

## 6. The section structure (the body)

The body keeps the original content. Where a document is written new, it follows this four-part arc
(the HPC plans' shape):

1. The intent - what was attempted and why.
2. The attempt - the design, the plan, the research.
3. The outcome - what landed, with the evidence (the statuses).
4. The residuals - what remains open (the open/deferred entries).

## 7. The formatting rules

1. ASCII only in new content. The existing unicode in the original bodies stays byte-exact (the
   quoted ledger strings are part of the smoke contract and are NEVER rewritten).
2. The frontmatter block is the FIRST thing in the file. It sits before the title heading, delimited
   by `---` lines.
3. One fixed schema across the whole tree - a key's meaning is the same in EVERY document (the HPC
   convention).
4. NO markdown tables for status anywhere in the archive and NO prose key-value headers - the
   metadata is real YAML frontmatter only (the user's amendments, 2026-10-20). Ordinary tables
   inside the original bodies are untouched.
5. Cross-references use paths from the Documentation root, e.g.
   Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md - so a moved file is found by
   grep.
6. New documents register themselves: add the registry path to Documentation/INDEX.md when a
   document is added.

## 8. The conversion procedure

1. Move the file to its category folder (mv - byte fidelity, NO content change on the move).
2. Prepend the YAML frontmatter block above the title.
3. Write the statuses list, ONE entry per functionality, states from the actual state.
4. Update EVERY cross-reference in the tree that pointed at the old path.
5. Add the document to Documentation/INDEX.md.

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

The untouched trees (Handoff/, Skill/) keep their own internal structure. Handoff/ is the original
delivery record, Skill/ is the loadable skills home - BOTH are referenced by path from the harness
and from this document.
