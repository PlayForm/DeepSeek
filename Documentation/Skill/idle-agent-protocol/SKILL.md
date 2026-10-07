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
- The UNIVERSAL rules (from the batch): NEVER run git add/commit (the user commits); the smokes + the site build are the arbiters (run them, report the printed results - never assert green without running); tabs (tabWidth 4, printWidth 100), YAML stays spaces; the typography laws (Inter + IBM Plex Mono, the 13px floor, no JetBrains Mono); the Harness Blue tokens + zero elevation; quoted ledger strings stay byte-exact (the ledger lines, the JournalExcerpt - never templatized, never reworded); the corrected facts stay truthful (the totals 733 Classic / 746 EffectTS, the 19-method ledger, the versions 0.0.1 / effect 4.0.2).
- FLAG, never silently fix: content conflicts, stale claims, or anything that contradicts the shared facts - report them to the parent instead of guessing.
- The final report format: per-item before -> after with file:line anchors, the decisions you made, the arbiter results (the printed totals/counts), the residuals + the decisions for the user. Be direct; no fluff.