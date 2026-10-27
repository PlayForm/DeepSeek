---
title: The Tomorrow Review - the archive + skill catalog restructures (2026-10-20)
category: Archive/Tomorrow-Review
kind: one-shot-record
date: 2026-10-20
status: complete
registry: Documentation/Archive/Tomorrow-Review/BATCH-LOG-ARCHIVE-AND-SKILL-RESTRUCTURE-2026-10-20.md
index: Documentation/INDEX.md
statuses:
	- name: the archive restructure (the user's truncate-or-structure instruction)
		state: implemented
		evidence: the master record Documentation/Plans/TOMORROW-REVIEW.md - 65 docs into the categorised archive; the single template applied; the user committed c36e742, 386ac3c, 8448c5f
	- name: the skill catalog restructure
		state: implemented
		evidence: `3031ec6c` - all 11 skills converted to the canonical structure, 162 reference files, zero old-format remnants
---

# THE ARCHIVE + SKILL CATALOG RESTRUCTURES (2026-10-20)

> Granular topic document distilled from the master record's chronological batch log
> (Documentation/Plans/TOMORROW-REVIEW.md - the ARCHIVE RESTRUCTURE + SKILL CATALOG RESTRUCTURE
> sections; the master record remains the authoritative source).

---

## 1. The archive restructure complete (2026-10-20 - the user's instruction: "completely truncate or structure better each and every document...")

- The Documentation tree is restructured into the categorised archive of 65 docs.

    The layout: Plans/ (11), Researches/ (7), Guides/ (7), Reports/ (5), Plugins/ (2), Archive/ (29
    one-shots in 7 topics: Smoke-Restructure 2, Site 3, Live-Containers 17, Tool-Coach 2, Split 2,
    CCR 2, Normalize 1), Brand/, FRAMEWORK.md, and the untouched Handoff/ + Skill/.

- THE SINGLE TEMPLATE (Documentation/ARCHIVE-STYLE.md) was applied to every document.

    It carries the real YAML frontmatter (title/category/kind/date/status/registry/index + the
    statuses: list of {name, state, evidence} -
    implemented/resolved/in-progress/open/superseded/deferred/rejected), and it uses NO markdown
    status tables.

- THE STYLE SOURCE: the Aphrodite .hermes HPC system.

- THE STATUSES were derived from the actual state: the runner re-run "All 207 smoke suites passed",
  the 24-page site, the live findings, and the git log.

- THE USER COMMITTED LIVE (c36e742, 386ac3c, 8448c5f), and the READY-TO-COMMIT remainder is ONE file
  (FRAMEWORK.md, the duplicate frontmatter merge).

- THE OPEN DECISION: the INDEX.md's registry catalogs still use markdown tables for the document
  listing, not the status, and the user decides if the index goes table-free too.

- THE SITE LANE'S CURRENT MANDATE (the running `7273f92e`): the sentence-per-paragraph rule (one
  sentence per paragraph everywhere), the tagged panel lines' keyword highlights (the existing
  enriched patterns), and the chip's selected state (the solid accent fill + the white icon
  inversion, the final spec after the user's three corrections).

    It also carries the earlier mandates: the tier-focus, the supports swap, and the copy structure.

    The site's commit + push remains the user's when it lands.

## 2. The skill catalog restructure complete (2026-10-20 - `3031ec6c`)

- All 11 skills were converted to the canonical structure (SKILL.md pointer index + the references/
  folder + the scripts/ rule) in BOTH the live ~/.dsh/skills/ and the repo's Documentation/Skill/.

    The result: 162 reference files, the canonical template at
    code-authoring/references/skill-structure-template.md, the RELATIVE pointer format
    (./references/<name>.md, the user's correction), zero old-format remnants, and clean byte scans.

- THE NAMING AMENDMENT (Configuration over Config, Environment over Env, the two documented
  exceptions) lives in naming-rules-full-words.md.

- THE DIFFICULTY-FIRST AMENDMENT (mechanical=trivial/low, semantic=routine/high, and the file count
  never decides, per the user's routing correction of 2026-10-20) is reflected in the task-routing's
  difficulty-first.md, and the routing table was amended live too.

- THE REPO SYNC used cp + diff verification + the header re-applied via the edit tool, for SKILL.md
  only per the existing convention, and the references stayed byte-faithful.

- THE RECORD: the copy-style lane (`7ad6fa01`) + the CCR lane (`29a79248`) were still running.
