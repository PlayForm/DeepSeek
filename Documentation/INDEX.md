---
title: The archive index and status dashboard
category: Documentation root
kind: standard
date: 2026-10-20
status: active
registry: Documentation/INDEX.md
statuses:
  - name: the single document template (YAML frontmatter)
    state: implemented
    evidence: Documentation/ARCHIVE-STYLE.md; applied to every document below
  - name: the folder restructure (Plans/Researches/Guides/Reports/Plugins/Archive)
    state: implemented
    evidence: this tree; the moves kept every byte
  - name: the cross-reference updates to the new paths
    state: implemented
    evidence: zero stale Documentation/Plans references to moved files remain
  - name: Handoff/ and Skill/ untouched
    state: resolved
    evidence: preserved in place (the delivery record; the loadable skills)
  - name: the per-document status derivation from actual state
    state: implemented
    evidence: sourced from this session's record, git log, the runner's last line, and the built site
---

# INDEX - The Documentation Archive

> The archive index: EVERY document in the Documentation tree, its
> category, and its document-level status.
> The template (the single style) is Documentation/ARCHIVE-STYLE.md - the YAML frontmatter schema EVERY document carries.
> Statuses are derived from the ACTUAL state:
> Documentation/Plans/TOMORROW-REVIEW.md (the full record), the git log,
> the runner (`node Maintain/Run-Smokes.mjs` - its last line: all 207
> smoke suites passed), and the built site (24 pages).

## 1. The tree

    Documentation/
      INDEX.md              this index
      ARCHIVE-STYLE.md      the single template (the frontmatter schema)
      FRAMEWORK.md          the distilled requirements + the skill framework
      Brand/BRANDING.md     the brand brief
      Plans/                the living + queued plans (11)
      Researches/           the research outputs (7)
      Guides/               the operating manuals (7)
      Reports/              the audits and diagnoses (5)
      Plugins/              the registry documents (2)
      Archive/              the one-shot records (29, in 7 topics)
      Handoff/              (untouched) the original delivery record
      Skill/                (untouched) the loadable skills

## 2. The registry

### Documentation root (2)

| Document                          | Status | Kind          |
| --------------------------------- | ------ | ------------- |
| [ARCHIVE-STYLE.md](ARCHIVE-STYLE.md) | active | standard |
| [FRAMEWORK.md](FRAMEWORK.md)         | active | living-record |

### Brand (1)

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [Brand/BRANDING.md](Brand/BRANDING.md) | active | living-record |

### Plans - the living + queued (11)

| Document (Documentation/Plans/)     | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [TOMORROW-REVIEW.md](Plans/TOMORROW-REVIEW.md) | active | living-record |
| [DSH-MONOREPO-PLAN.md](Plans/DSH-MONOREPO-PLAN.md) | active | living-plan |
| [ORCHESTRATION-FAMILY.md](Plans/ORCHESTRATION-FAMILY.md) | planned | queued-plan |
| [BATCH-STATE-PLUGIN.md](Plans/BATCH-STATE-PLUGIN.md) | planned | queued-plan |
| [ROUTING-ENFORCER-PLUGIN.md](Plans/ROUTING-ENFORCER-PLUGIN.md) | planned | queued-plan |
| [SUBAGENT-QUEUE-PLUGIN.md](Plans/SUBAGENT-QUEUE-PLUGIN.md) | planned | queued-plan |
| [HONEST-FEEDBACK-PLUGIN.md](Plans/HONEST-FEEDBACK-PLUGIN.md) | planned | queued-plan |
| [APHRODITE-RUST-DYLIB-INTEGRATION.md](Plans/APHRODITE-RUST-DYLIB-INTEGRATION.md) | planned | queued-plan |
| [APHRODITE-TOOL-COMPRESSION-PLUGIN.md](Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md) | planned | queued-plan |
| [TRUSTED-PUBLISHER.md](Plans/TRUSTED-PUBLISHER.md) | planned | queued-plan |
| [UI-FAMILY-IMPLEMENTATION-PLAN.md](Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md) | planned | queued-plan |

### Researches - the research outputs (7)

