# @playform/hook-dsh-live-containers

The live-containers hook for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
plugin family (the Classic release). A DeepSeek Harness plugin that keeps **dynamic, modifiable
conversation blocks in the system prompt**: each enabled block is a labeled stanza recomputed at
every request - the canonical example is a time block that always holds the current time at ask-time
while the rest of the conversation stays static.

The blocks ride the `system-prompt/assemble` waterfall as ONE appended section named
`live-containers` (`interpolate: false`, so only the plugin's own substitution engine touches its
`{{token}}` groups - the harness's unresolved-variable failure is never inherited), each block
inside a fixed frame so the model cannot mistake it for harness state:

```
--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
<rendered body>
--- END LIVE CONTAINER <id> ---
```

## The block kinds (v1)

| Kind       | Built-in tokens                                          | Recompute                | Example                     |
| ---------- | -------------------------------------------------------- | ------------------------ | --------------------------- |
| `time`     | `{{time}}`, `{{date}}`, `{{tz}}`                         | every request (or TTL)   | `{{time}}` -> `14:03:27`    |
| `counter`  | `{{messageCount}}`, `{{turnCount}}`, `{{sinceLastTool}}` | every request / on event | `messages=17 turns=5`       |
| `manifest` | `{{cwd}}`, `{{sessionId}}`                               | every request / on TTL   | `cwd=/repo session=scope-1` |
| `gauge`    | the counter tokens                                       | every request / on event | `sinceLastTool=42s`         |
| `note`     | none (the template is static text, `vars` fill it)       | every request / on event | a pinned reminder           |
| `template` | the whole variable table (all eight built-ins)           | every request / on TTL   | free-form composition       |

The substitution engine is token replace ONLY - no eval, no expressions (the programmable stage
routes evaluation through the ptc-runtime LATER; see [SCHEME.md](SCHEME.md) for the clearly labeled
FUTURE section). An unknown token renders LITERALLY and logs `render unknown <id> <token>` - never a
failure. Per-block `vars` override the built-ins.

The wave-2 catalog kinds (the default block table ships 14 entries - `todo-list`, `command-runner`,
`session-stats`, ...) are ACCEPTED in config from day one and render as skipped blocks - reason
`unknown kind` - until the wave-2 render engine lands. That is documented honestly here: those
blocks cost nothing and render nothing in this package yet.

## The wave-2 live features (CAN-1/2/4/5)

The wave-2 half of the package extends the same plugin with the live tool-call transform, planted
boards, the task-based failsafes, and the mini-conversation suggester. Every new knob is a volatile
cell.

### CAN-1 - the live tool-call transform

With `detach.mode` = `long-running` | `all` | `selected` (default `off`), a command-runner call
(bash; the mutation family write/edit/raw-write/ normalize-file is PERMANENTLY non-detachable)
matching the policy detaches into a `ctx.jobs` background job and the model immediately receives a
SUCCESSFUL tool result whose text is the byte-exact inline marker:

```
[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.
```

The job runs through the SAME governed path (ctx.shell.resolve/execute with the sandbox, env and
workdir preserved; `onExpiry: "none"`; the plugin's own `liveTimeoutMs` timer is the only deadline
guard). While the job runs, the standing section carries the frame:

```
--- LIVE CONTAINER <job-id> (running; not harness state) ---
cmd: <first 120 bytes of the command>
started: <HH:MM:SS>
status: running (elapsed <n>s)
--- END LIVE CONTAINER <job-id> ---
```

under the section header

```
--- LIVE CONTAINERS (background tasks; completions may arrive out of order) ---
live: <job-id-a> running | <job-id-b> running | none
```

A re-issued identical command while the job is live returns the SAME job id with the line
`[live] already running as <job-id>; job_output <job-id> to check.` The model's per-call escape
hatch is the AWAIT-MARKER: put `{"__await":true` FIRST in the call arguments to run that one call
inline (fire-and-forget is the default; the marker is never stripped).

### The completion report (the I3/I4 carrier)

The completion block rides a REGISTERED DYNAMIC CONTEXT (`live-containers-completion`): the loop
turns it into a sourced user-role snapshot appended to history, so the withdrawal is absence (the
delivered snapshot stays - it IS the durable record) and there is no prompt-tail rewrite. Everything
that settles between two admissions merges into ONE snapshot (one wrapper line + N frames + ONE
`[live] next: ` hint line, failures first, capped at `completionCapBytes`, default 4096):

```
[live] completion report (harness-appended; not a user request):
--- LIVE CONTAINER <job-id> completed ---
status: <status> (cause: producer|kill)
elapsed: <n>s
output (tail up to 2 KiB):
<tail; stderr in a [stderr] section exactly as job_output does>
--- END LIVE CONTAINER <job-id> ---
[live] job_output <job-id> to read the full output.
[live] next: <hint>
```

Failure frames add `exit: <code>`; kill frames add `kill reason: <reason>`. The emission is
at-most-once per batch (consume-on-logged-snapshot): an aborted attempt re-delivers; after delivery
the text stays as the stable tail and the next settle opens a fresh batch.

### CAN-2 - planted boards and the I5 lease

`live_plant(id, plantType, template?, expectAgents?, memberIds?)` opens a board in the calling
agent's section; children report with `[live-report] <plantId> <agentId> <status> <payload>` via
send_message (or through their job's settlement). A member silent for `plant.leaseTurns` (default 3)
PARENT TURNS self-declares the byte-exact row

```
[stale]     <agentId> - unreported for <n> parent turns; re-dispatch or mark failed
```

and that declaration IS the delegation-stall failsafe trigger (stallAction `prune` drops the member;
`live_container_set prune=<plantId>/<agentId>` is the manual twin). The board closes when all
members settle (plus closeMs for empty slots) and renders `board closed: <n>/<n> done in <n>s` for
one request, then withdraws.

### CAN-4 - the task-based failsafes

Silent by default (ledger-only, channel 1): the hang guard
(`failsafe hang <job-id> (<n>s no output)`, kill only via `hangAction: "kill"`), the live-timeout
kill (`live-timeout`), the admission guard, the retry-loop marker extension, the drift WARN line,
the orphan-board STALE header, the per-turn meta-budget (`failsafesPerTurn`, default 5), and the
section-collapse. `failsafes: "off"` (the default) disables the engine entirely - the CAN-1
transform is a feature, not a failsafe, and keeps working.

### CAN-5 - the suggester

With `suggester: "section" | "plant"` (default `off`), a qualifying user message (first of a turn
AND >= `suggestGateMinChars`, no "live container"/ "plant"/"suggestion" words, rate-capped) spawns
ONE detached one-shot subagent on `suggesterRoute` (the exploration strain by default). The strict
JSON answer becomes a CONFIGURED suggestion rendered as a planted-block preview frame with
`accept: live_container_set accept=<sid>` / `dismiss: live_container_set dismiss=<sid>`; `autoPlant`
instantiates it as a dormant block instead. PRIVACY: the default `redact` forwards only the first
200 chars plus the total length; `suggesterPrivacy: "verbatim"` forwards the user's request text (<=
`maxPromptBytes`) to the configured suggester route - the config flag IS the consent surface.

## Teaching the grammar (the tool-coach note)

The grammar above is only useful if the model KNOWS it exists - a model that never learned the
markers resorts to extraneous methods (copying a file aside to protect it from normalization,
wrapping a command to stay synchronous, improvising its own progress board). The teaching rides the
tool-coach's tier-2 persistent section: the profile patch overrides the coach's `notes.persistent`
cell with the shipped template plus the appended "Live-container grammar" block. The trigger is the
coach's own tier-2 machinery - the section turns on after `escalateThreshold` (6) terminal offenses
since the last note and stays up until `cleanWindow` (12) clean judged calls - exactly the moment
the model is misusing the terminal and most receptive to the correct machinery. The lesson block
names the two per-call markers (`{"__normalize":false`, `{"__await":true`), the planted-block
conventions (`[live-report]`, the `[stale]` self-declaration, `live_container_set accept=<sid>` /
`dismiss=<sid>` / `prune=<plantId>/<agentId>`) and the 14 CAN-3 template names, so the model uses
the built-in machinery instead of reinventing it. The byte-exact note text, the tier decision and
the ready-to-insert snippet live in the tool-coach README's "The note configuration" section.

## The counters

Counters (messages, turns, since last tool) come from the plugin's own `agent/pre-step` and
`tools/post-execute` observers - the plugin counts what it sees; exact token counts are NOT
available to plugins, so the gauge variables are honest approximations.

## The KV-cache honesty paragraph

A block whose text changes every request invalidates provider prefix reuse from its FIRST changed
token - everything after the changed byte is re-priced on the next call. `refresh: "request"` is
therefore cache-hostile for always-differing blocks; `refresh: "ttl"` with `ttlCalls` >= 8 (the
shipped default) is the recommended cadence: the section text is held for 8 assemblies, so the
prefix stays reusable for those 8 calls, and stable-until-event blocks (notes, counters under their
triggers) cost nothing extra. The design says so plainly rather than pretending per-request
recomputation is free.

## Config

See [SCHEME.md](SCHEME.md) for the full schema. EVERY knob is a volatile cell (hot edits commit
without remounting): `enabled`, `sectionName`, `refresh` (`request | ttl`), `ttlCalls`, `separator`,
`sectionBudgetBytes` and the block table - plus the wave-2 knobs (`detach.*`, `plant.*`,
`failsafes`, `hangBudgetMs`, `hangAction`, `failsafesPerTurn`, `suggester`, `suggesterPrivacy`,
`suggestGateMinChars`, `maxSuggestionsPerHour`, `maxPromptBytes`, `suggestTimeoutMs`, `autoPlant`,
`suggesterRoute.*`, `completionCapBytes`). When the rendered section exceeds `sectionBudgetBytes`,
the OLDEST frames collapse to one-line summaries - never silently dropped.

## The IDLE-forever posture

The plugin ships DISABLED: the bundle entry declares `enabled: false` only, the plugin never appears
in the profile's bundles, and it enables only by an explicit ACTIVATE (you edit the profile and
restart). A cold mount logs `disabled (enabled=false)` and every listener no-ops to a passthrough.

