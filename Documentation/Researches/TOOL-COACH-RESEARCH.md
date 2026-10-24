---
title: Tool-Usage Coach Research
category: Researches
kind: research-output
date: 2026-10-19
status: complete
registry: Documentation/Researches/TOOL-COACH-RESEARCH.md
index: Documentation/INDEX.md
statuses:
    - name: the research (the tool map + the tier model)
      state: resolved
      evidence: this document; the claims anchored to file and line
    - name: the tool-coach plugin
      state: implemented
      evidence: Archive/Tool-Coach/TOOL-COACH-PLAN.md; live-proven - the tier-1 notes fired
    - name: the bundle name decision (tool-coach vs guardian)
      state: resolved
      evidence: hook-dsh-tool-coach shipped
    - name: the parent's open questions (threshold/window, enforce default)
      state: resolved
      evidence: shipped with the safe defaults, enforce off
---

# TOOL-COACH-RESEARCH.md - Research for the Tool-Usage Coach plugin

Status: research (explorer+plan). Companion plan: `TOOL-COACH-PLAN.md` (same directory). Date:
2026-10-19. All paths absolute; every claim anchored to file:line.

## 0. Mission recap

The agent LLM "is still regressing to use bash and sed for simple read write calls which can be tool
calls". After a configurable number of offending calls the plugin must NOTE to the model how to use
the full harness toolset (read, write, edit, glob, grep, normalize-file, skill, ccr_retrieve, ...).
Goal: "never defer to the bash, sed, awk tool case". The reason is that terminal content mutations
bypass the family's fs/observed governance chain. Full granularity + configurability in the family's
visible-config style.

## 1. The precedent: `@deepseek-ai/dsh-repeat-tool-reminder` (extracted at /tmp/rtr-extract/)

Source of truth: `/tmp/rtr-extract/lib__index.js` (2268 lines; the plugin's own code is lines
2108-2267, the rest is bundled deps), `/tmp/rtr-extract/README.md`, `/tmp/rtr-extract/package.json`.

### 1.1 What it does

- **Event**: one `tools/post-execute` waterfall listener (`lib__index.js:2247`), plus one
  `agent/pre-step` listener. The pre-step listener clears the agent's chain on a new user message
  (`lib__index.js:2261-2264`).
- **Detection**: exact-match canonicalization of the FULL call identity -
  `(tool name, deep-key-sorted JSON.stringify(arguments))` - keyed per agent in a
  `WeakMap<Agent, Chain>` (`lib__index.js:2209`, `observe()` at 2223-2246,
  `canonicalize()`/`sortJsonValue()` at 2151-2164). Consecutive identical calls count. A different
  tracked call resets to 1. Untracked calls are _transparent_ (neither count nor reset). Denied
  calls count too, because post-execute also fires for pre-execute denials (`README.md:83`).
- **Injection**: an `additionalContexts` `UserMessage` prepended to the downstream
  `PostToolDecision` (`lib__index.js:2251-2259`, `prependContext` at 2194). The message carries the
  load-bearing source label
  `{kind: 'repeat-tool-reminder', form: 'notice', summary: '<tool> x <count>'}`
  (`lib__index.js:2132`, `README.md:89`). An unlabeled context would render as a user prompt in
  derived history.
- **Escalation**: gentle reminder at `thresholds[0]`, detailed template at later thresholds, listing
  tool / consecutive_calls / capped argument preview (`lib__index.js:2137-2142`, `previewArguments`
  at 2175).
- **Config** (`lib__index.js:2117-2126`): `thresholds [3,5,8]`, `include []`, `exclude []` (wildcard
  patterns compiled by `wildcardToRegExp`, 2165-2169), `argumentsPreviewChars 500`. Fail-loud
  validation in `apply` (`validateThresholds` 2184-2189, preview check 2208). Invalid config throws
  at load, NEVER silently defaults.
- **Limits** (`README.md:160-172`): exact-match only (near-identical variants evade); compaction
  does not reset chains; advisory only (blocking "not implemented" though `PostToolDecision`
  supports it); NO subagent chain-sharing; legitimate idempotent polling still draws nudges;
  **silent past the highest threshold**; in-memory only (a resumed session starts fresh).

