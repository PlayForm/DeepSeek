> Specialized working copy (repo): synced from ~/.dsh/skills/session-orientation/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: session-orientation
description: THE first-load protocol for ANY new session working in this repository (or any successor repository of the DSH Family) - orient from the repo's OWN skills FIRST (Documentation/Skill/ is the specialized truth; ~/.dsh/skills/ is the fallback), read the current state from the root README + Documentation/Plans/ + Documentation/Guides/, load the routing law (every subagent = cloudflare-workers-ai/@cf/zai-org/glm-5.3-flash, reasoningEffort low), apply the git checks-only law (never mutate git - report READY-TO-COMMIT), know the published DSH Family (all 25 @playform packages live at 0.0.1), and know the NEXT session's task - authoring the Aphrodite Site. Load FIRST, before anything else, in every fresh session.
whenToUse: Mandatory at session start, before any other skill, tool call, or delegation. If a fresh session is about to act in this repository without having read the repo's own skills and this orientation protocol, STOP and load this first.
---

# SESSION ORIENTATION - Operating Manual

The first-load protocol for every new session: a fresh session knows NOTHING
except what it loads, so the loading order, the non-negotiable laws, the
published family, and the next task are fixed here. The full philosophy of
each rule lives in the references; this file is the index. Load FIRST, before
anything else, in every fresh session.

## The Loading Order (do this before anything else)

- **Orientation order** - the loading order is fixed and followed top to bottom, self-contained, before any action - see ./references/orientation-order.md
- **Repo skills first** - Documentation/Skill/ is the SPECIALIZED TRUTH, ~/.dsh/skills/ is the FALLBACK, the repo copy wins, fixes sync to BOTH copies - see ./references/repo-skills-first.md
- **Current state** - root README.md, then Documentation/Plans/, then Documentation/Guides/ (family / work / deep docs) - see ./references/current-state-reading.md

## The Repository Itself

- **Repository map** - the PlayForm DeepSeek monorepo: Classic/ EffectTS/ Boilerplate/ Site/ Test/ Documentation/ Maintain/, a 21-page site, built via `cd Site && pnpm prepublishOnly` - see ./references/repository-map.md

## The Non-Negotiable Laws

- **Routing law** - every subagent delegation = cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / reasoningEffort low, explicit triple always passed - see ./references/routing-law.md
- **Git law** - git is checks only, never mutate; report READY-TO-COMMIT with file list + suggested message (user-mandated 2026-10-10) - see ./references/git-law.md
- **File-write law** - file writes go only through the write/raw-write/edit tool API; the normalize hooks are active - see ./references/file-write-law.md

## The Published Family and the Next Task

- **Published family** - all 25 @playform packages live at 0.0.1: ets-base-dsh + 12 Classic + 12 EffectTS; never mix the splits - see ./references/published-family.md
- **Next task: the Aphrodite Site** - author ~/Developer/Application/PlayForm/Aphrodite/Site, a richer iteration of this repo's Site/ (the PlayForm-parented path; the older path is stale) - see ./references/next-task-aphrodite.md
- **Lane laws for the site build** - no dev servers, no tsc, no git mutations; build IS the verification; raw-write for glyphs; documentation-first content - see ./references/lane-laws.md

## The Session's Memory and Self-Test

- **Recitable summary** - the one-paragraph summary every fresh session must be able to recite after orientation - see ./references/recitable-summary.md
- **Model pointer (2026-10-10)** - the site batch runs the formalized orchestration model; read it + the queue + Site/Documentation/TRACKING.md - see ./references/model-pointer.md
