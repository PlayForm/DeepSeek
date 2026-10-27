# SCHEME.md - @playform/hook-dsh-live-containers (v0.3.0, TypeScript, function plugin)

Status: **IMPLEMENTED and VERIFIED** (deterministic build with zero errors; minified build; the
package-internal per-test suite green - 203 checks across 14 folders, see section 9).

The wave-2 half is section 12, and the wave-3 monitors half is section 13.

## 0. What this plugin is

The live-containers hook: dynamic, modifiable conversation blocks in the system prompt.

Each enabled block is a labeled stanza recomputed at every request (the canonical example is a time
block that always holds the current time at ask-time).

It is appended as ONE `system-prompt/assemble` section named `live-containers` with
`interpolate: false`, so the harness's own prompt variables never resolve (or fail on) the
`{{token}}` groups of the section.

Only the own substitution engine of the plugin touches those groups, so the harness's
unresolved-variable failure is never inherited.

Each block renders inside the FIXED frame, so the model cannot mistake it for harness state:

```
--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
<rendered body>
--- END LIVE CONTAINER <id> ---
```

Source of truth: `Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md` (sections 3-5) and
`Documentation/Archive/Live-Containers/Design/IMPLEMENTATION-DESIGN.md` (phase 1).

## 1. The injection point - the four phase-1 listeners

```ts
ctx.on("system-prompt/assemble", async (Assembly, AssembleContext, Next) => {
	const Downstream = await Next(); // ALWAYS awaited FIRST
	try {
		if (!State.On) return Downstream;
		// ... counters, cache, render ...
		return {
			...Downstream,
			sections: [
				...Downstream.sections,
				{ name: State.SectionName, text: Text, interpolate: false },
			],
		};
	} catch (Error) {
		warn(`hook-dsh-live-containers: ${Error}; the assembly passes through`);
		return Downstream; // fail-open, never throw into the waterfall
	}
});
```

- **L1 `system-prompt/assemble`** (waterfall, `next()` first, append-only): the ONE live section,
  with a global TTL cache when `refresh: "ttl"`, a fail-open try/catch, and a render failure that
  skips the block and logs. The section carries `interpolate: false`.
- **L4 `tools/post-execute`** (waterfall, plain registration): records the tool facts that the
  counter and gauge blocks read (the last-tool timestamp, the per-turn attempt counts) and marks
  event-trigger blocks dirty. It is a pure observer.
- **L8 `agent/pre-step`** (waterfall, plain): the user-message detection counts messages, advances
  the turn, resets the per-turn counters and marks event-trigger blocks dirty (the tool-coach
  precedent).
- **L9 `tools/change`** (emit): clears the section cache of every scope, so the next assembly
  rebuilds from the new registry.

THE WATERFALL DISCIPLINE: `next()` is ALWAYS awaited first, and pass-through returns the downstream
decision unchanged.

FAIL-OPEN: every listener body is one try/catch, so on any error a warn records it and the
downstream result is returned UNCHANGED.

A live block never fails an assembly.

## 2. Config (the full schema, every knob volatile)

The schema is composed via the standalone `Schema(false, {...})` helper of the factory, the
NON-MANIFEST posture (no fs or observed machinery advertised).

EVERY knob is `.volatile()`, so hot edits commit without remounting through the
`loader/volatile-update` event of the loader.

The block TABLE is the volatile cell, and its leaves stay plain, because schemastery rejects
volatile leaves under an enclosing volatile field (the patternTable precedent of the tool-coach).

| Field                | Type                 | Default                                        | Meaning                                                                                         |
| -------------------- | -------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `logFile`            | string               | `~/.dsh/playform/hook-dsh-live-containers.log` | the module's OWN ledger, one log per module                                                     |
| `enabled`            | boolean              | `false`                                        | the MASTER switch - the IDLE-forever posture; the bundle entry ships `enabled: false` only      |
| `sectionName`        | string               | `live-containers`                              | the appended section's name (non-empty, fail-loud)                                              |
| `refresh`            | `'request' \| 'ttl'` | `request`                                      | the section's recompute policy; `ttl` caches the whole body                                     |
| `ttlCalls`           | number               | `8`                                            | assemblies between section rebuilds when `refresh: 'ttl'` (>= 1; the KV-cache-friendly cadence) |
| `separator`          | string               | `---`                                          | the frame dashes (`--- LIVE CONTAINER <id> ...` with the default)                               |
| `sectionBudgetBytes` | number               | `4096`                                         | when the rendered body exceeds this, the OLDEST frames collapse to one-line summaries (>= 1)    |
| `blocks`             | block spec[]         | DEFAULT_BLOCKS (14 entries)                    | the block table; the ARRAY is the volatile cell                                                 |

WAVE-2 KNOBS (appended, and every cell volatile like the phase-1 knobs):

