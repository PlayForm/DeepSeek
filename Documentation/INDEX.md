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
  - name: the granular split (the large plans/researches as per-topic subdocuments)
    state: implemented
    evidence: Plans/Batch-Edit-Tool (19), Plans/Representation-First (14), Plans/UI-Family (14), Plans/Workspace-Family (25), Archive/Tomorrow-Review (8) - the parents became hubs; every section preserved
  - name: the cross-reference updates to the new paths
    state: implemented
    evidence: the hub parents kept their paths - no external reference broke; the subdocs cross-link to their hubs
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
> the runner (`node Maintain/Run-Smokes.mjs`), and the built site.

## 1. The tree

    Documentation/
      INDEX.md                     this index
      ARCHIVE-STYLE.md             the single template (the frontmatter schema)
      FRAMEWORK.md                 the distilled requirements + the skill framework
      Brand/BRANDING.md            the brand brief
      Plans/                       the living + queued plans (15) + 4 granular families (71)
        Batch-Edit-Tool/           the batch edit tool's granular topics (19)
        Representation-First/      the representation-first research's topics (14)
        UI-Family/                 the UI family plan's phases (14)
        Workspace-Family/          the workspace family's per-package docs (25)
      Researches/                  the research outputs (8)
      Guides/                      the operating manuals (7)
      Reports/                     the audits and diagnoses (5)
      Plugins/                     the registry documents (2)
      Archive/                     the one-shot records (37, in 8 topics)
        Smoke-Restructure/  Site/  Live-Containers/  Tool-Coach/
        Split/  CCR/  Normalize/  Tomorrow-Review/
      Handoff/                     (untouched) the original delivery record
      Skill/                       (untouched) the loadable skills

## 2. The registry

### Documentation root (3)

| Document                          | Status | Kind          |
| --------------------------------- | ------ | ------------- |
| [ARCHIVE-STYLE.md](ARCHIVE-STYLE.md) | active | standard |
| [FRAMEWORK.md](FRAMEWORK.md)         | active | living-record |
| [INDEX.md](INDEX.md)                 | active | standard |

### Brand (1)

| Document                            | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [Brand/BRANDING.md](Brand/BRANDING.md) | active | living-record |

### Plans - the living + queued hubs (24)

