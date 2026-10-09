---
name: orchestrator-batch
description: THE orchestration methodology for the DeepSeek Harness Plugin Family batch - the incremental, synchronous, wall-clock-ordered workflow: the user's thought arrives -> formalize it -> delegate to an ACTIVE agent (the serialized queue) or an IDLE agent (paused, spec retained) -> monitor the execution -> verify with the arbiters -> report. Includes the queue bookkeeping, the surface-conflict analysis, the stall/error recovery, and the spec-reconfiguration authority. Load before running any multi-agent batch in this project.
whenToUse: Mandatory for the agent-batch regime in this monorepo: whenever the user gives a task that lands as agents (site work, docs, corrections, scans), whenever the user asks to "launch an IDLE agent", and whenever you must decide the order, the concurrency, or the re-dispatch of the batch.
---
# Orchestrator Batch - Operating Manual

## The loop (incremental + synchronous in wall-clock time)
1. RECEIVE the user's thought/instruction - however fragmentary.
2. FORMALIZE it: structure it (scope, the surface, the exclusions, the sequence), bind it to the shared facts (the totals 733/746, the 19-method ledger, the versions 0.0.1 / effect 4.0.2, the byte-exact ledger quotes), bind it to the conventions (tabs, the typography laws, the Harness Blue + zero elevation, never-commit, the smokes/site-build as the arbiters), and shape the report format. If the user's wording is ambiguous, formalize the most faithful reading and state it.
3. DELEGATE: either an ACTIVE agent (its slot in the serialized queue - one agent at a time) or an IDLE agent (the paused pattern: a fully self-contained spec + the activation rules + the confirmation line). The spec must be self-contained - the subagent's conversation cannot see this one.
4. MONITOR: the queue bookkeeping (active / paused / queued), the SURFACE-CONFLICT analysis (which agents may run concurrently - only when their files are provably disjoint; serialize everything else), the activation cascade (idle agents fire as their surfaces free up), the stall recovery (no file activity -> send a checkpoint nudge: "report your state; STOP reading; move to the ACTION phase"; then a hard deadline nudge if needed), the failure handling (an agent that died: verify the tree for partial edits first, then re-dispatch with the same or a corrected spec).
5. VERIFY: the ARBITERS ARE THE LANES' OWN - every activation carries the
   arbiter mandate (the 24 smokes print their own totals - Classic 733 /
   EffectTS 746; the site lanes run the build + the built-HTML/CSS + the
   measured checks themselves, and report the numbers). THE ORCHESTRATOR DOES
   NOT EXECUTE (the user-mandated law, 2026-10-09 - the slip lesson, enforced
   after the orchestrator ran a build that cleared Target/ + pre-investigated
   feedback surfaces): no builds, no site edits, no measurement runs, NO
   surface-location investigation before relaying feedback - the feedback goes
   to the idlers VERBATIM and the idlers investigate + locate + execute +
   build + verify. The orchestrator's hands-on work is LIMITED to: (a) relaying
   the user's feedback verbatim to the idle agents; (b) keeping the records
   (the handoff, the Tasks/, the process records); (c) read-only spot-checks of
   the agents' REPORTED claims (greps over the committed/built output only -
   trust the agents' printed totals over prose claims; a claim that contradicts
   the printed totals is wrong - e.g. 795/808 were arithmetic phantoms). The
   user commits mid-session - the index state is theirs.
   THE LANES' ARBITER FORM (the user's side note, 2026-10-09): the lanes do NOT
   launch the dev server (no astro dev/preview - the port conflicts) and run NO
   tsc checks and NO git checks - when a build is needed the lane runs
   `cd Site && pnpm prepublishOnly` (the site's build script) + the
   built-HTML/CSS verification over Target/ + the measured checks only.
6. REPORT: the per-agent results, the residuals + the decisions for the user, the queue's next steps. The user decides the commit protocol.

## The spec-reconfiguration authority (user-granted)
- As requirements come in and change, and as the OTHER agents report feedback: RE-CONFIGURE the specs - amend an idle agent's spec via send_message (it acknowledges "<NAME> SPEC AMENDED - IDLE"), amend a working agent's mandate mid-flight when the change is compatible (a checkpoint message), re-apply the changed requirements to the not-yet-started agents' prompts, and re-dispatch failed agents with the corrected specs.
- The amendments override the base specs where they conflict; record the durable queue + the new agents in Documentation/Plans/TOMORROW-REVIEW.md (the process record - the numbered items) so the state survives connectivity losses and session switches.

## The shared facts (the truth the whole batch must not contradict)
The totals: Classic 733 / EffectTS 746 (the suites print them); the per-suite pairs (core 14/17, factory 34/41, governor 78/81, pinner 32, cargo 62, dash 132, five flavors 62, file 71); the factory surface: 19 callable methods (the SCHEME sections: §2.7 Write+GuardedWrite, §2.16 UpdateKey, §2.17 RegisterGovern, §2.18 Govern); the releases at 0.0.1; the effect pin 4.0.2; the ncuBin default "ncu" (PATH-resolved - the re-pin landed); the releases are CC0-1.0; the Boilerplate + the live ~/.dsh are the internal baselines (their personal paths stay - the pending gitignore/submodule decision); Documentation/Plans/ + Reports/ are the process records (agents leave them, the orchestrator updates them).

## The session-resume protocol (user-mandated 2026-10-09 - the next session's starting ritual)

1. READ THE HANDOFF FIRST: Documentation/Handoff/BATCH-HANDOFF-*.md (the LATEST
   dated file is the current brief: the project state, the idle lanes, the
   feedback ledger - addressed + pending, the decisions, the future work) + the
   per-task files in Documentation/Handoff/Tasks/*.md (each carries the TEMPORARY
   CURRENT STATE - the inspected progress - the task spec - the enhancements).
   The session picks off from those states - never re-investigate what the files
   already state.
2. THE QUEUE'S ACTIVATION PROTOCOL: one lane at a time (the user's rules: max
   1-2 agents; the ~/.dsh maxActiveSubagents is 1); every activation message
   carries the STATE BLOCK (the running lanes + their current tasks, the pending
   count, the scope + the off-limits surfaces); the surgical-edit + the
   build-verified disciplines bind every lane; the verify-and-close lanes first
   (the files marked "fix landed + committed - verify") - then the idle ones.
3. THE ROUTING NON-NEGOTIABLE (the slip lesson + the user's amendment - binding):
   EVERY subagent launch passes provider=cloudflare-workers-ai +
   model=@cf/zai-org/glm-5.3-flash + reasoningEffort=low - the coder route,
   ALWAYS, no exceptions (the user's amendment 2026-10-09: "the agents you're
   launching must always be coder glm 5.3 low - always" - the DeepSeek-max
   planning clause is RETIRED; the planning lanes also run GLM flash low). The
   OMISSION inherits the parent route - an omission IS the violation (it slipped
   once - the cost was sunk). The routing-enforcer plugin
   (Documentation/Plans/ROUTING-ENFORCER-PLUGIN.md) will automate this silently -
   until then, the explicit routing is the law.
4. THE ENVIRONMENT DISCIPLINE: the user commits MID-SESSION (HEAD moves under
   you + the lanes); the tree may be mid-edit by the concurrent lanes (the
   read-before-edit always); the handoff + the process records are the durable
   fallbacks (the batch-state plugin will automate the live state later).
5. THE HANDOFF MAINTENANCE: at the session's end, the orchestrator REFRESHES the
   handoff (the BATCH-HANDOFF date-stamped new file + the Tasks/ states updated -
   the completed lanes marked, the new feedback appended) so the next session
   resumes from the fresh states. The user's feedback ALWAYS lands in the handoff
   the same session it arrives. [2026-10-10 amendment: the handoff docs are
   TEMPORARY by the user's decree - erased at the session's close; the SKILL.md +
   the Plans/ + the Reports/ stay as the durable records.]

## 6. THE 2026-10-10 LESSONS (the user-instructed erase: "learn from this workflow,
preserve the necessary skills, + erase all temporary handoff documentation and
temporary files")

The handoff docs (Documentation/Handoff/) are TEMPORARY by the user's decree -
erased at the session's close; the SKILL.md + the Plans/ + the Reports/ stay as the
durable records. The lessons the 2026-10-09/10 workflow taught (each one earned):

1. THE SKILL IS NOT IN THE SESSION CATALOG - load it from the repo FIRST. The
   orchestrator slipped the non-execution law (ran lychee, edited a README,
   committed 23a313d, byte-grepped + curled the dev server) partly because the
   skill was not registered in the session's catalog - the session-start ritual
   must read Documentation/Skill/orchestrator-batch/SKILL.md from the tree before
   any delegation. The slip record: TOMORROW-REVIEW.md §9.
2. THE IDLE-LANE SEATING PROTOCOL WORKS: launch with the fully self-contained
   spec + the routing (cloudflare-workers-ai/@cf/zai-org/glm-5.3-flash, low),
   then send_message the seating line ("ACK: SPEC RECEIVED - IDLE"), activate
   with "ACTIVATE" when a slot frees, amend mid-flight with "SPEC AMENDED" when
   the new feedback lands on an active lane's surface (the spec-reconfiguration
   authority). The 2026-10-09 evening queue ran 2 active + up to 4 idle cleanly.
3. THE STALE-ARTIFACT CLASS: several user reports (the ONCE-PUBLISHED install
   block, the "lost" red Pause cursor, the duplicated homepage buttons, the
   missing media queries, the broken quote glyphs) were STALE browser/dev-server
   caches or transient intermediate commits - the lane's evidence-gathering
   (fetch the live page, byte-compare the deployed CSS, count the occurrences in
   the BUILT output) resolved them without a fix. The orchestrator relays the
   verdict + the user's remedy (hard refresh / SW unregister) verbatim.
4. THE "NO FIX NEEDED" VERDICT IS A RESULT: the media-query question was
   BY-DESIGN (fluid clamp typography, the legacy->range minifier translation,
   the space-stripped `@media (width>=768px)`), the red pause cursor was never
   removed (b9138c89, git log -S proof), the raw-marker brace was a REAL fix
   (FileIcon.ts:161 regex). The lane reports the evidence either way; the
   orchestrator does not pre-judge.
5. THE SITE'S AUTO-COMMIT HOOK: the Site repo has a governor hook that auto-
   commits lane changes mid-build and can sweep one lane's edits into a sibling
   lane's commit - the lanes split history (soft reset, two clean commits) when
   that happens; the orchestrator checks for the split in the final report.
6. THE UNICODE-GLYPH RULE BITES EVERY WRITE: the normalize hooks are active in
   the profile - the plain write tool's placements get their glyphs replaced;
   the lanes use raw-write (exempt) or the identity-exempt edit tool for real
   unicode. The glyph-loss report class (Mapping/QuotesMap tables) is caused by
   this exact mechanism.
7. THE PUBLISH CLOSE-OUT: the tolerance pattern (continue-on-error + || true)
   absorbs the E403s of already-published packages; the run status may report
   green while individual publishes fail - the registry (curl dist-tags.latest)
   is the arbiter, not the run badge. The 25/25 publish completed 2026-10-09.