| Field                                              | Type                                             | Default                                                                                                                                              | Meaning                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `detach`                                           | object                                           | see below                                                                                                                                            | the live tool-call transform policy; the OBJECT is the volatile cell                                                                   |
| `detach.mode`                                      | `'off' \| 'long-running' \| 'all' \| 'selected'` | `off`                                                                                                                                                | the transform's master mode; `"all"` FAILS LOUD at load unless `allRequiresConfirm: true`                                              |
| `detach.allRequiresConfirm`                        | boolean                                          | `false`                                                                                                                                              | the DANGEROUS flag for mode `"all"`                                                                                                    |
| `detach.longRunningMarkers`                        | string[]                                         | cargo build, pnpm build, npm install, pnpm install, pip install, cmake, make, go build, tsc -b, next build                                           | the long-running markers                                                                                                               |
| `detach.minHistoricalMs`                           | number                                           | `20000`                                                                                                                                              | the same-prefix history average that detaches without a marker                                                                         |
| `detach.historyWindow`                             | number                                           | `5`                                                                                                                                                  | how many durations the history keeps                                                                                                   |
| `detach.selectedTools` / `detach.selectedPatterns` | string[]                                         | `[]`                                                                                                                                                 | the mode `"selected"` allowlists (command runners only; the mutation family is rejected even here)                                     |
| `detach.maxLivePerAgent`                           | number                                           | `5`                                                                                                                                                  | the admission guard; at capacity the call passes through inline                                                                        |
| `detach.minLatencyMs`                              | number                                           | `2000`                                                                                                                                               | commands likely to finish faster than this stay inline                                                                                 |
| `detach.liveTimeoutMs`                             | number                                           | `120000`                                                                                                                                             | the detached job's own deadline (1000..600000; MUST be <= the inline deadline of 120000 - the composition contract, validated at load) |
| `detach.dedup`                                     | boolean                                          | `true`                                                                                                                                               | the per-agent dedup of still-live identical commands                                                                                   |
| `detach.retryFailsafeCount`                        | number                                           | `3`                                                                                                                                                  | the dedup hit count that triggers the retry-loop failsafe                                                                              |
| `plant`                                            | object                                           | stallMs 45000, closeMs 300000, reportRateMs 2000, stallBudgetMs 180000, stallAction warn-only, orphanBudgetMs 600000, boardsPerAgent 4, leaseTurns 3 | the planted-board knobs; `leaseTurns` is the I5 lease window (parent turns per member)                                                 |
| `failsafes`                                        | `'off' \| 'on'`                                  | `off`                                                                                                                                                | the CAN-4 master switch (a second explicit flip; the CAN-1 transform keeps working when off)                                           |
| `hangBudgetMs`                                     | number                                           | `120000`                                                                                                                                             | zero-output window before the hang failsafe                                                                                            |
| `hangAction`                                       | `'warn-only' \| 'kill'`                          | `warn-only`                                                                                                                                          | whether the hang kills through the registry (`live-hang`)                                                                              |
| `failsafesPerTurn`                                 | number                                           | `5`                                                                                                                                                  | the meta-budget of automatic modifications per agent per turn                                                                          |
| `suggester`                                        | `'off' \| 'section' \| 'plant'`                  | `off`                                                                                                                                                | the CAN-5 suggester mode (`plant` = the configured-block flow)                                                                         |
| `suggesterPrivacy`                                 | `'redact' \| 'verbatim'`                         | `redact`                                                                                                                                             | the privacy gate - see section 12's disclosure                                                                                         |
| `suggestGateMinChars`                              | number                                           | `40`                                                                                                                                                 | the gate length (first message of a turn AND >= this)                                                                                  |
| `maxSuggestionsPerHour`                            | number                                           | `6`                                                                                                                                                  | the rate cap                                                                                                                           |
| `maxPromptBytes`                                   | number                                           | `4000`                                                                                                                                               | the verbatim excerpt cap                                                                                                               |
| `suggestTimeoutMs`                                 | number                                           | `8000`                                                                                                                                               | the suggestion job's timeout                                                                                                           |
| `autoPlant`                                        | boolean                                          | `false`                                                                                                                                              | instantiate suggestions as dormant blocks                                                                                              |
| `suggesterRoute`                                   | object                                           | cloudflare-workers-ai / @cf/zai-org/glm-5.3-flash / low                                                                                              | the exploration strain, surfaced as config                                                                                             |
| `completionCapBytes`                               | number                                           | `4096`                                                                                                                                               | the merged pending-completion text cap                                                                                                 |

Every block spec carries `id` (string, required, unique - fail-loud), `kind` (one of the KINDS
registry, required, and an unknown kind fails LOUD at load), `template` (string, required,
non-empty), `enabled` (boolean, default true), `vars` (dict of strings, per-block token values that
override the built-ins), `trigger` (`'request' | 'event' | 'ttl' | 'manual'`, default `'request'`),
`ttlCalls` (number, default 8, >= 1), and `scope`
(`'always' | 'when-agents-active' | 'when-tasks-live' | 'never'`, default `'always'`).

Fail-loud validation runs BEFORE the State build: an invalid config throws at load and never falls
back to silent defaults.

## 3. The block kinds table

One registry (`KINDS`, 20 entries) serves two consumers: the fail-loud config validation and the
render dispatch.

The PHASE-1 rendered kinds:

| Kind       | Built-in tokens                              | Notes                                                                                                         |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `time`     | `time`, `date`, `tz`                         | local wall clock (HH:MM:SS), local ISO date (YYYY-MM-DD), IANA zone; failure degrades to UTC                  |
| `counter`  | `messageCount`, `turnCount`, `sinceLastTool` | what the plugin itself observes; `sinceLastTool` is elapsed seconds (`42s`) or `none`                         |
| `manifest` | `cwd`, `sessionId`                           | `sessionId` is the plugin's own stable per-scope label (`scope-1`, ...); the opaque scope key is never parsed |
| `gauge`    | `messageCount`, `turnCount`, `sinceLastTool` | same tokens as counter, gauge intent                                                                          |
| `note`     | none                                         | static text; `vars` fill it                                                                                   |
| `template` | the whole variable table                     | all eight built-ins; per-block `vars` override                                                                |

