---
name: idle-agent-protocol
description: THE protocol for agents launched as IDLE (paused) agents in the DeepSeek Harness Plugin Family batch - the retain-and-wait contract: launch with a fully self-contained spec, do NO work until activated, confirm with the exact idle line, then execute the retained spec exactly with the arbiter. Load before you are launched with a "STATUS: PAUSED" instruction.
whenToUse: Mandatory whenever you are launched with a "STATUS: PAUSED - you are being launched to RETAIN the following spec" instruction. Until the parent's activation message arrives: no file operations, no reads, no work - only the confirmation line.
---
# Idle-Agent Protocol - Operating Manual

## The contract (while IDLE)
- RETAIN the full spec in your context - verbatim. It is your only authority; the parent's later activation message may amend it (amendments override the base spec where they conflict).
- DO NO WORK: no file operations, no reads, no builds, no git commands.
- REPLY with exactly one line: "<NAME> SPEC RETAINED - IDLE" (and for amendments: "<NAME> SPEC AMENDED - IDLE" as your acknowledgment when the parent sends one).

## The execution (when ACTIVATED)
- Execute the retained spec EXACTLY: your scope, the exclusions, the sequence, the report format.
- If the spec says "if X exists when you activate, verify and adjust" - verify first, adjust minimally.
- THE UNIVERSAL rules (from the batch): NEVER run git add/commit (the user commits); the smokes + the site build are the arbiters (run them, report the printed results - never assert green without running); tabs (tabWidth 4, printWidth 100), YAML stays spaces; the typography laws (Inter + IBM Plex Mono, the 13px floor, no JetBrains Mono); the Harness Blue tokens + zero elevation; quoted ledger strings stay byte-exact (the ledger lines, the JournalExcerpt - never templatized, never reworded); the corrected facts stay truthful (the totals 733 Classic / 746 EffectTS, the 19-method ledger, the versions 0.0.1 / effect 4.0.2).
- FLAG, never silently fix: content conflicts, stale claims, or anything that contradicts the shared facts - report them to the parent instead of guessing.
- THE FINAL REPORT format: per-item before -> after with file:line anchors, the decisions you made, the arbiter results (the printed totals/counts), the residuals + the decisions for the user. Be direct; no fluff.

## The environment + the scope discipline (user-mandated 2026-10-08)
- YOU ARE NEVER ALONE: the batch has MANY agents working at once (the parent activates lanes in pairs - at any moment 1-3 other agents are editing the same repository, and a dozen more are queued). The parent's activation message carries the CURRENT STATE block (the running lanes + their tasks, the pending count, your scope reminder) - READ IT and treat it as part of your spec.
- THE RUNTIME FACTS come from the parent's state block + your own verification: check the tree state (the git status, the recent commits - the user commits MID-SESSION, so HEAD may move under you; the other lanes' in-flight files show as modifications) BEFORE + DURING your work. NEVER assume the tree is clean or that you are the only writer.
- STAY IN YOUR SCOPE: the surfaces the other lanes own are OFF-LIMITS. The state block lists them. If your task touches a file another lane is editing - read-before-edit ALWAYS, coordinate via the report, never fight over the same file region.
- THE SURGICAL-EDIT discipline (user-mandated 2026-10-08): every file modification goes through the harness TOOL API ONLY - the read tool first, then the edit tool (the literal match, the surgical per-region fix). NEVER use python/sed/awk/scripts to mutate file content (bash/python run COMMANDS: the builds, the tests, the scans - never edits). A bulk transformation is FORBIDDEN - per-file surgical edits with the build verified after each file. This is the code-authoring discipline - the write/edit tools are the governed path (the fs/observed chain fires on them).
- THE BUILD-VERIFIED rule: after EVERY file you touch, the relevant arbiter must pass before you continue (the site build for the site files, the smokes for the packages). Never leave the tree in a broken state at any moment - if your edit breaks the build, fix it immediately before moving on.
- THE COMMON SKILLS: the global ~/.dsh/skills/ (worker-strains, task-routing, code-authoring, harness-observability) + the project's Documentation/Skill/ (orchestrator-batch, instructional-writing, plugin-system, smoke-writing) bind every agent - load the relevant one before your task when in doubt about the environment.