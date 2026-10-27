---
title: The Tool-Usage Coach implementation plan
category: Archive/Tool-Coach
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Tool-Coach/TOOL-COACH-PLAN.md
index: Documentation/INDEX.md
statuses:
    - name: the tool-coach implementation plan
      state: implemented
      evidence: the plugin shipped in both trees; the 129-check suite
    - name: the tier model (the notes at thresholds, the enforce tiers)
      state: implemented
      evidence: the tier-1 notes fired live on bash tail and grep calls
    - name: the judge demo compatibility
      state: implemented
      evidence: the shipped defaults; the pwsh judge gated
    - name: the persistent notes section (notes.persistent)
      state: implemented
      evidence: the I7 teaching note in the profile
---

# TOOL-COACH-PLAN.md - Implementation plan for the Tool-Usage Coach plugin

Status: implementation plan.

Companion research: `TOOL-COACH-RESEARCH.md` (same directory, where every external claim is anchored), and this plan references it as "RESEARCH §n".

Target: two new family bundles, Classic + EffectTS twins.

## 1. Bundle identity

- Classic: `Classic/packages/hook-dsh-tool-coach/` with plugin `name`: `"tool-coach"`, and ledger default `~/.dsh/playform/hook-dsh-tool-coach.log`.

- EffectTS: `EffectTS/packages/ets-hook-dsh-tool-coach/` with the same contract behind Effect v4, and ledger strings byte-identical (plugin-system skill §3.5).

- New module leaf: the coach owns its strings, config extensions, and behavior, and nothing is absorbed into the factory (plugin-system skill §3.2).

## 2. File-by-file layout (Classic; the ets twin mirrors it)

```
hook-dsh-tool-coach/
  package.json                     # family boilerplate; deps: factory + schemastery
  pnpm-workspace.yaml, tsconfig.json, LICENSE, README.md, CHANGELOG.md,
  CODE_OF_CONDUCT.md, CONTRIBUTING.md, cordis.patch.yml
  Configuration/
    ESBuild.ts (+ hand-kept ESBuild.js twin)
    TypeScript.noemit.json
  Source/
    Library.ts                     # entry: name/apply/Config/inject; returns NOTHING
    Interface/
      Config.ts                    # shape produced by Variable/Config.ts
      Execution.ts                 # CoachExec: {name, command, agent}, Match, StrikeState
    Variable/
      Config.ts                    # the Schemastery schema (RESEARCH §6, verbatim below)
      Patterns.ts                  # DEFAULT_PATTERNS (RESEARCH §4 table) + DEFAULT_EXEMPTS
      Notes.ts                     # the three default note templates (verbatim below)
    Function/
      Detect.ts                    # Detect(exec) -> Match | undefined
      Count.ts                     # Count(state, match) -> {strikes, sinceNote, clean, decide}
      Note.ts                      # Note(decision, tier, match) -> UserMessage + ledger line
      Enforce.ts                   # Enforce(match, state) -> deny reason | undefined
      Apply.ts                     # listener wiring + fail-open envelope
```

`Library.ts` contract, mirroring `hook-dsh-ccr/Source/Library.ts` and the ccr Apply comments (`Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts:41-53`):

- `inject: []`-plus-`['fs']` only if needed, because the coach registers NO fs/observed listener and never touches the factory executor.

  It is a pure hook plugin, and it does NOT use factory Wire/Attach/Schema (the ccr precedent, Apply.ts:41-52).

- `apply` returns NOTHING, because a returned value silently kills event delivery (live-verified pitfall, ccr Apply.ts:53-55).

- Listeners registered: `tools/post-execute` (plain `ctx.on`, which runs after the ccr `{prepend:true}` listener), `agent/pre-step` (user-message reset), `system-prompt/assemble` (tier 2), and `tools/pre-execute` ONLY when `enforce !== 'off'`.

  They are removed and re-added on live toggles via the volatile cell read at each apply-time entry, and the simplest form is to register unconditionally and no-op when `enforce === 'off'`.

- EVERY listener body is wrapped in try/catch: on error `logger.warn` + unchanged `next()` result (fail-open; ccr Apply.ts:23-26).

## 3. Verbatim Config schema (Variable/Config.ts)