The full built-in token set: `{{time}}`, `{{date}}`, `{{tz}}`, `{{messageCount}}`, `{{turnCount}}`,
`{{sinceLastTool}}`, `{{sessionId}}`, `{{cwd}}`.

The WAVE-2 catalog kinds (14 shipped in the default block table: `todo-list`,
`agent-progress-board`, `task-failsafe-guard`, `command-runner`, `countdown-expiry`,
`session-stats`, `diff-summary`, `constraint-reminder`, `scoreboard`, `live-manifest`,
`memory-block`, `validator`, `environment-drift`, `delegation-inbox`) are ACCEPTED IN CONFIG from
day one.

They render as skipped blocks, with the reason `unknown kind`, until the wave-2 render engine lands.

The three enabled-by-default wave-2 entries (`todo-list`, `command-runner`, `session-stats`)
therefore cost nothing and render nothing in phase 1.

Tokens that the phase-1 engine does not resolve (`{{set:NAME}}`) render LITERALLY and log
`render unknown <id> <token>`.

This is documented honestly and not papered over.

## 4. The substitution engine

`{{token}}` replace ONLY - no eval, no expressions, no `new Function` (the programmable stage routes
evaluation through the ptc-runtime LATER; see section 8).

There is one strict regex pass and no nesting.

An unknown token renders LITERALLY and logs `render unknown <id> <token>` (once per token per pass),
never a failure.

The per-kind variable view narrows the shared table to the built-in tokens of the kind, and
per-block `vars` override everything.

## 5. The frame, the TTL and the failsafe

- Fixed frame per rendered block (section 0), with the frame dashes from `separator`.
- Per-block triggers: `request` re-renders per assembly (subject to the global refresh policy),
  `event` re-renders when an observer marked the block dirty, `ttl` re-renders every `ttlCalls`
  assemblies, and `manual` never re-renders (skip reason `manual`). A `scope` other than `always`
  skips (reason `scope`), and a disabled block skips (reason `disabled`).
- Global refresh: `request` re-renders per assembly and keeps no global cache. `ttl` caches the
  whole body and rebuilds every `ttlCalls` assemblies (ledger `section rebuilt (ttl <n>)`), plus a
  `tools/change` invalidation (`section rebuilt (tools/change)`).
- Failsafe: when the body exceeds `sectionBudgetBytes`, the OLDEST frames collapse to one-line
  summaries and the last frame never collapses, so nothing is silently dropped (ledger
  `failsafe section-collapse <n>`).
- Skip lines log only when the reason CHANGES, so the ledger stays quiet on steady state (the
  tool-coach discipline).

## 6. The counters

Per-scope state lives in a WeakMap (the tool-coach precedent).

PHASE-1 ATTRIBUTION: the counters are MODULE-GLOBAL, because the assemble context exposes only an
opaque scope key (never parsed, the capability rule of the family), so the plugin counts what it
observes harness-wide.

The WeakMap structure stays keyed per object for wave 2.

`{{sinceLastTool}}` is elapsed seconds since the last `tools/post-execute` observation, or `none`.

Exact token counts are NOT available to plugins (research residual 3), so the gauge variables are
honest approximations.

All time reads go through the Clock module (the fake-clock seam; production falls back to
`Date.now()`).

## 7. The ledger strings (the contract)

One log per module - `logFile` (default `~/.dsh/playform/hook-dsh-live-containers.log`), one of the
two universal volatile cells plus the own default of the plugin.

The strings are the module's OWN (the factory never owns them) and asserted byte-exact by the test
suite.

The durable file lines are the `[ISO] message` forms with the `live-containers: ` logger prefix, and
the Append layer of the factory adds the prefix and the timestamp, never the module:

```
live-containers: disabled (enabled=false)
live-containers: activated (bundle 0.3.0, blocks=<n>, refresh=<policy>)
live-containers: block rendered <id> (<len> bytes)
live-containers: block skipped <id> (<reason>)
live-containers: section rebuilt (ttl <n>)
live-containers: section rebuilt (tools/change)
live-containers: render failed <id> -> skipped
live-containers: render unknown <id> <token>
live-containers: failsafe section-collapse <n>
```

WAVE-2 STRINGS (appended to the same list, each byte-exact):