## The ledger

One log per module: `~/.dsh/playform/hook-dsh-live-containers.log` (config `logFile`). The strings
are the contract (byte-exact, `live-containers: ` prefix; the durable file lines are the
`[ISO] message` forms). Phase 1 ships nine; wave 2 adds the live-feature lines:

```
live-containers: disabled (enabled=false)
live-containers: activated (bundle 0.1.0, blocks=<n>, refresh=<policy>)
live-containers: block rendered <id> (<len> bytes)
live-containers: block skipped <id> (<reason>)
live-containers: section rebuilt (ttl <n>)
live-containers: section rebuilt (tools/change)
live-containers: render failed <id> -> skipped
live-containers: render unknown <id> <token>
live-containers: failsafe section-collapse <n>
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
```

Durable activation proof: `disabled (enabled=false)` on a cold mount, else the activated line with
the bundle version, the block count and the refresh policy. Skip lines log only when the reason
changes - the ledger stays quiet on steady state.

An activated session with the default table reads, for example:

```
live-containers: activated (bundle 0.1.0, blocks=14, refresh=request)
live-containers: block rendered time (113 bytes)
live-containers: block skipped agent-progress-board (unknown kind)
live-containers: section rebuilt (ttl 8)
live-containers: failsafe section-collapse 2
```