| Document (Documentation/Plans/)     | Status | Kind          |
| ----------------------------------- | ------ | ------------- |
| [TOMORROW-REVIEW.md](Plans/TOMORROW-REVIEW.md) | active | living-record |
| [DSH-MONOREPO-PLAN.md](Plans/DSH-MONOREPO-PLAN.md) | active | living-plan |
| [BATCH-EDIT-TOOL-FEATURE.md](Plans/BATCH-EDIT-TOOL-FEATURE.md) | active | living-plan (R-BET-1 hub) |
| [BATCH-EDIT-TOOL-SUGGESTIONS.md](Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md) | active | living-record (R-BET-2 hub) |
| [REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md](Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md) | complete | research-output (hub) |
| [WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md](Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md) | superseded | living-plan (hub; the v4.1 distilled) |
| [UI-FAMILY-IMPLEMENTATION-PLAN.md](Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md) | superseded | queued-plan (hub; the v4.1 distilled) |
| [ORCHESTRATION-FAMILY.md](Plans/ORCHESTRATION-FAMILY.md) | planned | queued-plan |
| [BATCH-STATE-PLUGIN.md](Plans/BATCH-STATE-PLUGIN.md) | planned | queued-plan |
| [ROUTING-ENFORCER-PLUGIN.md](Plans/ROUTING-ENFORCER-PLUGIN.md) | planned | queued-plan |
| [SUBAGENT-QUEUE-PLUGIN.md](Plans/SUBAGENT-QUEUE-PLUGIN.md) | planned | queued-plan |
| [HONEST-FEEDBACK-PLUGIN.md](Plans/HONEST-FEEDBACK-PLUGIN.md) | planned | queued-plan |
| [APHRODITE-RUST-DYLIB-INTEGRATION.md](Plans/APHRODITE-RUST-DYLIB-INTEGRATION.md) | planned | queued-plan |
| [APHRODITE-TOOL-COMPRESSION-PLUGIN.md](Plans/APHRODITE-TOOL-COMPRESSION-PLUGIN.md) | planned | queued-plan |
| [TRUSTED-PUBLISHER.md](Plans/TRUSTED-PUBLISHER.md) | planned | queued-plan |
| [RELEASE-0.1.0.md](Plans/RELEASE-0.1.0.md) | active | one-shot-record (the release runbook) |
| [PATTERN-GRAPH-PLUGIN.md](Plans/PATTERN-GRAPH-PLUGIN.md) | planned | queued-plan (the general suggestion model) |
| [SEARCH-SUGGESTER-PLUGIN.md](Plans/SEARCH-SUGGESTER-PLUGIN.md) | planned | queued-plan (the pattern graph's first consumer) |
| [PASS-ON-AND-INGESTER.md](Plans/PASS-ON-AND-INGESTER.md) | planned | queued-plan (the batch decision flow) |
| [SITE-POLISH-BREAKDOWN.md](Plans/SITE-POLISH-BREAKDOWN.md) | planned | queued-plan (site content and wording) |
| [FAMILY-ORGANISATION-ANALYSIS.md](Plans/FAMILY-ORGANISATION-ANALYSIS.md) | planned | queued-plan (duplication, functionality, placement) |
| [IMPLEMENTATION-WAVE-1.md](Plans/IMPLEMENTATION-WAVE-1.md) | active | living-plan (the decision record and workstreams) |
| [UI-FAMILY-V4-1.md](Plans/UI-FAMILY-V4-1.md) | active | living-plan (the visual panel distilled) |
| [WORKSPACE-FAMILY-V4-1.md](Plans/WORKSPACE-FAMILY-V4-1.md) | active | living-plan (the dynamic workspace distilled) |

### Plans/Batch-Edit-Tool - the batch edit tool's granular topics (19)

R-BET-1 topics: [VISION-AND-REPRESENTATION](Plans/Batch-Edit-Tool/VISION-AND-REPRESENTATION.md) (the why + the representation contract) · [EVICTION](Plans/Batch-Edit-Tool/EVICTION.md) (the four triggers) · [PARADIGM-CATALOG](Plans/Batch-Edit-Tool/PARADIGM-CATALOG.md) (13 paradigms ranked) · [FEASIBILITY](Plans/Batch-Edit-Tool/FEASIBILITY.md) (the verdict + the seams) · [SCHEMA](Plans/Batch-Edit-Tool/SCHEMA.md) (the input schema + Process<File>) · [STATE-MACHINE](Plans/Batch-Edit-Tool/STATE-MACHINE.md) (the events + the ledger contract) · [STATE-PRESENTATION](Plans/Batch-Edit-Tool/STATE-PRESENTATION.md) · [LIVE-VIEW-FRAMEWORK](Plans/Batch-Edit-Tool/LIVE-VIEW-FRAMEWORK.md) · [PACKAGE-AND-GOVERNANCE](Plans/Batch-Edit-Tool/PACKAGE-AND-GOVERNANCE.md) (the anatomy + the govern marker) · [ACCEPTANCE-CRITERIA](Plans/Batch-Edit-Tool/ACCEPTANCE-CRITERIA.md) (10 checks) · [RESIDUALS](Plans/Batch-Edit-Tool/RESIDUALS.md) (7 open) · [LATER-STAGES](Plans/Batch-Edit-Tool/LATER-STAGES.md) (the graph, the code-block, the token-waste).
R-BET-2 topics: [PARADIGM-DEEPENING](Plans/Batch-Edit-Tool/PARADIGM-DEEPENING.md) (the call-escape WHY verbatim + the type system) · [FORMS-AND-GOVERNANCE-LAYERS](Plans/Batch-Edit-Tool/FORMS-AND-GOVERNANCE-LAYERS.md) (the nine forms + the five layers) · [IMPROVEMENTS-OVER-BASH-SED](Plans/Batch-Edit-Tool/IMPROVEMENTS-OVER-BASH-SED.md) · [COUNTER-INTUITIVE-IDEAS](Plans/Batch-Edit-Tool/COUNTER-INTUITIVE-IDEAS.md) · [RANKED-SUGGESTIONS](Plans/Batch-Edit-Tool/RANKED-SUGGESTIONS.md) (14 ranked) · [RESIDUALS-AND-MERGE-POINT](Plans/Batch-Edit-Tool/RESIDUALS-AND-MERGE-POINT.md).
Evidence: [TRAJECTORY-EVIDENCE](Plans/Batch-Edit-Tool/TRAJECTORY-EVIDENCE.md) (the measured cost of one-edit-at-a-time - the single owner of the figures).

### Plans/Representation-First - the research's topics (14)

Round 1: [FRAMING-AND-LAYERS](Plans/Representation-First/FRAMING-AND-LAYERS.md) · [RESEARCH-QUESTIONS-AND-EXPERIMENT](Plans/Representation-First/RESEARCH-QUESTIONS-AND-EXPERIMENT.md).
Round 2: [INVERSION-AND-CONTRACTS](Plans/Representation-First/INVERSION-AND-CONTRACTS.md) · [VIEWS-LENSES-AUTHORITY](Plans/Representation-First/VIEWS-LENSES-AUTHORITY.md) · [EVICTION-AND-PROPOSALS](Plans/Representation-First/EVICTION-AND-PROPOSALS.md) · [RECOVERY-FAIL-OPEN-MEASUREMENT](Plans/Representation-First/RECOVERY-FAIL-OPEN-MEASUREMENT.md).
Round 3: [RUNTIME-AND-TRUTH](Plans/Representation-First/RUNTIME-AND-TRUTH.md) · [CANDIDATES-AND-BOUNDARIES](Plans/Representation-First/CANDIDATES-AND-BOUNDARIES.md) · [APPROVAL-GUARANTEES-FAILURES](Plans/Representation-First/APPROVAL-GUARANTEES-FAILURES.md).
Round 4: [RECONCILIATION-MANDATE](Plans/Representation-First/RECONCILIATION-MANDATE.md) · [COMMIT-GOVERNANCE-AND-RECOVERY](Plans/Representation-First/COMMIT-GOVERNANCE-AND-RECOVERY.md) · [AUTHORITY-AND-EVIDENCE](Plans/Representation-First/AUTHORITY-AND-EVIDENCE.md) · [ORCHESTRATION-AND-INTEGRATION-FIXES](Plans/Representation-First/ORCHESTRATION-AND-INTEGRATION-FIXES.md) · [NEXT-SLICE](Plans/Representation-First/NEXT-SLICE.md).

### Plans/UI-Family - the implementation plan's phases (14)

[BRIEF](Plans/UI-Family/BRIEF.md) · [PHASE-0-ORIENTATION](Plans/UI-Family/PHASE-0-ORIENTATION.md) · [PHASE-1-SITE-COMMIT](Plans/UI-Family/PHASE-1-SITE-COMMIT.md) · [PHASE-2-PANEL-CONTRACT](Plans/UI-Family/PHASE-2-PANEL-CONTRACT.md) · [PHASE-3-FIRST-ADAPTER](Plans/UI-Family/PHASE-3-FIRST-ADAPTER.md) · [PHASE-4-OPTIONS-FORMS](Plans/UI-Family/PHASE-4-OPTIONS-FORMS.md) · [PHASE-5-ADAPTERS-AND-LEDGER-TAILS](Plans/UI-Family/PHASE-5-ADAPTERS-AND-LEDGER-TAILS.md) · [PHASE-6-INTERACTION-IMPROVEMENTS](Plans/UI-Family/PHASE-6-INTERACTION-IMPROVEMENTS.md) · [PHASE-7-PLAIN-FIELD-BRIDGE](Plans/UI-Family/PHASE-7-PLAIN-FIELD-BRIDGE.md) · [RISKS-AND-MITIGATIONS](Plans/UI-Family/RISKS-AND-MITIGATIONS.md) · [STATUS-LEDGER](Plans/UI-Family/STATUS-LEDGER.md) · [EXTENSIONS](Plans/UI-Family/EXTENSIONS.md) · [APPENDIX-INSPECT-CAPTURES](Plans/UI-Family/APPENDIX-INSPECT-CAPTURES.md) · [ONE-PARAGRAPH-SUMMARY](Plans/UI-Family/ONE-PARAGRAPH-SUMMARY.md).

### Plans/Workspace-Family - the decomposition's per-package docs (25)

Frame: [NAMING-BY-ROLE](Plans/Workspace-Family/NAMING-BY-ROLE.md) · [PHASED-DELIVERY](Plans/Workspace-Family/PHASED-DELIVERY.md) · [INVERSE-REPRESENTATION](Plans/Workspace-Family/INVERSE-REPRESENTATION.md) · [ANY-FILE-ADAPTERS](Plans/Workspace-Family/ANY-FILE-ADAPTERS.md) · [DATABASES-AND-CLOUD](Plans/Workspace-Family/DATABASES-AND-CLOUD.md) · [PITFALLS-LOG](Plans/Workspace-Family/PITFALLS-LOG.md) · [RFC-QUEUE](Plans/Workspace-Family/RFC-QUEUE.md) · [RESEARCH-PLACES](Plans/Workspace-Family/RESEARCH-PLACES.md).
Packages: [WORKSPACE-AGENT](Plans/Workspace-Family/WORKSPACE-AGENT.md) (the agent) · [OBSERVE](Plans/Workspace-Family/OBSERVE.md) · [SEMANTICS](Plans/Workspace-Family/SEMANTICS.md) · [OPERATE](Plans/Workspace-Family/OPERATE.md) · [GOVERN](Plans/Workspace-Family/GOVERN.md) · [AUTHORITY](Plans/Workspace-Family/AUTHORITY.md) · [JOURNAL](Plans/Workspace-Family/JOURNAL.md) · [LIVE](Plans/Workspace-Family/LIVE.md) · [MERGE](Plans/Workspace-Family/MERGE.md) · [MONITOR](Plans/Workspace-Family/MONITOR.md) · [CONTEXT](Plans/Workspace-Family/CONTEXT.md) · [APPROVE](Plans/Workspace-Family/APPROVE.md) · [AUDIT](Plans/Workspace-Family/AUDIT.md) · [EVIDENCE](Plans/Workspace-Family/EVIDENCE.md) · [GRAPH](Plans/Workspace-Family/GRAPH.md) (later stage) · [REFLECT](Plans/Workspace-Family/REFLECT.md) (later stage) · [SHARED-LIBRARY](Plans/Workspace-Family/SHARED-LIBRARY.md) (lib-dsh-workspace-live).

### Researches - the research outputs (8)

| Document (Documentation/Researches/) | Status | Kind          |
| ------------------------------------ | ------ | ------------- |
| [AGENT-TUNER-RESEARCH.md](Researches/AGENT-TUNER-RESEARCH.md) | complete | research-output |
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

### Archive - the one-shot records (37, by topic)

Archive/Smoke-Restructure (2): [SMOKE-SUITE-RESTRUCTURE-NOTE.md](Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-NOTE.md) · [SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md](Archive/Smoke-Restructure/SMOKE-SUITE-RESTRUCTURE-BLUEPRINT.md) - both complete, one-shot-records.

Archive/Site (3): [SITE-UPDATE-NOTE.md](Archive/Site/SITE-UPDATE-NOTE.md) · [SITE-UPDATE-BLUEPRINT.md](Archive/Site/SITE-UPDATE-BLUEPRINT.md) · [CASE-STUDY-PLAN.md](Archive/Site/CASE-STUDY-PLAN.md) - all complete.

Archive/Live-Containers (17): [LIVE-CONTAINERS-RESEARCH.md](Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md); Requirements: [00-OVERVIEW](Archive/Live-Containers/Requirements/00-OVERVIEW.md) · [01-LIVE-TOOL-CALL-BLOCKS](Archive/Live-Containers/Requirements/01-LIVE-TOOL-CALL-BLOCKS.md) · [02-PLANTED-BLOCKS](Archive/Live-Containers/Requirements/02-PLANTED-BLOCKS.md) · [03-BLOCK-TEMPLATES](Archive/Live-Containers/Requirements/03-BLOCK-TEMPLATES.md) · [04-TASK-FAILSAFES](Archive/Live-Containers/Requirements/04-TASK-FAILSAFES.md) · [05-MINI-CONVERSATION-SUGGESTER](Archive/Live-Containers/Requirements/05-MINI-CONVERSATION-SUGGESTER.md) · [06-BETTER-IDEAS](Archive/Live-Containers/Requirements/06-BETTER-IDEAS.md) · [07-SEAM-MAP](Archive/Live-Containers/Requirements/07-SEAM-MAP.md) · [08-LIVE-FILE-MONITORS](Archive/Live-Containers/Requirements/08-LIVE-FILE-MONITORS.md); Design: [IMPLEMENTATION-DESIGN](Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md) · [FILE-MONITORS-DESIGN](Archive/Live-Containers/Design/FILE-MONITORS-DESIGN.md) · [APPEND-SEAM](Archive/Live-Containers/Design/APPEND-SEAM.md) · [AWAIT-MARKER](Archive/Live-Containers/Design/AWAIT-MARKER.md) · [COMPLETION-ERGONOMICS](Archive/Live-Containers/Design/COMPLETION-ERGONOMICS.md) · [PLANTED-LEASE](Archive/Live-Containers/Design/PLANTED-LEASE.md) · [SUGGESTER-CONFIGURED](Archive/Live-Containers/Design/SUGGESTER-CONFIGURED.md) - all complete.

Archive/Tool-Coach (2): [TOOL-COACH-PLAN.md](Archive/Tool-Coach/TOOL-COACH-PLAN.md) · [TOOL-COACH-OPERATIVE-PLAN.md](Archive/Tool-Coach/TOOL-COACH-OPERATIVE-PLAN.md) - both complete.

Archive/Split (2): [SPLICE-ETS.md](Archive/Split/SPLICE-ETS.md) (complete) · [DUAL-SOURCE-BUNDLING.md](Archive/Split/DUAL-SOURCE-BUNDLING.md) (superseded).

Archive/CCR (2): [CCR-FAMILY-GAP-REPORT.md](Archive/CCR/CCR-FAMILY-GAP-REPORT.md) · [CCR-PROFILE-WIRING.md](Archive/CCR/CCR-PROFILE-WIRING.md) - both complete.

Archive/Normalize (1): [NORMALIZE-GRANULAR-PLAN.md](Archive/Normalize/NORMALIZE-GRANULAR-PLAN.md) - complete.

Archive/Tomorrow-Review (16) - the descriptive plan's granular topics (byte-preserved copies; the master record Documentation/Plans/TOMORROW-REVIEW.md remains the authoritative source): [CURRENT-STATE-2026-10-07](Archive/Tomorrow-Review/CURRENT-STATE-2026-10-07.md) · [IN-FLIGHT-WORK-2026-10-07](Archive/Tomorrow-Review/IN-FLIGHT-WORK-2026-10-07.md) · [MISSING-AND-OPEN-DECISIONS](Archive/Tomorrow-Review/MISSING-AND-OPEN-DECISIONS.md) · [TOMORROWS-PROCESS](Archive/Tomorrow-Review/TOMORROWS-PROCESS.md) · [RUNNING-FACTS](Archive/Tomorrow-Review/RUNNING-FACTS.md) · [NEXT-BATCH-2026-10-08](Archive/Tomorrow-Review/NEXT-BATCH-2026-10-08.md) · [APHRODITE-WEBSITE-SESSION](Archive/Tomorrow-Review/APHRODITE-WEBSITE-SESSION.md) · [BATCH-COMPLETE-AND-SLIP-2026-10-09](Archive/Tomorrow-Review/BATCH-COMPLETE-AND-SLIP-2026-10-09.md). The chronological batch log's per-topic records (distilled from the dated sections, 2026-10-19/20): [BATCH-LOG-RESTRUCTURE-2026-10-19](Archive/Tomorrow-Review/BATCH-LOG-RESTRUCTURE-2026-10-19.md) · [BATCH-LOG-SITE-UPDATE-2026-10-19](Archive/Tomorrow-Review/BATCH-LOG-SITE-UPDATE-2026-10-19.md) · [BATCH-LOG-LIVE-CONTAINERS-2026-10-19](Archive/Tomorrow-Review/BATCH-LOG-LIVE-CONTAINERS-2026-10-19.md) · [BATCH-LOG-DEPENDENCY-UPGRADE-2026-10-20](Archive/Tomorrow-Review/BATCH-LOG-DEPENDENCY-UPGRADE-2026-10-20.md) · [BATCH-LOG-LIVE-TESTING-2026-10-20](Archive/Tomorrow-Review/BATCH-LOG-LIVE-TESTING-2026-10-20.md) · [BATCH-LOG-ALIAS-SWEEP-2026-10-20](Archive/Tomorrow-Review/BATCH-LOG-ALIAS-SWEEP-2026-10-20.md) · [BATCH-LOG-ARCHIVE-AND-SKILL-RESTRUCTURE-2026-10-20](Archive/Tomorrow-Review/BATCH-LOG-ARCHIVE-AND-SKILL-RESTRUCTURE-2026-10-20.md) · [BATCH-LOG-FEATURE-LOG-2026-10-20](Archive/Tomorrow-Review/BATCH-LOG-FEATURE-LOG-2026-10-20.md).

## 3. Untouched trees

| Tree     | Why untouched                                                            |
| -------- | ------------------------------------------------------------------------ |
| Handoff/ | the original delivery record, referenced by path from the guides          |
| Skill/   | the loadable skills home - the filesystem provider discovers these paths  |

## 4. The granular split (old body -> new home)

- Documentation/Plans/BATCH-EDIT-TOOL-FEATURE.md (R-BET-1) -> 12 topics under Documentation/Plans/Batch-Edit-Tool/; the parent kept as the hub (the map + the reading order).
- Documentation/Plans/BATCH-EDIT-TOOL-SUGGESTIONS.md (R-BET-2) -> 6 topics under Documentation/Plans/Batch-Edit-Tool/; the parent kept as the hub.
- Documentation/Plans/REPRESENTATION-FIRST-WORKSPACE-RESEARCH.md (4 rounds) -> 14 topics under Documentation/Plans/Representation-First/; the parent kept as the hub.
- Documentation/Plans/WORKSPACE-PLUGIN-FAMILY-DECOMPOSITION.md -> 25 per-package/frame docs under Documentation/Plans/Workspace-Family/; the parent kept as the hub (the family map).
- Documentation/Plans/UI-FAMILY-IMPLEMENTATION-PLAN.md (the brief + 8 phases + risks + status + extensions + 2 appendices) -> 14 docs under Documentation/Plans/UI-Family/; the parent kept as the hub.
- Documentation/Plans/TOMORROW-REVIEW.md sections 1-9 -> 8 topics under Documentation/Archive/Tomorrow-Review/ (byte-preserved copies); the master log stays intact and authoritative. The chronological batch log (the dated sections from "QUEUE ADDITION (2026-10-19)" onward) -> 8 per-topic records under the same folder (the BATCH-LOG-* series, distilled per-topic views; the master log stays the authoritative source).