```
live-containers: transform failed <tool> -> inline
live-containers: capacity full <owner> -> inline
live-containers: start failed <tool> -> inline
live-containers: escalation -> inline <tool>
live-containers: await marker -> inline <tool>
live-containers: await marker ignored (tool not detachable) <tool>
live-containers: dedup <tool> -> <job-id>
live-containers: marker failed <job-id> -> inline
live-containers: detached <tool> -> <job-id>
live-containers: owner gone <job-id>
live-containers: completion rendered <len> bytes
live-containers: completion skipped <job-id> (<reason>)
live-containers: completion truncated <job-id> (<kept> bytes)
live-containers: withdrawn <job-id> (completed)
live-containers: set <key>
live-containers: set unknown <verb> <input>
live-containers: plant opened <id> (expect <n>)
live-containers: member enrolled <id> <agentId>
live-containers: report <id> <agentId> (<n> bytes)
live-containers: member stalled <id> <agentId>
live-containers: member dropped <id> <agentId> (<reason>)
live-containers: board closed <id> (<n>/<expect> in <n>s)
live-containers: overflow <id> <agentId>
live-containers: lease expired <id> <agentId> (after <n> turns)
live-containers: failsafe hang <job-id> (<n>s no output)
live-containers: failsafe admission inline <tool>
live-containers: failsafe retry-loop <cmd>
live-containers: failsafe meta-budget (<turn>)
live-containers: failsafe stall <id> <agentId>
live-containers: failsafe drift (<reason>)
live-containers: suggested <sid> <templateId> (fit <fit>)
live-containers: suggestion skipped (<reason>)
live-containers: suggestion parse failed
live-containers: suggestion dismissed <sid>
live-containers: suggestion accepted <sid> (<templateId>)
live-containers: suggestion clamped <sid> <field>
live-containers: suggestion expired <sid>
live-containers: accept failed <sid> (expired)
live-containers: monitors enabled (<n> watchlist entries)
live-containers: monitor enrolled <path> (by <agent>)
live-containers: monitor retired <path>
live-containers: monitor check unknown <setId>
live-containers: monitor check dispatched <path> <setId> -> <job-id>
live-containers: monitor check failed <path> <setId> (start)
live-containers: monitor check settled <path> <setId> (<job-id>, exit <n>)
live-containers: monitor check lost <path> <setId> (teardown)
live-containers: monitors overflow <n>
live-containers: monitor band truncated <path> (<kept> bytes)
live-containers: monitors render failed -> skipped
live-containers: monitors storage open failed: <reason>
live-containers: monitor recovered <path> (<n> checks)
live-containers: monitor off <glob>
live-containers: monitor stale <path> (<reason>)
```

Durable activation proof: "did it activate" is answerable from the ledger alone, because a cold
mount gives `disabled (enabled=false)` and otherwise the activated line carries the bundle version,
the block count and the refresh policy.

## 8. The programmable stage - FUTURE, NOT IN v1

**FUTURE - NOT IN THIS PACKAGE.** The substitution engine is token replace ONLY, and there is NO
evaluation path in v1 (provable by grep in the test suite).

What research section 5 designs for the LATER stage, and this package does NOT ship yet:

- `kind: "program"` blocks with `program` (the source) and `context` (`time | counters | full`),
  executed through the ptc-runtime (`@deepseek-ai/dsh-ptc-runtime-node` - model-written TS in a
  fresh Node process under the sandbox, deadline + output-cap + heap limits). NEVER through
  `new Function` or arbitrary eval in the own process of the plugin.
- Caps: per-call timeout (default 2s), output cap 16 KiB, no filesystem, no network; the LLM writes
  programs through a `live_container_program` tool; programs versioned in the ledger.
- Safety invariants: a program failure never fails the assembly; a program never sees message
  CONTENT unless `context: 'full'` is explicitly enabled per block; output is always framed by the
  LIVE CONTAINER markers.
- The Rust/Rhai path (optional later): `kind: "dylib"` behind the koffi pattern.

Do not configure for it and do not expect it from this package, because these are design notes for a
later wave.

## 9. The test battery (the package-internal per-test folders)

The tests live in `Source/Test/`, one folder per test, each holding one singular TypeScript test
file (`Test.ts`) and a `README.md` (the intent, the scenario tree, the fixtures, the expected ledger
strings and the expected PASS count).

The package's `Configuration/Test-ESBuild.ts` step compiles them into `Target/Test/`, and that step
runs SECOND in `prepublishOnly.sh`, after the plugin build that wipes `Target/` recursively.

The THIRD step type-checks the Test tree against the built Target d.ts chain through its own noemit
config, and the FOURTH step regenerates the shipped declarations synchronously to avoid the
background tsc/tsc-alias race.

The shared harness (`Source/Test/Harness.ts`) owns the fake ctx + the REAL factory + the REAL built
Target, the tmpdir ledger, the FAKE CLOCK (the plugin reads time ONLY through the Clock seam, and
the tests advance the clock instead of sleeping) and the selfcheck backstop
(`node Target/Test/Harness.js --selfcheck`).

The fourteen folders and their PASS counts (203 checks total, per tree):

| Folder                   | PASS | Covers                                                                                                                 |
| ------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| `Wiring-And-Defaults`    | 42   | the four listeners, the defaults, the IDLE-forever posture, fail-loud validation                                       |
| `Render-And-Frames`      | 23   | the substitution engine, the fixed frame, unknown tokens, per-kind views                                               |
| `Volatile-And-Failsafes` | 23   | the volatile flips without remount, the budget collapse, the fail-open paths                                           |
| `Recompute-And-Ttl`      | 17   | the trigger matrix, the TTL caches, the `tools/change` invalidation                                                    |
| `Jobs-And-Detach`        | 27   | the wave-2 J-series: the transform, the re-dispatch spec, the dedup, the await marker                                  |
| `Boards-And-Plants`      | 17   | the wave-2 B-series: the boards, the lease, the reports                                                                |
| `Failsafes-Engine`       | 10   | the wave-2 F-series: the hang, the meta-budget, the off posture                                                        |
| `Suggester-And-Set`      | 21   | the wave-2 S-series: the gate, the privacy, the accept/dismiss verbs                                                   |
| `Monitors-Engine`        | 22   | the wave-3 M-series: the enrollment, the classification, the debounce, the retirement, the overflow, the opt-out       |
| `Monitors-Band`          | 22   | the wave-3 R-series: the byte-exact stanza grammar, the STALE flips, the recovered forms, the summary arithmetic       |
| `Monitors-Jobs`          | 25   | the wave-3 D-series: the G2 dispatch spec, the settle mapping, the false-pass guard, the deadline, the fail-open paths |
| `Monitors-Persist`       | 13   | the wave-3 storage: the domain spec, the records, the pre-bind cap, the absent facility, the recovery                  |
| `Monitors-Tools`         | 11   | the wave-3 tools: live_monitor enroll/off/list/agent, live_monitor_check deep/pending                                  |
| `Monitors-Boards`        | 7    | the wave-3 boards: the monitored rows, the [live-report] monitored fold, the skip guard                                |