### 1.2 Verdict relative to the coach requirements

**Borrow** (proven mechanics, keep identical shapes):

1. Counting in `tools/post-execute` - ONE listener sees EVERY attempt including denied calls; NO
   cross-event state (`README.md:74,83`).
2. `additionalContexts` + `prependContext` + the REQUIRED source label - the targeted per-call note
   lands exactly where the offending call happened and is reconstructable from the session log
   (`README.md:89-90`).
3. Per-agent `WeakMap` keying + `agent/pre-step` user-message reset (`lib__index.js:2209,2261`).
4. Wildcard include/exclude compilation and fail-loud validation.
5. ALWAYS `next()` first, then enrich - NEVER short-circuit downstream listeners
   (`lib__index.js:2248-2259`).

**Avoid / it does NOT cover the coach's case**:

1. **The regression class is NOT a repeat class.** A single `sed -i` on a file is already an
   offense; RTR only fires on the 3rd _identical_ call. The coach needs **content-based pattern
   detection** on the bash command string, NOT identity canonicalization.
2. **NO tool-mapping content.** RTR says "change approach"; the coach must say "use `edit` / `read`
   / `grep` instead, because terminal writes bypass fs/observed".
3. **NO persistence, NO enforcement tier, NO persistent system-prompt section.** RTR explicitly
   defers blocking; the coach's `enforce` tier is new surface.
4. RTR goes silent past the highest threshold; the coach needs a cooldown-based re-note instead.

## 2. Event surface findings (detect / note / enforce)

Anchors: `/Users/nikola/Developer/Documentation/Module/deepseek-harness/docs/` (references below:
`pipeline.md` = `tool-execution-pipeline.md`, `tools.md` = `subsystems/tools.md`, `cookbook.md` =
`cookbook/extension-cookbook.md`, `epc.md` = `event-producer-consumer.md`).

### 2.1 DETECT

- `tools/post-execute` waterfall: listener receives `(exec: ToolExecution, result, next)`; exec
  carries "name, parsed arguments, caller agent" (`tools.md:669,653`). This is the primary DETECT
  point: same coverage as RTR (denied calls included, `README.md:83`), and it is where the note is
  attached.
- `tools/pre-execute` waterfall: receives `(exec: ToolExecution, next)` with the pending call
  ("name, parsed arguments, caller agent") (`tools.md:693,678`). It is needed ONLY for the ENFORCE
  tier.
- `tool/call` session event fires _before_ execution (`pipeline.md:11`). It is observe-only, NO
  decision; it is NOT used.
- Producer/consumer lists confirm availability and ordering participants: `tools/pre-execute`
  consumers include hooks-claude-code, hooks-codex, tool-jobs, workspace-changes, auto-review
  (`epc.md:80`); `tools/post-execute` consumers include claude-code-mods, hooks-*,
  repeat-tool-reminder, spill-policy, tool-fs-search (`epc.md:79`).

### 2.2 NOTE

- **Post-execute `additionalContexts`** - `PostToolDecision` supports
  `additionalContexts?: UserMessage[]` on `accept` and `block` (`tools.md:423-425`; field docs at
  `tools.md:358,372`). The loop buffers it and injects it as a synthetic user message after the
  step's tool results (`pipeline.md:26`, RTR `README.md:90`). **Caveat**: PTC `run_code` sub-calls
  _omit additionalContexts_ to preserve call/result adjacency (`pipeline.md:63`). In PTC mode the
  targeted note is limited; the persistent section still reaches the model.
- **`system-prompt/assemble`** - "an expert cooperative whole-assembly transform: its returned
  assembly is authoritative, so listener authors own preserving active PTC mode and
  structured-output protocol contributions" (`cookbook.md:102`). The waterfall is declared at
  `packages/core/system-prompt/src/index.ts:31`. Current consumers: agent, browser-use-runtime,
  session-reference, working-directory (`epc.md:75`). This is the persistent-guidance injection
  point: the coach appends its section to the assembly it receives from `next()` and returns the
  extended assembly, touching NOTHING else. Alternative `ctx.systemPrompt.section()`
  (`cookbook.md:112`) is a section _provider_ (ordering + scope-local shadowing). It is suitable for
  the coach's static "tool discipline" section gated on a LIVE flag. The assemble-waterfall form is
  the fallback if a dynamic provider cannot express per-request state. Decision: use
  `system-prompt/assemble` listener (full control, one pattern, testable with a fake assembly).