```ts
import Schema from "@deepseek-ai/schemastery";
import { Schema as Compose } from "@playform/plugin-dsh-factory";

export default Compose(false, {
	logFile: Schema.string().default("~/.dsh/playform/hook-dsh-tool-coach.log").volatile(),
	enabled: Schema.boolean().default(true).volatile(),
	judgeTools: Schema.array(Schema.string()).default(["bash", "pwsh"]).volatile(),
	threshold: Schema.number().default(3).volatile(),
	window: Schema.number().default(8).volatile(),
	cooldown: Schema.number().default(10).volatile(),
	escalateThreshold: Schema.number().default(6).volatile(),
	cleanWindow: Schema.number().default(12).volatile(),
	enforce: Schema.union(["off", "write", "all"]).default("off").volatile(),
	enforceThreshold: Schema.number().default(4).volatile(),
	exemptPatterns: Schema.array(Schema.string()).default(DEFAULT_EXEMPTS).volatile(),
	patternTable: Schema.array(
		Schema.object({
			pattern: Schema.string().required(),
			class: Schema.union(["write", "read", "search", "discovery"]).required(),
			tool: Schema.string().required(),
		}),
	)
		.default([])
		.volatile(),
	notes: Schema.object({
		first: Schema.string().default(NOTE_FIRST).volatile(),
		persistent: Schema.string().default(NOTE_PERSISTENT).volatile(),
		denied: Schema.string().default(NOTE_DENIED).volatile(),
	}).volatile(),
});
```

Fail-loud validation in `apply` (RTR precedent, lib__index.js:2184-2208), with `threshold ≥ 1`, `window ≥ threshold`, `cooldown ≥ 1`, `escalateThreshold ≥ threshold`, and `enforceThreshold ≥ 1`.

EVERY `patternTable.pattern` compiles as a RegExp and its `tool` is non-empty, duplicates of a DEFAULT_PATTERNS pattern are rejected with a clear error, and invalid config throws at load.

## 4. Verbatim note templates (Variable/Notes.ts) + ledger strings

```ts
export const NOTE_FIRST = (c: { count: number; match: Match }) =>
	`Tool-usage note (${c.match.class}-class bash pattern matched: ${c.match.pattern}):
- terminal calls that read or write file CONTENT bypass the harness's fs/observed chain, so the governor/pinner/normalize plugins never see them;
- use the dedicated tool instead: ${c.match.tool} (and read/edit for files, grep/glob for search/discovery).
The terminal runs COMMANDS (builds, tests, git, package managers); the tools handle CONTENT. Prefer the tool API for every file read or write.`;

export const NOTE_PERSISTENT = `Tool discipline (persistent reminder):
- NEVER read file content through the terminal (cat/head/tail/sed -n/grep <file>) — use the read and grep/glob tools.
- NEVER mutate file content through the terminal (sed -i/awk/echo >/printf >/tee/heredoc >) — use the write and edit tools; terminal edits are invisible to the plugin system (fs/observed fires only on tool-layer writes), so governance, pinning, and normalization do not run.
- The terminal is for COMMANDS (builds, tests, git, package managers). Full toolset: read, write, edit, glob, grep, web_fetch, web_search, skill, ccr_retrieve, normalize-file (via write/edit).`;

export const NOTE_DENIED = (c: { match: Match }) =>
	`Blocked by tool-coach: the command matches the ${c.match.class}-class pattern "${c.match.pattern}". Use the ${c.match.tool} tool for this operation instead, then rerun the command part that is legitimate (if any).`;
```

Ledger lines (module prefix `tool-coach: `, one log per module):

```
tool-coach: offense <tool> <class> <pattern>
tool-coach: strike <n>/<threshold> <tool> <class> -> note <tool>
tool-coach: cooldown suppressed <n> <tool> <class>
tool-coach: escalated persistent section (<strikes> strikes)
tool-coach: persistent section cleared (<clean> clean calls)
tool-coach: denied <tool> <class> <pattern> -> use <tool>
tool-coach: exempt <tool> <pattern-head>
tool-coach: disabled (enabled=false)
```

## 5. Function contracts

- **Detect(exec, cfg) → Match | undefined** (`Function/Detect.ts`).

  It returns undefined unless `judgeTools.includes(exec.name)`.

  It splits `exec.arguments.command` (string; fallback `JSON.stringify(exec.arguments)`) into segments on `&&`, `||`, `;`, and `|` boundaries outside quotes and heredoc bodies.

  For each segment it tries DEFAULT_PATTERNS first, then the patternTable row whose regex matches → `{class, tool, pattern}`.

  If a segment matches an exemptPatterns regex first → `exempt`, counted nowhere, with the ledger `exempt` line at most once per distinct pattern-head per agent.

  It never judges non-terminal tools.

- **Count(state, match, cfg) → decision** (`Function/Count.ts`).

  Per-agent state lives in a `WeakMap<Agent, {window: Match[], strikes, sinceNote, sinceClean, tier2}>` keyed like RTR (lib__index.js:2209).

  It pushes the match onto the sliding window (cap `window`), where `strikes` = the class-weighted count in window (write =1, others =1).

  A user-message reset comes via the pre-step listener (RTR lib__index.js:2261).

  Decision precedence: (1) `strikes >= threshold && sinceNote >= cooldown` → NOTE tier 1, resetting sinceNote; (2) `strikesSinceNote >= escalateThreshold` → tier 2 ON, idempotent while on; (3) `tier2 && sinceClean >= cleanWindow` → tier 2 OFF; (4) `enforce !== 'off' && class matches enforce && sinceNote >= enforceThreshold` → deny (tier 3), resetting sinceNote.