Every folder runs standalone (`node Target/Test/<Name>/Test.js`) and under the aggregate
(`node Maintain/Run-Smokes.mjs`, which guards the printed PASS count of each folder against its
README).

## 10. What this plugin does NOT do (phase scoping)

No programmable blocks (section 8 is FUTURE), no wave-2 render engine (the catalog kinds skip as
`unknown kind`), no per-agent counter attribution (the scope key is opaque), and no exact token
counts (plugins cannot see them).

There is no `{{live:...}}` in-body marker in logged messages (no plugin seam exists, so this is the
harness-side follow-up), and no profile activation (the IDLE-forever posture: the plugin ships
disabled and enables only by an explicit ACTIVATE).

## 11. The EffectTS twin

`EffectTS/packages/ets-hook-dsh-live-containers` (`@playform/ets-hook-dsh-live-containers`) is the
same plugin re-expressed on Effect v4 (the Classic twin behind Effect v4).

It keeps an identical config surface, an identical fixed frame, identical block kinds, and identical
ledger strings with the UNCHANGED `live-containers: ` prefix, because the module id stays
`hook-dsh-live-containers` and the tree identity lives in the npm package name, not in the log
lines.

The dependencies differ (`@playform/ets-*` packages + `effect` 4.0.5), and the behavior contract is
byte-identical.

## 12. The wave-2 live half (CAN-1/2/4/5)

The wave-2 extension lives in its own Function modules (Policy, Jobs, Detach, Completion, Board,
Failsafe, Suggester, Set, Plant) plus Variable/Catalog, and Apply only REGISTERS them.

New listeners: `tools/pre-execute` (the decision arm), `tools/execute` (the carrier arm), the jobs
events subscription (the settled truth + the deadline checkpoints), and `session/event` (the report
pickup + the completion delivery observer).

New tools: `live_container_set` (the per-agent state writer + the accept/dismiss/plant/prune verbs)
and `live_plant`.

One registered dynamic context: `live-containers-completion`.

### 12.1 The arming gate

The wave-2 listeners arm only when the jobs stack is composed (`State.Wave.Jobs !== undefined`).

In production `inject` guarantees `ctx.jobs` (the loader throws at mount otherwise), so the gate is
always open in a real deployment.

The bare phase-1 test fixture (no services) mounts the phase-1 listener set unchanged,
byte-for-byte.

### 12.2 The detach transform (CAN-1)

The effective gate order (I2, binding): non-detachable class rule -> `{"__await":true` first-key
await marker -> dedup -> escalation -> policy guards (capacity, meta-budget, min-latency,
interactive, mode logic).

Every branch is pass-through + ledger, never a deny.

The transform listener is FAIL-OPEN (I1 12.2.2): on any internal error the just-started job is
killed with reason `marker-failed` and the call runs inline.

The carrier (G1, verified): the pre-execute arm starts the job and tags the exec object (WeakMap).

The execute arm, seeing the tag, returns the fabricated canonical value
`{ isError: false, value: { kind: "foreground", cwd, exitCode: 0, signal: null, timedOut: false, aborted: false, timeoutMs, stdout: { text: <marker>, truncated: false }, stderr: { text: "", truncated: false } } }`
WITHOUT calling next().

The bash body therefore never runs, and the registry validates the value against the foreground
branch of the bash output schema and renders it through the own `renderResult` of the bash tool:
with exitCode 0 and no markers the model sees EXACTLY the marker bytes as a successful tool result.

COUPLING: this pins the output schema of the bash tool
(`kind`/`cwd`/`exitCode`/`signal`/`timedOut`/`aborted`/`timeoutMs`/`stdout` /`stderr`,
`additionalProperties: false`) and its renderer, and a harness upgrade that changes either is caught
by the J-series smoke.

The producer re-dispatch (G2, command-runner only) follows the exact governed path:
`ctx.workingDirectory.ensure`, `ctx.shellEnv.collect`,
`ctx.get("sandboxPolicy").resolve({ session })`, `ctx.shell.resolve({ onExpiry: "none" })`,
`ctx.jobs.start({ kind: "bash", ... outputLimitBytes: 2048, output: <pull sources>, run: <processJob/processOutcome shapes> })`.

The own bounded tail of the plugin (2 KiB) is captured from the same observed streams, and it is the
only render source of the completion frame, because the settled event carries no ring content and a
host plugin is not the job owner.

### 12.3 The completion carrier (I3/I4)

The completed frame is a REGISTERED DYNAMIC CONTEXT (order 300, optional, and the last repository
context slot is WEB_SURFACE 210), whose provider attributes per agent through the agent field of the
assemble context (`assembleContextFor` sets scope = agent).

Delivery: the loop turns a present, CHANGED context into ONE sourced user-role snapshot appended to
history.

The batch drains on the LOGGED snapshot (the session event whose user message carries
`source: { kind: "runtime-context", form: "snapshot" }` and matching text), never on a provider
read, so an aborted attempt re-delivers.

