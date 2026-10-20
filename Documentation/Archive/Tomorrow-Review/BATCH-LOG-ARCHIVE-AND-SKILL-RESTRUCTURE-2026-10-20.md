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

> Granular topic document distilled from the master record's chronological
> batch log (Documentation/Plans/TOMORROW-REVIEW.md - the ARCHIVE
> RESTRUCTURE + SKILL CATALOG RESTRUCTURE sections; the master record
> remains the authoritative source).

---

## 1. The archive restructure complete (2026-10-20 - the user's instruction: "completely truncate or structure better each and every document...")

- The Documentation tree is restructured into the categorised archive
  (65 docs): Plans/ (11), Researches/ (7), Guides/ (7), Reports/ (5),
  Plugins/ (2), Archive/ (29 one-shots in 7 topics: Smoke-Restructure 2,
  Site 3, Live-Containers 17, Tool-Coach 2, Split 2, CCR 2, Normalize 1),
  Brand/, FRAMEWORK.md, the untouched Handoff/ + Skill/.
- THE SINGLE TEMPLATE (Documentation/ARCHIVE-STYLE.md) - the real YAML
  frontmatter (title/category/kind/date/status/registry/index + the
  statuses: list of {name, state, evidence} -
  implemented/resolved/in-progress/open/superseded/deferred/rejected) -
  applied to every document; NO markdown status tables.
- THE STYLE SOURCE: the Aphrodite .hermes HPC system.
- THE STATUSES derived from the actual state (the runner re-run "All 207
  smoke suites passed", the 24-page site, the live findings, the git
  log).
- THE USER COMMITTED LIVE (c36e742, 386ac3c, 8448c5f); the READY-TO-
  COMMIT remainder = ONE file (FRAMEWORK.md - the duplicate frontmatter
  merge).
- THE OPEN DECISION: the INDEX.md's registry catalogs still use markdown
  tables (the document-listing, not the status) - the user decides if
  the index goes table-free too.
- THE SITE LANE'S CURRENT MANDATE (the running `7273f92e`): the
  sentence-per-paragraph rule (one sentence per paragraph everywhere),
  the tagged panel lines' keyword highlights (the existing enriched
  patterns), the chip's selected state (the solid accent fill + the
  white icon inversion - the final spec after the user's three
  corrections), plus the earlier mandates (the tier-focus, the supports
  swap, the copy structure). The site's commit + push remains the
  user's when it lands.

## 2. The skill catalog restructure complete (2026-10-20 - `3031ec6c`)

- All 11 skills converted to the canonical structure (SKILL.md pointer
  index + the references/ folder + the scripts/ rule) in BOTH the live
  ~/.dsh/skills/ and the repo's Documentation/Skill/ - 162 reference
  files, the canonical template at
  code-authoring/references/skill-structure-template.md, the RELATIVE
  pointer format (./references/<name>.md - the user's correction), zero
  old-format remnants, byte scans clean.
- THE NAMING AMENDMENT (Configuration over Config, Environment over Env
  + the two documented exceptions) in naming-rules-full-words.md.
- THE DIFFICULTY-FIRST AMENDMENT (mechanical=trivial/low,
  semantic=routine/high, the file count never decides - the user's
  routing correction of 2026-10-20) reflected in the task-routing's
  difficulty-first.md (the routing table amended live too).
- THE REPO SYNC: cp + diff verification + the header re-applied via the
  edit tool (SKILL.md only - the existing convention; the references
  byte-faithful).
- THE RECORD: the copy-style lane (`7ad6fa01`) + the CCR lane
  (`29a79248`) still running.