- **Note(exec, result, next, decision)** (`Function/Note.ts`).

  Always `const downstream = await next()` first (RTR lib__index.js:2248).

  When tier 1 fires, build the `UserMessage` via `createUserMessage` with source `{kind: 'tool-coach', form: 'notice', summary: '<tool> <class> × <n>'}` and PREPEND it to `downstream.additionalContexts`, because the label is load-bearing (RESEARCH §1.1).

  On tier 3 deny, return `{kind:'accept', ...downstream}` from post-execute but record the strike for the pre-execute listener.

- **Enforce(match, state) → string | undefined** (`Function/Enforce.ts`).

  The deny reason = `notes.denied(match)`, fired only from the pre-execute listener as `{kind:'deny', reason}`.

  The model reads the reason directly (RESEARCH §2.3), and denied calls still flow through post-execute, so counting continues (RTR README.md:83).

- **Assemble gate** (in Apply.ts): the `system-prompt/assemble` listener returns `next()`'s assembly with ONE appended section (the `notes.persistent` text) while `tier2` is on for that agent, and the unmodified assembly otherwise.

  The coach touches nothing else, which preserves PTC mode and structured-output contributions (RESEARCH §2.2, cookbook.md:102).

- **N=0 / enabled=false passthrough**: `enabled=false` (or an empty effective pattern table) makes every listener return `next()` untouched, and a smoke asserts it.

## 6. Phases with arbiters

1. **Bundle skeleton** - copy the family boilerplate into both trees, swap the identity, set the tsconfig paths.

    Arbiter: `tsc -p tsconfig.json` clean in both.

2. **Patterns + Notes + Config variables** - verbatim above.

    Arbiter: build + compile, and the schema instantiates with defaults.

3. **Detect + Count** (pure functions; no listeners yet).

    Arbiter: unit smokes for pattern classes, exemption precedence, and window/strike math.

4. **Apply wiring + Note + Enforce + assemble gate**.

    Arbiter: the full smoke battery (below) with ZERO existing-suite assertion changes (smoke-writing skill) and byte-identical ledger strings.

5. **EffectTS mirror** - the same phases 1-4 against `ets-plugin-dsh-factory`, with byte-identical ledger strings.

    Arbiter: the ets bundle build + its smokes.

6. **Serialized workspace build** - `--workspace-concurrency=1` (plugin-system skill §2.4), with the factory rebuilt before consumers type-check against its Target.

## 7. Smoke plan (fake ctx + real built Target)

- **R1 passthrough**: 10 legitimate calls (`git status`, `pnpm build`, `node x`) → zero strikes, zero notes, and no ledger lines.

- **R2 detect+strike**: bash `cat a.md` ×2 and `sed -i s/x/y/ b.md` ×1 → the ledger shows 3 `offense` lines and 0 notes, because the count is below threshold; the 4th offense (window 8) → the `strike 4/3 ... -> note read` line + a decision carrying ONE additionalContexts with source `kind: 'tool-coach'`.

- **R3 cooldown**: continuing offenses within cooldown → `cooldown suppressed` lines, with no second note until cooldown elapses.

- **R4 tier 2**: strikes reach escalateThreshold → the `escalated persistent section` line; a fake assemble → the assembly contains exactly one appended section with the PTC/structured-output props untouched (deep-equal on all other fields); cleanWindow clean calls → `persistent section cleared`.

- **R5 enforce**: config `enforce:'write'` → pre-execute on `sed -i` returns `{kind:'deny', reason: NOTE_DENIED text}` byte-identical; read-class `cat` is NOT denied; `enforce:'all'` denies `cat` too; `enforce:'off'` never denies.

- **R6 exempt + enabled=false + N=0**: `rm`, `git commit`, and an empty patternTable → no counts; `enabled:false` → full passthrough.

- **Ledger**: every case asserts byte-identical ledger strings, and identity-driven strings change BY DESIGN only if the module name changes.

- **Vacuously-green guard**: each smoke asserts the wiring by checking that the listener actually fired (a marker call on the fake ctx), per smoke-writing §3.

## 8. Acceptance criteria

1. Both bundles build clean serialized, and all smokes pass with zero changes to existing suites.

2. Live: the profile bundle list gains the coach; a session that issues `sed -i` receives the tier-1 note after `threshold` offenses; the ledger at `~/.dsh/playform/hook-dsh-tool-coach.log` fills with the §4 strings; volatile toggles flip enforce/tier2 without a remount (after the granular volatile fix lands).

3. The dedicated tools are never judged, and legitimate bash is never counted (smokes R1/R6).

4. No listener ever throws into a waterfall, which a smoke verifies by injecting a malformed command payload (fail-open).
