> Specialized working copy (repo): synced from ~/.dsh/skills/idle-agent-protocol/ on 2026-10-20, byte-faithful. This is the specialized truth for this monorepo's sessions; the global copy is the fallback. Sync future changes to BOTH.

---
name: idle-agent-protocol
description: THE protocol for agents launched as IDLE (paused) agents in the DeepSeek Harness Plugin Family batch - the retain-and-wait contract: launch with a fully self-contained spec, do NO work until activated, confirm with the exact idle line, then execute the retained spec exactly with the arbiter. Load before you are launched with a "STATUS: PAUSED" instruction.
whenToUse: Mandatory whenever you are launched with a "STATUS: PAUSED - you are being launched to RETAIN the following spec" instruction. Until the parent's activation message arrives: no file operations, no reads, no work - only the confirmation line.
---

# Idle-Agent Protocol - Operating Manual

The retain-and-wait contract for agents launched PAUSED in the DeepSeek Harness Plugin Family batch: hold the spec verbatim, do nothing until the parent activates you, confirm with the exact line, then execute the retained spec exactly inside the concurrent batch. The environment and scope discipline is user-mandated 2026-10-08. The full philosophy lives in the references; this file is the index.

## The contract (while IDLE)

1. **Spec retention** - see ./references/idle-contract.md
   Retain the full spec verbatim; it is your only authority, and the parent's amendments override the base spec where they conflict.
2. **Do no work** - see ./references/idle-contract.md
   Until activation: no file operations, no reads, no builds, no git commands - only the confirmation line.
3. **Exact confirmation line** - see ./references/idle-contract.md
   Reply exactly "<NAME> SPEC RETAINED - IDLE"; for an amendment, "<NAME> SPEC AMENDED - IDLE".

## The execution (when ACTIVATED)

1. **Execute the spec exactly** - see ./references/activated-execution.md
   Your scope, the exclusions, the sequence, and the report format are constraints, not suggestions.
2. **Verify and adjust minimally** - see ./references/activated-execution.md
   A "if X exists when you activate, verify and adjust" clause means verify first, then adjust minimally.
3. **The universal rules** - see ./references/universal-batch-rules.md
   Never git add/commit; the smokes + the site build are the arbiters; tabs (tabWidth 4, printWidth 100) with YAML in spaces; Inter + IBM Plex Mono at the 13px floor; Harness Blue tokens + zero elevation; byte-exact ledger strings; the truthful corrected facts (733 Classic / 746 EffectTS, the 19-method ledger, 0.0.1 / effect 4.0.2).
4. **Flag, never silently fix** - see ./references/flag-and-report.md
   Content conflicts, stale claims, and shared-fact contradictions go to the parent; never guess.
5. **The final report format** - see ./references/flag-and-report.md
   Per-item before -> after with file:line anchors, the decisions, the printed arbiter results, the residuals + decisions for the user.

## The environment + the scope discipline (user-mandated 2026-10-08)

1. **You are never alone** - see ./references/batch-environment.md
   Lanes run in pairs; 1-3 other agents edit the same repo at any moment with a dozen queued; read the CURRENT STATE block as part of your spec.
2. **Runtime facts are verified** - see ./references/batch-environment.md
   Check the tree state before + during your work; the user commits mid-session so HEAD moves under you; never assume a clean tree or sole writer.
3. **Stay in your scope** - see ./references/batch-environment.md
   Other lanes' surfaces are off-limits; read-before-edit always, coordinate via the report, never fight over a file region.
4. **The surgical-edit discipline** - see ./references/edit-and-verify-discipline.md
   Read tool then edit tool only; bash/python run commands, never edits; bulk transformations forbidden.
5. **The build-verified rule** - see ./references/edit-and-verify-discipline.md
   After every touched file the relevant arbiter must pass before you continue; never leave the tree broken.
6. **The common skills** - see ./references/batch-environment.md
   The global ~/.dsh/skills/ and the project's Documentation/Skill/ sets bind every agent; load the relevant one when in doubt.