(`block rendered time (113 bytes)` - the `time` block with the body `14:03:27`: the two frame lines
plus the body, UTF-8 bytes.)

## The wave-3 monitors (CAN-7, live file checks)

Files are halted processes; the monitors put them into OPERATIONAL MODE. The plugin observes every
write the harness makes (the fs/observed events, heard on the root context) and, for files matching
your `watchlist`, runs the file's check set between turns - `tsc --noEmit`, `prettier --check`,
`cargo check` - through the same governed background path as everything else, and renders one band
per file in the live section:

```
--- MONITORS (file checks; not harness state) ---
monitors: 2 (∄1 !1 ~0 ∅0 x0) - 1 problem, 0 stale, 0 not run, 0 infra
--- MONITOR /repo/src/App.ts ---
clean (∄) | checked 14:03:27 v1 by agent-a | exit 0
--- END MONITOR /repo/src/App.ts ---
--- END MONITORS ---
```

- You never type `tsc --noEmit` to find out whether it should. Edits schedule the fast checks behind
  a debounce window; slow checks (`cargo`) never run per-edit - on demand
  (`live_monitor_check <path>`) or on a schedule (`monitor.slowCheckIntervalMs`). A version bump
  before the next request flips the band to `~ STALE (file changed after check)` WITHOUT a re-run -
  staleness is derived from the raw version tokens, never stored.
- The automatic enrollment is watchlist-gated: `watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }]`
  is all it takes; the default is empty (no scan, no watch-all). `live_monitor <path>` enrolls
  explicitly with the shipped classification (TypeScript -> tsc + format, Cargo.toml -> cargo check,
  package.json -> linked governance - the governor's own verbs are never re-run);
  `live_monitor off <glob>` opts out; `live_monitor list` shows what is watched;
  `agent: <sessionId>` plants a monitor into another session's scope.
- Honesty is hard: a clean `(∄)` renders only from an observed exit 0 of the exact check set for the
  exact version; a settle-less bump never renders clean; a sandbox-denied check renders
  `check denied (sandbox)`, never a code problem; every failure path degrades to the ledger and the
  band keeps its last-known result + STALE.
- Restart: check results persist in a dedicated storage domain (`live_containers_monitors`); a mount
  recovers them with the `(recovered)` provenance and a `not re-checked this session` clause;
  without the domain the bands degrade to `not run yet` - never a fabricated clean.
- Token budget: each band is capped (`monitor.bandCapBytes`, 2048), the overflow collapses to
  one-line counts (never silently dropped), the summary band is one line, and the stanza changes
  only when its truth changes (enrollment, settle, version bump, retirement, recovery) - stable for
  the KV cache between events.
- `plantType: "monitors"` on `live_plant` aggregates the members' monitored files into a parent
  board (`[monitored] <path> - <outcome> by <writer>`).
- The monitors are additive information: they never gate or deny an edit, and your own inline checks
  work exactly as before. The latency story: the model edits, the check runs between turns, the band
  flips at the next request - that is the loop's sample time.
- The SEVERE extensions (linkage alerts, cross-file attribution, CI-parity check sets, monitor-aware
  dedup) and the COMPREHENSIVE designs are specified and NOT shipped in v1; their knobs are accepted
  and inert.

## License

CC0-1.0.
