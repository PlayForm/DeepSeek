> Specialized working copy (repo): synced from ~/.dsh/skills/orchestrator-batch/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: orchestrator-batch
description: THE orchestration methodology for the DeepSeek Harness Plugin Family batch - the incremental, synchronous, wall-clock-ordered workflow: the user's thought arrives -> formalize it -> delegate to an ACTIVE agent (the serialized queue) or an IDLE agent (paused, spec retained) -> monitor the execution -> verify with the arbiters -> report. Includes the queue bookkeeping, the surface-conflict analysis, the stall/error recovery, and the spec-reconfiguration authority. Load before running any multi-agent batch in this project.
whenToUse: Mandatory for the agent-batch regime in this monorepo: whenever the user gives a task that lands as agents (site work, docs, corrections, scans), whenever the user asks to "launch an IDLE agent", and whenever you must decide the order, the concurrency, or the re-dispatch of the batch.
---
# Orchestrator Batch - Operating Manual

The orchestration methodology for the DeepSeek Harness Plugin Family batch:
a six-phase loop run incrementally and synchronously in wall-clock time,
with the two-active queue regime, the lanes' own arbiters, the routing law,
and the session-resume ritual. User-mandated amendments recorded 2026-10-09,
2026-10-10, and 2026-10-19. The full philosophy lives in the references;
this file is the index.

## The Loop (Incremental + Synchronous in Wall-Clock Time)

1. **Receive the thought** - accept the user's input however fragmentary;
   structuring is the orchestrator's job, never the user's.
   see ./references/the-loop.md
2. **Formalize the brief** - structure scope/surface/exclusions/sequence,
   bind the shared facts and the conventions, shape the report format;
   ambiguity resolves to the stated most-faithful reading.
   see ./references/formalize-the-brief.md
3. **Delegate active or idle** - an active lane takes its serialized-queue
   slot; an idle lane holds a retained spec until ACTIVATE; the spec is
   always self-contained (the lane cannot see this conversation).
   see ./references/delegate-active-or-idle.md
4. **Monitor the queue** - bookkeeping (active/paused/queued), the
   surface-conflict analysis (concurrency only when files are provably
   disjoint), the activation cascade, stall recovery, and dead-lane
   failure handling.
   see ./references/monitor-the-queue.md
5. **Verify: the arbiters are the lanes' own** - every lane runs its own
   suites/builds and prints the totals (Classic 733 / EffectTS 746); the
   orchestrator does not execute (the 2026-10-09 law) and relays feedback
   verbatim; trust printed totals over prose (795/808 were phantoms).
   see ./references/arbiters-are-the-lanes-own.md
6. **Build discipline** - the lanes' arbiter form (no dev server, no tsc,
   no git; `cd Site && pnpm prepublishOnly` when a build is needed) vs the
   Aphrodite no-build law (the user's build is the arbiter; Drift + greps
   only); the deploy alignment (build from the committed state).
   see ./references/build-discipline.md
7. **Report** - per-agent results, residuals + decisions for the user, the
   queue's next steps; the user decides the commit protocol.
   see ./references/the-loop.md

## The Spec-Reconfiguration Authority (User-Granted)