After delivery the provider returns the delivered text as its stable tail, so the harness's "Current
runtime context: none." cleared snapshot is never triggered by our carrier, and the next settle
opens a fresh batch.

CACHE-COST STATEMENTS (I3 R3).

(a) The completion delivery is append-only: the reusable prefix through the history is preserved,
the marginal cost is the own bytes of the merged text, and the withdrawal is free (absence).

(b) The standing section changes (job start, fleet drain, board declaration) append the FULL new
rendered prompt on in-history-capable routes (cost = whole prompt, old states retained until
consolidation) and are a node-0 full-prefix miss on incapable routes, so detach is cache-cheapest on
in-history-capable routes.

(c) The wrapper line `[live] completion report (harness-appended; not a user request):` precedes the
frames in every snapshot.

### 12.4 Planted boards and the I5 lease

`live_plant` opens the board.

The lease counts PARENT TURNS (one assemble pass = one admission), with `plant.leaseTurns`
(default 3) as the window and `plant.stallMs` as the clock backstop.

The declaration row is byte-exact:

```
[stale]     <agentId> - unreported for <n> parent turns; re-dispatch or mark failed
```

The failsafe engine consumes `lease.declared` (no duplicate timer).

The prune (stallAction "prune", failsafes "on") fires only after the stale row rendered at least one
assembly, and it counts against `failsafesPerTurn`.

The manual twin is `live_container_set prune=<plantId>/<agentId>`.

The board-level orphan declaration is
`--- LIVE PLANT <id> (<type>; expect <n>; status: STALE - no parent requests for <n>s) ---`.

Prune never kills a still-running child job (observation only - the I5 R5 default), and child-turn
windows are FUTURE (I5 R2).

### 12.5 The suggester (I6)

Trigger (conjunctive): first user message of a turn AND length >= `suggestGateMinChars` AND none of
the skip words ("live container", "plant", "suggestion") AND the hourly rate cap AND one per turn.

The detached one-shot activation uses `suggesterRoute` verbatim.

The token grammar is v1-FROZEN to `expectAgents` (1..8, board-shaped) + `steps` (1..8 x 64 bytes,
list-shaped), and the plugin clamps every token (`suggestion clamped <sid> <field>`) and never lets
the mini-model choose the lease.

accept/dismiss: `live_container_set accept=<sid>` / `dismiss=<sid>`.

No action expires the frame after one assembly, and accept on an expired sid answers
`accept failed <sid> (expired)`.

PRIVACY DISCLOSURE: with `suggesterPrivacy: "redact"` (the default for every route), only the first
200 characters of the request of the user plus its total length are forwarded to the configured
suggester route.

With `suggesterPrivacy: "verbatim"`, the request text of the user (capped at `maxPromptBytes`) IS
forwarded to the configured suggester route.

The config flag is the consent surface, and this paragraph is the disclosure.

### 12.6 The smoke battery map

| Series            | Folder                                                                               | Checks            |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------- |
| R/D (phase 1)     | Wiring-And-Defaults / Render-And-Frames / Volatile-And-Failsafes / Recompute-And-Ttl | 42 / 23 / 23 / 17 |
| J (jobs/detach)   | Jobs-And-Detach                                                                      | 27                |
| B (boards)        | Boards-And-Plants                                                                    | 17                |
| F (failsafes)     | Failsafes-Engine                                                                     | 10                |
| S (suggester/set) | Suggester-And-Set                                                                    | 21                |

The J-series pins the fabricated-result shape (the coupling of 12.2) with a byte-exact expected
object, and the REAL validation and render happen in the harness: that is the documented smoke/live
fidelity gap.

### 12.7 The seam evidence (verified first-hand 2026-10-20, app.asar read in place)

- dsh-tools `lib/index.js`: `dispatchScheduledExecution` -> `normalizeDispatchResult` ->
  `createSuccessResult` validates the `value` of the around-dispatch wrapper against the output
  schema of the tool and renders through `tool.output.render`; the exec object identity is shared
  between the pre-execute and execute waterfalls.
- dsh-tool-bash `lib/index.js`:
  `startJob`/`processJob`/`processSources`/`processOutcome`/`resolveWorkdir`/`renderResult`; the
  foreground branch of the output schema; `onExpiry: "none"` for background registrations.
- dsh-jobs-local `lib/index.js`: `start()` (preflight, per-owner admission
  `maxConcurrentJobsPerOwner`, id grammar `<kind>-<16hex>`), the settled event
  `{ type, job: <view>, cause, awaited }`, the view projection (no ring content),
  `kill(id, caller, reason)`, the output event `{ type: "output", id, owner?, total }`.
- dsh-agent-loop `lib/index.js`: the `agent/inbox/spliced` session event
  (`{ target, start, removedCount?, inserted, outcome? }`); the runtime-context projection
  (`RuntimeContextProjection.project` - a snapshot only when the rendered context DIFFERS from the
  retained one; committed as a `user/message` with
  `source: { kind: "runtime-context", form: "snapshot" }`).
- dsh-system-prompt `lib/index.js` + README: `context({ name, order, required, text })` (optional
  contexts are suppressed by `suppressRuntimeContext()` and return when it lifts); external
  contributions may use any finite order (repository contexts end at WEB_SURFACE 210);
  `refreshContext` re-reads registered context text before admission.
- dsh-agent `lib/index.js`: `assembleContextFor(agent, signal)` sets `{ agent, scope: agent }` -
  per-agent attribution in assemble providers.