| Document (Documentation/Researches/) | Status | Kind          |
| ------------------------------------ | ------ | ------------- |
| [FAMILY-INTERACTIONS-RESEARCH.md](Researches/FAMILY-INTERACTIONS-RESEARCH.md) | complete | research-output |
| [HARNESS-UI-PLUGIN-RESEARCH.md](Researches/HARNESS-UI-PLUGIN-RESEARCH.md) | complete | research-output |
| [HARNESS-UI-OPTIONS-RESEARCH.md](Researches/HARNESS-UI-OPTIONS-RESEARCH.md) | complete | research-output |
| [HARNESS-UI-TRAJECTORY-RESEARCH.md](Researches/HARNESS-UI-TRAJECTORY-RESEARCH.md) | complete | research-output |
| [NORMALIZE-GRANULAR-CONFIG-RESEARCH.md](Researches/NORMALIZE-GRANULAR-CONFIG-RESEARCH.md) | complete | research-output |
| [NORMALIZE-OVERPASS-RESEARCH.md](Researches/NORMALIZE-OVERPASS-RESEARCH.md) | complete | research-output |
| [TOOL-COACH-RESEARCH.md](Researches/TOOL-COACH-RESEARCH.md) | complete | research-output |

### Guides - the operating manuals (7)

| Document (Documentation/Guides/)    | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [DOGFOOD-TESTING.md](Guides/DOGFOOD-TESTING.md) | active | guide |
| [DSH-REGISTRY-LISTING.md](Guides/DSH-REGISTRY-LISTING.md) | active | guide |
| [Governor-CASCADES.md](Guides/Governor-CASCADES.md) | active | guide |
| [Governor-README.md](Guides/Governor-README.md) | active | guide |
| [Governor-SCHEME.md](Guides/Governor-SCHEME.md) | active | guide |
| [Governor-TRIO-GRAPH.md](Guides/Governor-TRIO-GRAPH.md) | active | guide |
| [LIVE-TESTING-METHODOLOGY.md](Guides/LIVE-TESTING-METHODOLOGY.md) | active | guide |

### Reports - the audits and diagnoses (5)

| Document (Documentation/Reports/)   | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [CASE-REVIEW.md](Reports/CASE-REVIEW.md) | complete | report |
| [Commonalization-AUDIT.md](Reports/Commonalization-AUDIT.md) | complete | report |
| [FileContent-FLAVOR-DESIGN.md](Reports/FileContent-FLAVOR-DESIGN.md) | complete | report |
| [FSOBSERVED-DELIVERY.md](Reports/FSOBSERVED-DELIVERY.md) | complete | report |
| [P5-V2-DIAGNOSIS.md](Reports/P5-V2-DIAGNOSIS.md) | complete | report |

### Plugins - the registry documents (2)

| Document (Documentation/Plugins/)   | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [PLUGIN-FAMILY.md](Plugins/PLUGIN-FAMILY.md) | active | living-record |
| [ORCHESTRATION-PLUGINS.md](Plugins/ORCHESTRATION-PLUGINS.md) | planned | living-record |

### Archive - the one-shot records (29, by topic)

Archive/Smoke-Restructure (2):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [SMOKE-SUITE-RESTRUCTURE-NOTE.md](Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-NOTE.md) | complete | one-shot-record |
| [SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md](Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md) | complete | one-shot-record |

Archive/Site (3):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [SITE-UPDATE-NOTE.md](Archive/Site/SITE-UPDATE-NOTE.md) | complete | one-shot-record |
| [SITE-UPDATE-BLUEPRINT.md](Archive/Site/SITE-UPDATE-BLUEPRINT.md) | complete | one-shot-record |
| [CASE-STUDY-PLAN.md](Archive/Site/CASE-STUDY-PLAN.md) | complete | one-shot-record |