- **Spec reconfiguration** - amend idle specs (acknowledged "SPEC AMENDED -
  IDLE"), compatible mid-flight corrections as checkpoint messages,
  re-apply changed requirements to not-yet-started prompts, re-dispatch
  failed agents; amendments override base specs; the durable queue is
  recorded in Documentation/Plans/TOMORROW-REVIEW.md.
  see ./references/spec-reconfiguration-authority.md
- **The idle-amendment law** (2026-10-19) - suggestions, improvements, and
  subsequent ideas NEVER amend a working lane mid-flight; every new idea
  lands as a NEW idle lane, and the improvement reports fold into
  subsequent dispatches.
  see ./references/idle-amendment-law.md

## The Shared Facts (The Truth the Whole Batch Must Not Contradict)

- **Shared facts** - the totals Classic 733 / EffectTS 746; the per-suite
  pairs (core 14/17, factory 34/41, governor 78/81, pinner 32, cargo 62,
  dash 132, five flavors 62, file 71); the 19-method factory surface
  (SCHEME: 2.7 Write+GuardedWrite, 2.16 UpdateKey, 2.17 RegisterGovern,
  2.18 Govern); releases at 0.0.1; effect pin 4.0.2; ncuBin "ncu"
  (PATH-resolved); CC0-1.0; the Boilerplate + live ~/.dsh baselines;
  Documentation/Plans/ + Reports/ as the process records.
  see ./references/shared-facts.md

## The Session-Resume Protocol (User-Mandated 2026-10-09)

- **Read the handoff first** - the latest BATCH-HANDOFF-*.md plus the
  Tasks/*.md states; never re-investigate what the files already state.
  see ./references/session-resume-protocol.md
- **Queue activation protocol** - state block in every activation,
  surgical-edit + build-verified disciplines, verify-and-close lanes
  first, then the idle ones.
  see ./references/session-resume-protocol.md
- **The routing non-negotiable** - every launch: cloudflare-workers-ai /
  @cf/zai-org/glm-5.3-flash / low, always; omission inherits the parent
  route and IS the violation; the planning clause retired; DeepSeek-high
  only when the user names it.
  see ./references/routing-law.md
- **Environment discipline** - the user commits mid-session (HEAD moves),
  read-before-edit always, handoff + process records as the fallbacks.
  see ./references/session-resume-protocol.md
- **Handoff maintenance** - refresh the handoff at session end and same
  session for feedback; the 2026-10-10 decree: handoff docs are temporary,
  erased at the session's close; SKILL.md + Plans/ + Reports/ are durable.
  see ./references/session-resume-protocol.md

## The 2026-10-10 Lessons (Each One Earned)

- **Lessons 1-7** - the skill not in the catalog (load from the repo
  first; slip record TOMORROW-REVIEW.md section 9); the idle-lane seating
  protocol (2 active + up to 4 idle ran cleanly); the stale-artifact
  class; the "no fix needed" verdict is a result (b9138c89, FileIcon.ts:161);
  the Site auto-commit hook and the history split; the unicode-glyph rule
  (raw-write or the identity-exempt edit); the publish close-out
  (the registry is the arbiter, not the run badge).
  see ./references/lessons-2026-10-10.md

## The Formalized Orchestration Model (User-Mandated 2026-10-10)

- **Two active, always** - exactly 2 lanes active at any moment; the
  2-at-a-time IS the API throttle.
  see ./references/the-two-active-regime.md
- **The pair queue** - lanes launch idle with retained specs; the next
  pair releases only when the current pair is completely done.
  see ./references/the-two-active-regime.md
- **The ack trap + pause on feedback** - an amendment ACK is not work
  ("CONTINUE + deliver the report" nudge); every feedback delivery
  includes the pause (RE-PAUSE first, execute at ACTIVATE only).
  see ./references/the-two-active-regime.md
- **The re-pause** - "RE-PAUSE - the batch runs 2 at a time only. STOP all
  work NOW"; acknowledged "<NAME> PAUSED - IDLE"; partial state persists
  for the resume.
  see ./references/the-two-active-regime.md
- **Relay + non-execution** - feedback relays verbatim; the orchestrator
  never executes; dispatch + relay + read-only verify only.
  see ./references/arbiters-are-the-lanes-own.md
- **The routing** - GLM 5.3 flash low always (cloudflare-workers-ai);
  DeepSeek-high only when the user names it explicitly.
  see ./references/routing-law.md
- **The tracking** - Site/Documentation/TRACKING.md carries every user
  requirement + feedback item (one line each), the agent roster, the
  queue; the orchestrator updates it.
  see ./references/tracking-and-self-review.md
- **Self-review + skill-update per lane** - each lane reviews its own work
  for gaps, fixes them, and updates the relevant SKILL.md under
  Documentation/Skill only (read-before-edit).
  see ./references/tracking-and-self-review.md