### 2.3 ENFORCE

- `tools/pre-execute` deny: `{ kind: 'deny'; reason: string; info?: ToolErrorInfo }`
  (`tools.md:410-413`). The deny "materializes its model-facing reason" as the tool result - the
  model reads the reason text directly (`tools.md:408-409`). The permission-gate cookbook example is
  exactly this shape (`cookbook.md:15-31`).
- A deny is the coach's strongest tier: the bash call NEVER runs, the reason instructs which tool to
  use, and - because denied calls still flow through post-execute (`README.md:83`) - the coach's own
  counters keep working.
- Guards vs waterfall: `tools/pre-execute` is the _reorderable policy layer_; `ctx.tools.guard()` is
  for monotonic final denials (`cookbook.md:33`). The coach is policy, NOT invariant -> plain
  pre-execute listener.
- Selection rule (`cookbook.md:33` + adding-a-tool guide): pre/post waterfalls for decisions,
  `tools/result` for contained observation ONLY.

## 3. Traceability argument (the note text cites this)

- `Documentation/Skill/task-routing/SKILL.md:165-170`: "hard rules: never edit files through the
  terminal (`sed`/`awk`/python in-place) and never read file content through the terminal
  (`cat`/`grep`/`sed -n`); always use the read/write/edit tool API ... THE MECHANISM: terminal edits
  are invisible to the plugin system - `fs/observed` fires only on tool-layer writes, so tool edits
  are what make the governor/pinner/cargo plugins actually run."
- `Documentation/Skill/code-authoring/SKILL.md:39-46`: "terminal file edits are invisible to the
  plugin system. The harness's `fs/observed` chain - the trigger of the governor, pinner, and
  Cargo-flavor plugins - fires ONLY on tool-layer writes ... Using the write/edit tools IS the
  plugin usage."