Archive/Live-Containers (15):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [LIVE-CONTAINERS-RESEARCH.md](Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md) | complete | one-shot-record |
| [Requirements/00-OVERVIEW.md](Archive/Live-Containers/Requirements/00-OVERVIEW.md) | complete | one-shot-record |
| [Requirements/01-LIVE-TOOL-CALL-BLOCKS.md](Archive/Live-Containers/Requirements/01-LIVE-TOOL-CALL-BLOCKS.md) | complete | one-shot-record |
| [Requirements/02-PLANTED-BLOCKS.md](Archive/Live-Containers/Requirements/02-PLANTED-BLOCKS.md) | complete | one-shot-record |
| [Requirements/03-BLOCK-TEMPLATES.md](Archive/Live-Containers/Requirements/03-BLOCK-TEMPLATES.md) | complete | one-shot-record |
| [Requirements/04-TASK-FAILSAFES.md](Archive/Live-Containers/Requirements/04-TASK-FAILSAFES.md) | complete | one-shot-record |
| [Requirements/05-MINI-CONVERSATION-SUGGESTER.md](Archive/Live-Containers/Requirements/05-MINI-CONVERSATION-SUGGESTER.md) | complete | one-shot-record |
| [Requirements/06-BETTER-IDEAS.md](Archive/Live-Containers/Requirements/06-BETTER-IDEAS.md) | complete | one-shot-record |
| [Requirements/07-SEAM-MAP.md](Archive/Live-Containers/Requirements/07-SEAM-MAP.md) | complete | one-shot-record |
| [Requirements/08-LIVE-FILE-MONITORS.md](Archive/Live-Containers/Requirements/08-LIVE-FILE-MONITORS.md) | complete | one-shot-record |
| [Design/IMPLEMENTATION-DESIGN.md](Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md) | complete | one-shot-record |
| [Design/FILE-MONITORS-DESIGN.md](Archive/Live-Containers/Design/FILE-MONITORS-DESIGN.md) | complete | one-shot-record |
| [Design/APPEND-SEAM.md](Archive/Live-Containers/Design/APPEND-SEAM.md) | complete | one-shot-record |
| [Design/AWAIT-MARKER.md](Archive/Live-Containers/Design/AWAIT-MARKER.md) | complete | one-shot-record |
| [Design/COMPLETION-ERGONOMICS.md](Archive/Live-Containers/Design/COMPLETION-ERGONOMICS.md) | complete | one-shot-record |
| [Design/PLANTED-LEASE.md](Archive/Live-Containers/Design/PLANTED-LEASE.md) | complete | one-shot-record |
| [Design/SUGGESTER-CONFIGURED.md](Archive/Live-Containers/Design/SUGGESTER-CONFIGURED.md) | complete | one-shot-record |

(17 rows: 1 research + 9 requirements + 7 designs.)

Archive/Tool-Coach (2):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [TOOL-COACH-PLAN.md](Archive/Tool-Coach/TOOL-COACH-PLAN.md) | complete | one-shot-record |
| [TOOL-COACH-OPERATIVE-PLAN.md](Archive/Tool-Coach/TOOL-COACH-OPERATIVE-PLAN.md) | complete | one-shot-record |

Archive/Split (2):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [SPLICE-ETS.md](Archive/Split/SPLICE-ETS.md) | complete | one-shot-record |
| [DUAL-SOURCE-BUNDLING.md](Archive/Split/DUAL-SOURCE-BUNDLING.md) | superseded | one-shot-record |

Archive/CCR (2):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [CCR-FAMILY-GAP-REPORT.md](Archive/CCR/CCR-FAMILY-GAP-REPORT.md) | complete | one-shot-record |
| [CCR-PROFILE-WIRING.md](Archive/CCR/CCR-PROFILE-WIRING.md) | complete | one-shot-record |

Archive/Normalize (1):

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [NORMALIZE-GRANULAR-PLAN.md](Archive/Normalize/NORMALIZE-GRANULAR-PLAN.md) | complete | one-shot-record |

## 3. Untouched trees

| Tree     | Why untouched                                                            |
| -------- | ------------------------------------------------------------------------ |
| Handoff/ | the original delivery record, referenced by path from the guides          |
| Skill/   | the loadable skills home - the filesystem provider discovers these paths  |

## 4. The moves (old path -> new path)

- Documentation/Plans/SMOKE-SUITE-RESTRUCTURE-{NOTE,BLUEPRINT}.md -> Documentation/Archive/Smoke-Restructure/
- Documentation/Plans/SITE-UPDATE-{NOTE,BLUEPRINT}.md, CASE-STUDY-PLAN.md -> Documentation/Archive/Site/
- Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md -> Documentation/Archive/Live-Containers/
- Documentation/Plans/LiveContainers/{Requirements,Design}/*.md -> Documentation/Archive/Live-Containers/{Requirements,Design}/
- Documentation/Plans/TOOL-COACH-{PLAN,OPERATIVE-PLAN}.md -> Documentation/Archive/Tool-Coach/
- Documentation/Plans/{SPLICE-ETS,DUAL-SOURCE-BUNDLING}.md -> Documentation/Archive/Split/
- Documentation/Plans/CCR-{FAMILY-GAP-REPORT,PROFILE-WIRING}.md -> Documentation/Archive/CCR/
- Documentation/Plans/NORMALIZE-GRANULAR-PLAN.md -> Documentation/Archive/Normalize/
- Documentation/Plans/{FAMILY-INTERACTIONS-RESEARCH,HARNESS-UI-*-RESEARCH,NORMALIZE-*-RESEARCH,TOOL-COACH-RESEARCH}.md -> Documentation/Researches/
- Documentation/Plans/DOGFOOD-TESTING.md -> Documentation/Guides/