- dsh-session `lib/index.js`: every append notifies `session/event` observers through the scope
  chain (a host-level listener sees every session's events).
- dsh-subagent `lib/index.js` + README:
  `startActivation({ provider, label, request: { parent, prompt }, signal, delivery: "caller" })` ->
  `{ childId, result, dispose }`.

### 12.8 The EffectTS twin

The ETS twin mirrors the wave-2 half 1:1 under the tree-identity substitutions
(`@playform/ets-base-dsh`, `@playform/ets-ets-plugin-dsh-factory`).

The ledger strings, the marker grammars and the frame bytes are byte-identical, and the test suites
are the same files re-imported against the built Target of the ETS factory.

## 13. The wave-3 monitors half (CAN-7, live file monitors)

The monitor layer lives in its own modules: `Monitors` (the engine: the fs/observed observer, the
checkpoint scan, the dispatch, the settle fold, the stanza part), `Watchlist` (the classification +
the glob matcher), `Band` (the byte-exact renderer), `Storage` (the P5-style monitor-domain open +
recovery) and `MonitorTools` (live_monitor + live_monitor_check), plus the shipped catalog
`Variable/DefaultCheckSets`.

Board gains ONE behavior edit (the monitor settle skip guard) and the monitors plantType branch.

### 13.1 The IDLE-forever posture and the second flip

`monitors: "off"` is the default EVEN when the plugin is enabled.

With monitors off the section body is byte-identical with the wave-2 behavior (no stanza, no
listener work).

The monitor layer is the second explicit flip after the own enable of the plugin, and its on-state
is proven by its own activation line `monitors enabled (<n> watchlist entries)`.

### 13.2 The config surface (appended; every cell volatile)

| Field                          | Type                                                                      | Default          | Meaning                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `monitors`                     | `'off' \| 'on'`                                                           | `off`            | the monitor master switch (the second explicit flip)                                                                                      |
| `watchlist`                    | `{ glob, checks[] }[]`                                                    | `[]`             | the automatic enrollment is watchlist-gated; EMPTY default (no scan, no watch-all); the ARRAY is the volatile cell                        |
| `checksets`                    | dict name -> `{ glob?, command?, link?, fast?, intervalMs?, timeoutMs? }` | DefaultCheckSets | the check-set catalog (tsc, format, cargo, governance); the DICT is the volatile cell                                                     |
| `monitor.debounceMs`           | number                                                                    | `1500`           | the fast-check window (>= 1)                                                                                                              |
| `monitor.maxMonitors`          | number                                                                    | `8`              | the band cap; overflow collapses (>= 1)                                                                                                   |
| `monitor.maxMonitorJobs`       | number                                                                    | `3`              | the concurrent-job admission cap (>= 1)                                                                                                   |
| `monitor.retireMs`             | number                                                                    | `600000`         | the withdrawal window (>= 1)                                                                                                              |
| `monitor.staleMs`              | number                                                                    | `300000`         | the recovered-time-stale window (>= 1)                                                                                                    |
| `monitor.slowCheckIntervalMs`  | number                                                                    | `0`              | the slow schedule (0 = off; the cadence is request-aligned)                                                                               |
| `monitor.bandCapBytes`         | number                                                                    | `2048`           | the per-band render cap (>= 256)                                                                                                          |
| `monitor.checkTimeoutMs`       | number                                                                    | `120000`         | the check deadline; MUST stay <= the inline deadline 120000 (the 12.2 composition contract, validated at load, like detach.liveTimeoutMs) |
| `monitor.linkageAlertVersions` | number                                                                    | `3`              | the SEVERE extension knob - accepted, defaulted, inert in v1                                                                              |
| `monitor.dedupWindowMs`        | number                                                                    | `30000`          | the SEVERE extension knob - accepted, defaulted, inert in v1                                                                              |

Fail-loud validation: every watchlist check name must exist in the effective checksets.

Every check-set spec needs a non-empty `command` when `link` is absent and `link` in {none,
governance} when present.

`checkTimeoutMs` and a per-set `timeoutMs` are validated against the inline deadline range.

### 13.3 The enrollment and the classification

The fs/observed observer runs on the ROOT context (the Wire of the factory, the governor precedent)
and hears every write that the harness emits.

The automatic enrollment is WATCHLIST-GATED: only a matching watchlist entry enrolls a file, and a
file that matches nothing and is not enrolled is NEVER monitored.

The explicit path (`live_monitor <path>`) falls back to the catalog globs when no watchlist entry
matches, so the escape hatch works out of the box.

The most-specific glob wins (longest pattern, and ties go to the later entry).

An entry with an empty effective set renders `checks: none` and nothing ever runs.

The fast sets schedule per-edit pending records (coalesced, so only the newest pending run
survives), and slow sets never auto-run per-edit.

### 13.4 The checkpoints (no real timers)

The debounce dispatch and the deadline scan run at EVERY checkpoint (the fs/observed events, the
jobs events, the assemble passes, the tool surface).

The slow schedule and the retirement scan run at the assemble checkpoint only.

The admission check counts the in-flight dispatch reservations, so a burst cannot exceed
`maxMonitorJobs` (coalesce-not-queue: a pending whose admission is full stays pending and retries at
the next checkpoint).

The sample time of the control loop = the debounce window + the checkpoint cadence + the check run +
the assemble pass of the next request, so the model edits, the checks run between turns, and the
band flips at the next request.

### 13.5 The stanza grammar (byte-exact)

```
--- MONITORS (file checks; not harness state) ---
monitors: <total> (∄<clean> !<problem> ~<stale> ∅<notrun> x<infra>) - <problem> problem, <stale> stale, <notrun> not run, <infra> infra
--- MONITOR <path> ---
<one line per check set, the primary (worst-state) line first>
<the tail block, only when the primary line carries a problem outcome>
--- END MONITOR <path> ---
--- END MONITORS ---
```

The outcome lines (the glyphs rendered as characters; `<time>` = HH:MM:SS; `<version>` = the raw
fs/observed token, verbatim when <= 12 bytes else the first 12 bytes + `..`; the staleness
comparison ALWAYS uses the raw tokens):

```
clean:   clean (∄) | checked <time> v<version> by <writer> | exit 0
problem: problem (!) | checked <time> v<version> by <writer> | exit <n>
infra:   check failed (infrastructure) (x) | checked <time> v<version> by <writer> | <detail>
denied:  check denied (sandbox) (x) | checked <time> v<version> by <writer>
linked:  ∅ (linked governance; no re-run) | observed v<version> by <writer> at <time>
not-run: not run yet (∅?) | enrolled <time> by <writer> [| checks: none]
```

The STALE declaration (the file changed after the check, and the underlying outcome rides after it):

```
~ STALE (file changed after check) | <outcome> | <facts> | now v<current>
```

The recovered forms (provenance "recovered"): fresh keeps the outcome and appends
`| not re-checked this session`, time-stale (past `staleMs`) renders
`~ STALE (not re-checked this session) | <facts>`, and recovered after a mount-time edit renders
both clauses.

The retirement closing line (`--- MONITOR <path> (retired; not touched for <n>s) ---`) renders once
and the band withdraws, the ONE clock-driven text change (a terminal one-time change).

The overflow collapsed form: `--- MONITOR <path> (collapsed, <len> bytes) ---`.

THE HONESTY BOUNDS (hard): a clean glyph renders ONLY from an observed settle with exit 0 of the
exact check set for the exact version with provenance "live", with no synthesis, no inference, and
no carry-over across versions.

A settle-less version bump NEVER renders clean, the linked-governance check never produces a
verdict, and every listener path is fail-open.

A start failure keeps last-known + STALE, and an infrastructure failure renders `x`, never `!`.

### 13.6 The KV-cache honesty

The stanza's text changes ONLY on: enrollment, settle, the fs/observed version bump, the retirement
(the closing line, the documented exception) and the mount recovery.

There are no relative ages anywhere: the check time is HH:MM:SS, the pending/debounce state is never
rendered, and the summary arithmetic is event-driven.

### 13.7 The storage domain

A NEW domain `live_containers_monitors` (version 1, per-record layout, `backup-and-skip`, one
`checks` table) holds the records, and NOT extension records in the shared `package_governance`
domain, because the v2 open contract would force a v3 bump whose blast radius is the whole
governance family.

The plugin opens it itself (its own P5-style effect).

An ABSENT facility is a silent skip (after a restart the bands degrade to `not run yet`, never a
fabricated clean), and a PRESENT facility whose open fails is LOUD (one ledger line, never
rethrown).

Records: one `monitor-enrolled` per enrollment, one `monitor-check` per settle (the checkedVersion,
the exit, the infra, the embedded <= 2 KiB tail), and one `monitor-retired` per retirement.

The recovery runs once on mount: the newest check per (path, agent, set) rebuilds the entry with
provenance "recovered", the enrolled records rebuild the enrollment, and the absent or failing read
degrades to `not run yet`.

### 13.8 The plantType synergy and the escape hatch

`live_plant` gains the `monitors` plantType: the members are the child agents (the lease applies
exactly as the agent-board's), and the rows are the monitored files
(`[monitored] <path> - <outcome> by <writer>`) fed by the monitor settles of the members and the
`[live-report] <plantId> <agentId> monitored <outcome> <path>` fold (the outcome word first, the
path kept whole).

The skip guard of the Board settle hook: a MONITOR settle of a member never flips the TASK row of
the member.

`live_monitor off <glob>` opts out, and the deep check (`live_monitor_check <path>`) runs the full
set once, bypassing the debounce, with the model reading the full ring via `job_output <job-id>`.

Inline checks are UNDIMINISHED, because the monitors only observe writes and never gate or deny an
edit.

### 13.9 The wave-3 smoke battery map

| Series           | Folder           | Checks |
| ---------------- | ---------------- | ------ |
| M (engine)       | Monitors-Engine  | 22     |
| R (band renders) | Monitors-Band    | 22     |
| D (runner)       | Monitors-Jobs    | 25     |
| S (storage)      | Monitors-Persist | 13     |
| T (tools)        | Monitors-Tools   | 11     |
| B (boards)       | Monitors-Boards  | 7      |

### 13.10 The extensions (NOT in this release)

The SEVERE designs (the linkage alerts, the cross-file problem attribution, the CI-parity check set,
the monitor-aware dedup) and the COMPREHENSIVE designs (the programmable monitors, the aggregate
health block, the GUI sidecar, the cross-session memory) are specified in
Documentation/Plans/Live/Design/FILE-MONITORS-DESIGN.md section 14 and ship AFTER v1 of monitors.

Their knobs (`monitor.linkageAlertVersions`, `monitor.dedupWindowMs`) are accepted, defaulted and
inert in v1.

Their ledger strings (`monitor linkage <path> (<n> versions)`, `monitor via <path> <from-path>`,
`monitor dedup <path> (<job-id>)`) are NOT shipped in v1.