- **The family already foresees this plugin**: `code-authoring/SKILL.md:49-60` ("FUTURE -
  PROGRAMMATIC ENFORCEMENT (the guardian plugin; note only, implementation deferred - user-mandated
  2026-10-04)"). It describes a `tools/pre-execute` interceptor detecting terminal file-edit
  commands (sed -i, awk, perl -pi, python in-place, heredoc surgery). Mode A = deny with structured
  reason so the constraint becomes self-teaching. Mode B (later) = silent rewrite. The coach
  implements Mode A behind a config flag, plus the note ladder the mandate implies.
- Corroborating incident: `code-authoring/SKILL.md:52-54` (2026-10-03 python in-place patch
  injecting `await` into a sync function).

## 4. Regression-pattern table (bash class -> dedicated tool)

The coach ONLY judges TERMINAL calls (`bash`, `pwsh`; `judgeTools` config). It NEVER judges the
dedicated tools. LIVE tool names verified in `docs/tool-catalog.md:25-50`: `read`, `read_image`,
`write`, `edit` (tool-fs, :32); `glob`, `grep` (tool-fs-search, :33); `str_replace_editor` (:31);
`web_fetch`/`web_search` (:50); `skill` (:39); `run_code` PTC (:23); `bash` (:25). normalize-file is
a family hook, NOT a registry tool (its effect rides the write/edit path).

| Class          | Bash patterns (defaults, regex)                                                                                                                                                                                              | Correct tool                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| content-write  | `sed -i`, `perl -pi/-pe.*-i`, `awk ... > file` / `awk '...{print ...}' f`, `echo >`, `echo >>`, `printf ... >`, `tee [-a]`, heredoc `cat <<'EOF' >` / `cat <<EOF >>`, `python[0-9]* -c` with `open(...,'w')`/`open(...,'a')` | `write` / `edit` (then normalize-file + governor run) |
| content-read   | `cat`, `head`, `tail`, `less`, `more`, `sed -n`, `nl`, `wc -l <file>`, `od`/`xxd` on a file                                                                                                                                  | `read`                                                |
| content-search | `grep`, `egrep`, `rg` (on workspace files), `find` (name/content), `ls -R`                                                                                                                                                   | `grep` / `glob`                                       |
| dir-discovery  | `ls <path>`, `find <path> -maxdepth` listing, `tree`                                                                                                                                                                         | `glob`                                                |

**Legitimate bash boundary** (the coach must NEVER count these - `exemptPatterns` defaults, verified
against the family's own discipline):

- Builds/tests/package managers: `pnpm`, `npm`, `node`, `tsc`, `esbuild`, `pytest`, `cargo`, `make`,
  `ctest`.
- VCS: `git` (status/diff/log/commit are NOT content reads the read tool serves).
- Process/network/data CLIs: `curl`, `ssh`, `sqlite3`, `docker`, `kill`, `ps`.
- File _lifecycle_ ops with NO dedicated tool: `rm` (explicitly permitted -
  `code-authoring/SKILL.md:33` "deletions via `rm` are permitted"), `mkdir`, `cp`, `mv`, `chmod`,
  `touch`.
- Command _inspection_ of command output (NOT files): `... | grep x` on a pipeline whose head is a
  legitimate command. This is handled by checking whether a read/write class command targets a file
  path. Pipes headed by exempt commands are exempt.

Rule of thumb encoded in `Patterns.ts`: **the terminal runs COMMANDS; the tools handle CONTENT.**
Any bash segment that reads file content into the conversation or mutates file content on disk is a
regression. Everything else is legitimate.

## 5. Escalation ladder - options and recommendation

Options considered:

- **A. additionalContexts-only** (pure RTR-style): targeted, ZERO persistent cost, but fades from
  attention and is invisible in PTC mode.
- **B. system-prompt section only**: persistent, but blunt (fires EVERY request once on) and NOT
  tied to the moment of offense.
- **C. pre-execute deny only**: strongest, but punishing reads as well as writes breaks legitimate
  terminal use and can wedge the model against a task.
- **D. ladder A->B->(C optional)**: progressive, observable, reversible.

**Recommendation: D.**

- **Tier 0 (always)**: ledger line on EVERY detected offense (observe).
- **Tier 1 (strike >= `threshold`, default 3, within `window` default 8 sliding tool calls, cooldown
  `cooldown` default 10 calls since last note)**: targeted `additionalContexts` note on THIS call's
  post-execute decision. It is short and names the class, the matched pattern, the correct tool, and
  one line of the traceability mechanism.
- **Tier 2 (strikes >= `escalateThreshold` default 6 since the last note)**: the persistent
  `system-prompt/assemble` section "Tool discipline" turns ON for the agent and stays on until
  `cleanWindow` (default 12) consecutive judged calls produce ZERO offenses. Then it is removed
  automatically (the assemble waterfall re-runs per request, so the gate is LIVE per request).
- **Tier 3 (`enforce`, default `off`; values `off | write | all`)**: pre-execute deny of judged
  terminal calls matching _content-write_ patterns (or, with `all`, also content-read) once
  `enforceThreshold` (default 4) strikes since the last note; the deny reason names the tool to use.
  `write`-only is the family-mandate-aligned default-off tier (`code-authoring/SKILL.md:53-55` Mode
  A). Reads are noted, NEVER denied, unless explicitly `all`. Rationale for default off: denial of a
  legitimate-looking command can wedge autonomous work. The user's requirement is "NOTES to the LLM
  how to use the FULL harness toolset" - enforcement is the configurable last resort.

Note templates (full verbatim text in the PLAN doc) are short, specific, and cite the fs/observed
mechanism. They carry the exact reasoning from `task-routing/SKILL.md:165-170`, compressed to 3-5
lines.

## 6. Config schema sketch (profile-config style)

`Compose(false, {...})` from `@playform/plugin-dsh-factory`, `.volatile()` cells for EVERY hot knob
(pattern proven in `Classic/packages/plugin-dsh-normalize-file/Source/Variable/Config.ts:45-58`):

```
enabled        boolean  default true   volatile
logFile        string   default '~/.dsh/playform/hook-dsh-tool-coach.log'  volatile
judgeTools     string[] default ['bash','pwsh']  volatile
threshold      number   default 3      volatile   (strikes within window -> note)
window         number   default 8      volatile   (sliding window of judged calls)
cooldown       number   default 10     volatile   (min judged calls between notes)
escalateThreshold number default 6     volatile   (strikes since last note -> tier 2)
cleanWindow    number   default 12     volatile   (clean judged calls -> tier 2 off)
enforce        union('off','write','all') default 'off'  volatile
enforceThreshold number default 4       volatile   (strikes since last note -> deny)
exemptPatterns string[] (legitimate-bash regex defaults, section 4)  volatile
patternTable   array of { pattern: string, class: union('write','read','search','discovery'), tool: string }
               - defaults are section 4's table; user rows are APPENDED (override by
               re-declaring the same pattern is rejected fail-loud)
notes          object { first: string, persistent: string, denied: string }
               - the three note templates, overridable volatile
```

LIVE toggling rides `loader/volatile-update` (consumer list `epc.md:106`). The granular-normalize
feature is fixing the snapshot bug. The coach assumes volatile cells reach `apply` as stable
references after it lands (factory State builder unwraps defensively,
`plugin-dsh-normalize-file/Source/Variable/Config.ts:32-35`).

## 7. Integration & parity plan (summary; details in PLAN doc)

- Bundles: `Classic/packages/hook-dsh-tool-coach` + `EffectTS/packages/ets-hook-dsh-tool-coach`
  (mirror of the ccr twins, `Classic/packages/hook-dsh-ccr` vs
  `EffectTS/packages/ets-hook-dsh-ccr`).
- Listener set: one `tools/post-execute` (detect+count+note), one `tools/pre-execute` (enforce tier;
  registered ONLY when `enforce !== 'off'`), one `agent/pre-step` (user-message reset), one
  `system-prompt/assemble` (tier 2 section). All are plain `ctx.on` registrations - NOT factory Wire
  (factory Wire is fs/observed-hardwired; the ccr precedent comments this explicitly,
  `hook-dsh-ccr/Source/Function/Apply.ts:41-46`).
- Ordering vs ccr: ccr registers `{ prepend: true }` post-execute
  (`hook-dsh-ccr/Source/Function/Apply.ts:27-28`). The coach registers a plain listener so it runs
  AFTER ccr/normalize and prepends its note to whatever additionalContexts downstream produced (RTR
  pattern). exec is identical for ALL listeners, so detection is order-independent.
- Counters: in-memory per-agent `WeakMap` (RTR precedent; resumed sessions start fresh - accepted,
  documented). The PERSISTENT record is the ledger file (one log per module:
  `~/.dsh/playform/hook-dsh-tool-coach.log`).
- Smokes: fake ctx + real built Target; byte-identical ledger strings; cases in PLAN section 5.
- EffectTS parity: same contract behind Effect v4, ledger strings byte-identical (plugin-system
  skill section 3.5).

## 8. Risks / open questions

1. **False positives in command parsing** - heredocs and compound commands need segment-aware
   matching. Mitigate with the exempt list + `patternTable` overrides + fail-open behavior (a detect
   error must NEVER break the waterfall: catch -> log -> `next()` unchanged, the ccr fail-open
   precedent, `hook-dsh-ccr/Source/Function/Apply.ts:23-26`).
2. **PTC mode swallows additionalContexts** (`pipeline.md:63`) - tier 2 section is the carrier
   there; acceptable, documented.
3. **Ordering assumptions** - if a future listener replaces content wholesale, the coach's note
   still rides `additionalContexts` (independent field), so the risk is low. Verified decision
   shapes keep it separate (`tools.md:423-425`).
4. **Volatile live updates** depend on the parallel granular-normalize fix. If it slips, the coach
   still works with at-load config (document graceful degradation).
5. **Token cost of the persistent section** - kept <= 12 lines; configurable via `notes.persistent`.
6. Open for the parent: (a) approve default `threshold` 3 / `window` 8; (b) approve `enforce`
   default `off` vs `write`; (c) whether `pwsh` judging ships in v1 or is `judgeTools`-gated only
   (it is gated; defaults include it); (d) bundle name `hook-dsh-tool-coach` vs `hook-dsh-guardian`
   (the code-authoring mandate calls it "guardian"; tool-coach matches the broader read+write+search
   scope).
