---
title: CAN-1 Live Tool-Call Blocks - the requirements
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/Requirements/01-LIVE-TOOL-CALL-BLOCKS.md
index: Documentation/INDEX.md
statuses:
  - name: the CAN-1 requirement spec
    state: resolved
    evidence: the durable spec; the I1 constraints folded into section 12
  - name: the CAN-1 implementation (the tool-call detach + the live marker)
    state: implemented
    evidence: C2's wave-2 modules; the J-series smokes
  - name: the command-only detach rule (the mutation family non-detachable)
    state: implemented
    evidence: hardcoded in Policy.ts, per the design
---

# CAN-1 - LIVE TOOL-CALL BLOCKS

## 1. The requirement statement (the user's intent, faithful)

An LLM calls `cargo build` or executes multiple commands.
The backend AUTOMATICALLY transforms this into a live-container call:

1. Propagate back - DON'T tell the LLM the call is detached yet (no design discussion in the conversation);
2. Modify the whole chain as if the tool call had already executed and completed;
3. Append a LIVE marker at the end: "this command's output is still running, you can proceed reasoning";
4. Return that to the LLM - the conversation progresses while the build runs in the background;
5. When it completes, append a block (or fill the SAME one) showing how it executed.

The generalization: EVERY tool call becomes programmable, non-awaited, LIVE.
The LLM achieves micro-interaction WITHOUT realizing it.
The LLM is surprised at the end, schedules more, does more with less - ONE planned tool call dispatches many.

## 2. The verified machinery this rides on

- **The interception point**: `tools/pre-execute`.
	A waterfall listener sees `Exec` (name + arguments + agent) BEFORE the call runs.
	The listener's returned decision is authoritative.
	The tool-coach already denies calls there (hook-dsh-tool-coach/Source/Function/Apply.ts:395-445, `return { kind: "deny", reason: Reason }`).
- **The result-shaping point**: `tools/post-execute` is the ONLY legal point to replace model-visible output for ALL tools.
	The CCR listener replaces content with `{ kind: "accept", content: [ { type: "text", text } ] }` (hook-dsh-ccr/Source/Function/Apply.ts:204-269).
- **The background home**: `ctx.jobs` - the in-process registry (@deepseek-ai/dsh-jobs-local README).
	`start()` runs with preflight-before-start.
	Per-owner admission is `maxConcurrentJobsPerOwner` (default 10).
	Bounded output rings are `retainBytes` 262144 LIVE / `settledRetainBytes` 16384.
	Settlement is first-wins, with ONE `settled` event and per-listener containment.
	Jobs belong to the OWNER, NOT the producer tool.
	A producer reload does NOT stop them.
- **The completion append**: `dsh-tool-jobs` completion notices.
	"when a job finishes, the owning agent receives `background job <id> (<kind>: <label>) finished [status: ...]. Read its output with job_output.` as an in-session message; a busy agent has the notice injected into its next step - the turn cannot close while the inbox holds it; an idle agent is woken with a follow-up turn; `maxConsecutiveWakes` caps the self-exciting chain."
- **The retrieve tool**: `job_output(job_id, wait?, timeout_ms?)` reads since the previous read.
	Final-output jobs return the result ONCE on the FIRST read after settlement.
- **The jobs controller attach**: the factory's P1 effect probes `ctx.get("jobs")` and calls `attachController(name)` (plugin-dsh-factory SCHEME.md:259-261).
	Our plugin attaches its own controller the SAME way.

## 3. The full lifecycle (severe extension)

1. **Intercept** - the `tools/pre-execute` waterfall listener runs FIRST in its body `next()` (downstream settles).
	The listener then evaluates the POLICY (section 5) against Exec. Decision branches:
	- `transform` - the call is detached;
	- `pass-through` - the call runs inline as today;
	- the listener NEVER denies except by policy error containment (section 7).
2. **Detach** - on transform:
	- start the job: `ctx.jobs.start()` with
		- kind = the Exec's tool family (e.g. `command` for bash/pwsh);
		- label = a short rendering of the command (first ~80 bytes);
		- producer = the SAME tool invocation, re-dispatched into the job's producer (the job's producer must run the exact command the model called, preserving cwd/env/timeout policy from Exec.arguments);
	- mark the pair (agent -> job id) in the plugin's per-agent state;
	- admit before starting: at capacity, fall back to pass-through (fail-open - section 7), NEVER queue.
3. **Propagate back the "already completed" fiction** - the listener returns a decision shaped like the tool-coach's deny but semantically a completed result:
	- `{ kind: "deny", reason: <the still-running marker text> }` is the candidate carrier because deny is the ONLY pre-execute decision that produces model-visible text WITHOUT executing.
		The DESIGN agent must verify whether the deny reason renders as a tool RESULT (isError?) or as a blocked-call notice.
		If deny text CANNOT be rendered as a non-error result, the transform must instead return an ACCEPT decision with synthetic content if the pre-execute decision schema supports it (open seam question 7.1).
		The required text grammar (byte-exact candidates, ONE line each):

		```
		[live] <tool> <job-id> running - output pending.
		[live] The command started in the background and is still running.
		[live] You can proceed with reasoning; its output will be delivered when it completes.
		```

		condensed single-line candidate (preferred, KV-cache friendly):

		```
		[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.
		```

4. **The conversation progresses** - the model reads the marker as a completed call.
	The chain continues: the model reasons, schedules more calls, or ends the turn.
	Because the job's owner is the agent, disposal of the agent still cancels the job (the jobs-local teardown contract).
	The background work CANNOT outlive the conversation.
	That is the containment guarantee the "fire-and-forget but safe" property needs.
5. **Background execution** - the producer runs the real command under the same platform sandbox policy as an inline call.
	Output appends to the bounded ring.
	On `settle` (first-wins), the registry emits the `settled` event.
	The plugin's `{ owner }` scoped subscription (dsh-jobs-local events layering) receives it.
6. **The completion append - fill the SAME one**: the plugin maps the settle cause + status + ring tail into a completion block delivered to the conversation.
	Preferred carrier order:
	a. the stock completion notice (dsh-tool-jobs) already delivers `background job <id> ... finished`.
		The plugin ADDS a sibling line with the how-it-executed summary by contributing to the notice path if the notice text is composable; if NOT composable,
	b. a plugin-registered tool `live_block_read(job_id)` OR a re-render of the LIVE marker block in the system-prompt/assemble section so the NEXT request sees the result inline (the v1 assemble seam; append-only);
	c. the withdrawal of the standing block: once the completion block is delivered, the corresponding standing "[live] ... running" block is REMOVED from the assemble section.
		The prompt tail does NOT keep claiming a still-running command (cache-friendly: it stopped changing).

## 4. The marker grammar (byte-exact candidates)

Standing block (visible in the assemble section while the job runs):

```
--- LIVE CONTAINER <job-id> (running; not harness state) ---
cmd: <first 120 bytes of the command>
started: <HH:MM:SS>
status: running (elapsed <n>s)
--- END LIVE CONTAINER <job-id> ---
```

Inline marker appended to the synthetic tool result:

```
[live] <job-id> running: <cmd-head> - output pending; proceed reasoning.
```

Completion block (on settle):

```
--- LIVE CONTAINER <job-id> completed ---
status: <status> (<cause>: producer|kill|teardown)
elapsed: <n>s
output (tail up to 2 KiB):
<ring tail, stderr noted in a [stderr] section exactly as job_output does>
--- END LIVE CONTAINER <job-id> ---
```

Failure variant: `status: error` with the error tail.
Kill variant: `status: killed` with the kill reason.

## 5. The per-tool-call transformation policy

- `mode: "off"` (default while IDLE) | `"long-running"` (recommended FIRST release) | `"all"` | `"selected"`.
- `long-running` heuristic, ALL knobs volatile:
	- bash/pwsh/shell-family tools ONLY;
	- command contains ANY of the configured markers (default: `cargo build`, `pnpm build`, `npm install`, `pnpm install`, `pip install`, `cmake`, `make`, `go build`, `tsc -b`, `next build`) OR previous same-prefix calls averaged > `minHistoricalMs` (default 20000ms, per-agent observed history from post-execute timestamps);
	- estimated from the last N runs of the same command prefix, cheap and pure-observer.
- `all` - EVERY tool call detaches.
	Implemented but flagged DANGEROUS.
	Tools with model-coupled sequencing (edit -> str-replace-editor chains where the next call's arguments depend on the result) can produce broken chains.
	The config must carry `allRequiresConfirm: true`.
	The SCHEME must state the hazard.
- `selected` - an explicit tool-name allowlist + per-command regex allowlist.
- Exemptions (ALWAYS inline): tools whose result the very next call needs to know (the plugin CANNOT know - so the DEFAULT is long-running-only, and the `selected` allowlist is how the user escapes that conservative default, NOT the reverse).
- `maxLivePerAgent` (default 5) - admission guard; at capacity pass-through.
- `minLatencyMs` (default 2000) - do NOT detach commands likely to finish faster than the model's next step would take.
	The detach overhead must pay for itself.

## 6. The micro-interaction loop (the surprise effect)

The user's words: "the LLM ... is surprised at the end, schedules more, does more with less (one planned tool call dispatches many)".
The design must deliver:

- The model NEVER plans the detach - it plans `cargo build`.
	The transform is invisible at plan time (CAN-1's "don't tell the LLM yet").
- The completion notice arrives in the NEXT step while the model is already thinking about something else.
	The injected notice is the "surprise".
- To help the model use the freed time well, the standing assemble section gains ONE stable line listing LIVE jobs:
	`live: <job-id-a> running | <job-id-b> running | none` - stable until settlement (cache-friendly), so the model can see its fleet at ask-time WITHOUT a job_list round trip.
	This is the block CAN-2's board generalizes.
- The "schedules more" loop is bounded by `maxConsecutiveWakes` on the dsh-tool-jobs side - we inherit that cap, do NOT bypass it.
	The SCHEME must state that disabling the cap enables the unbounded self-exciting chain the tool-jobs README warns about.

## 7. The failure, error, timeout, cancellation paths

- **NEVER throw into the waterfall.** Every path wraps in try/catch.
	On ANY internal error the listener returns the DOWNSTREAM decision (pass-through).
	The call runs inline as if the plugin were NOT mounted.
	Ledger: `transform failed <tool> -> inline`.
- **Admission failure** (owner at maxConcurrentJobsPerOwner): pass-through + ledger `capacity full <owner> -> inline`.
- **Producer throws at start** (preflight failure): pass-through + ledger `start failed <tool> -> inline`.
- **Job fails** (settle cause producer, status error): the completion block renders status error with the stderr tail.
	The standing block is withdrawn the next assembly after delivery.
- **Kill** (model or user): the completion block renders status killed with the reason.
- **Owner teardown** (the conversation ends): the jobs registry cancels the jobs.
	The completion block is NOT delivered (dsh-tool-jobs skips settlements nobody can read).
	Ledger: `owner gone <job-id>`.
- **Timeout**: `liveTimeoutMs` (default 600000, 10 minutes) - the plugin arms its own timer.
	On expiry the plugin calls the registry's kill with reason `live-timeout`.
	The completion block renders status killed.
	The stock `dsh-tool-call-timeout-policy` applies to INLINE calls, NOT detached ones.
	Our own timer is the ONLY guard.
- **Model retries the call**: the model may not read the marker and re-issue `cargo build`.
	Policy: detect a re-issued call whose normalized command matches a still-live job's command for the same agent.
	The second call returns the SAME marker referencing the SAME job id plus the line `[live] already running as <job-id>; job_output <job-id> to check.`
	(NO second job - the dedup is per (agent, normalized-command, live-only).)
	Ledger: `dedup <tool> -> <job-id>`.
- **Model awaits anyway** (calls job_output with wait:true): that is legal and supported - the model opted into waiting.
	The wait consumes the tool-jobs wait cap.
	The job settles as awaited, NO notice.
- **Tool result ordering**: a detached call's completion can land between ANY two later steps.
	The injected notice merges into the next step (several settling jobs cost ONE step).
	Ordering is "earliest-next-step".
	The block's timestamps make the ordering reconstructible for the model.
	The SCHEME must document that the model may see a completion BEFORE other tool calls it logically preceded.
	This is the price of detachment, disclosed in the standing section header line
	`--- LIVE CONTAINERS (background tasks; completions may arrive out of order) ---`.

## 8. The KV-cache + conversation-order honesty

- The inline marker is ONE line added to a tool result that happened once - NO cache cost (tool results are history, NOT prompt prefix).
- The standing assemble section changes ONLY when jobs start or settle - stable-until-event, the cheapest class (v1 research section 3).
- The completion block is a NEW message in history - append-only, NO cache cost beyond its own bytes.
- The withdrawal (removing a standing block) rewrites the prompt tail ONCE per settlement - acceptable.
	The alternative (never withdrawing) poisons the model's world model with still-running fictions, which is worse.
	The SCHEME states the tradeoff explicitly.

## 9. The edge cases (most varied scenarios)

1. Multiple commands in ONE call (`cmd1 && cmd2`): the whole string is the job's command.
	NO per-command splitting in v1 (splitting is CAN-6 idea 5).
2. The call is interactive (needs stdin): exempt via the policy's interactive-detection (NO TTY passthrough into a background ring) - inline.
3. The call is a family tool like fs read: NEVER detached unless `all` or `selected` says so.
4. The same command legitimately needed twice (two different dirs): the dedup key includes the command string, so different commands dedup apart.
	Same string + same agent + BOTH LIVE = dedup (correct: ONE build is sufficient).
5. The build finishes before the model's next step even starts: the notice injection still happens (it is already a settled job) - zero waste.
6. The model ends its turn while a job is LIVE: the idle wake path delivers the completion as a follow-up turn.
	That is the turn "surprise" the user described, but budgeted by maxConsecutiveWakes.
7. The user watches: the jobs' session timing records (jobs-local README, session timing records section) mean the GUI's job surfaces see the LIVE job with its progress line.
	The user sees what the model does NOT yet.
8. Two agents in the same conversation group detach the same build: dedup is per-agent (owner-scoped).
	Cross-agent dedup is a CAN-6 idea, NOT v1.
9. The command mutates state the conversation later assumes changed: the completion block's status line makes the outcome explicit.
	The standing section's caveat line ("completions may arrive out of order") plus the model's own job_output poll cover the drift.
	This is the honest residual risk of detachment and belongs in the README as such.
10. Session restart: LIVE jobs and output rings are not resumed (jobs-local README).
	The standing section must render `status: lost (process exit)` for any record that survives the restart WITHOUT a LIVE registry backing.

## 10. The seam map

- EXISTS: tools/pre-execute waterfall with authoritative decisions (tool-coach Apply.ts:395-445); tools/post-execute content replacement (ccr Apply.ts:204-269); ctx.jobs registry + admission + rings + settle (dsh-jobs-local README); job_output/job_list/job_kill + completion notices + busy-injection and idle-wake (dsh-tool-jobs README); factory P1 controller attach (SCHEME.md:259-261); assemble standing sections (tool-coach Apply.ts:499-556); agent/pre-step reset (Apply.ts:456-490).
- MISSING: (a) a verified decision shape in pre-execute that yields a synthetic non-error RESULT text (the deny-reason carrier needs a design pass - seam question 7.1); (b) the plugin-side per-agent LIVE registry + dedup + the policy engine; (c) the completion-block composer + the standing-section renderer; (d) the withdrawal after delivery.

## 11. The acceptance criteria

1. A `cargo build`-matching bash call under `mode: "long-running"` is detached.
	The model's tool result contains the inline marker with a job id, the conversation continues, and the build runs in ctx.jobs (provable via job_list).
2. On settlement the owning agent receives a completion block containing status, elapsed, and an output tail.
	The standing block for that job is gone from the next assembly.
3. ANY plugin internal failure leaves the call running inline (fail-open provable by injecting a start error in the smoke harness).
4. A re-issued identical command while LIVE dedups to the same job id.
5. ALL ledger strings byte-exact per the SCHEME; NO throw reaches ANY waterfall listener in ANY test.
6. The plugin ships disabled; enabling exposes mode "off" by default.

## 12. BINDING CONSTRAINTS (appended by the I1 requirement-guard agent, 2026-10-19 - these are HARD requirements that bind over any earlier wording in this file where they conflict; the research sections above are otherwise untouched)

### 12.1 THE COMMAND-ONLY DETACH RULE (hard)

The LIVE tool-call transformation detaches ONLY the command-executing tools: `bash`, `pwsh`, and the other command runners of the same family (`cargo`, `npm`, `pnpm`, `make`, and ANY tool whose Exec is a spawned subprocess).
The content-mutating tools - `write`, `edit`, `raw-write`, `normalize-file` - NEVER detach, in ANY mode (`long-running`, `all`, OR `selected`).
This binds over section 5's `all` description and section 9 edge case 3's wording.
Under `all`, the mutation-family tools still run inline.
`selected`'s allowlist MUST reject them (the policy engine treats them as permanently non-detachable, NOT merely unlisted).

Reason (verified machinery, section 2): the fs/observed governance chain - the governors, the pinner, and the normalize family - fires SYNCHRONOUSLY on tool-layer writes, on the same waterfall the interception listens on.
A detached write would race that governance chain.
The write would execute in the background job while the synchronous chain either already ruled on a call that has NOT run or rules on a call that has already run.
Either way the pin/govern discipline is silently broken (a write could land that governance would have denied, or governance could deny a write that already landed).
Read-only observation tools (fs read, glob, grep) MAY be detached under `selected` ONLY - they mutate nothing - but they are NOT part of the default detach set.
The default remains command-runner-only.

Acceptance addition: a smoke must prove `write`/`edit` under `mode: "all"` still execute inline, synchronously, and are governed (pin check fires) exactly as with the plugin unmounted.

### 12.2 THE SANDBOX + FAIL-OPEN RULE (hard)

1. Same isolation as the ptc runtime: EVERY detached command runs under the SAME sandbox policy, the SAME deadlines, and the SAME output caps as an inline (ptc-runtime-governed) execution.
	The plugin MUST NOT weaken, bypass, or re-implement ANY of them:
	- sandbox: the producer re-dispatch (G2) runs the command through the bash tool's own governed execution path, so the platform sandbox policy applies unmodified (this hardens section 3 step 5's "same platform sandbox policy" from a property into a requirement);
	- deadlines: `liveTimeoutMs` (section 7) is the detached path's OWN deadline and MUST be <= the inline deadline policy for the same tool family - detachment must NEVER buy extra runtime;
	- output caps: the job's ring (`retainBytes` 262144 LIVE / `settledRetainBytes` 16384) is the output cap.
		The completion block renders at most the 2 KiB tail (section 4) - NO unbounded rendering anywhere in the append path.
2. Fail-open transform listener: the `tools/pre-execute` transform listener is FAIL-OPEN - it NEVER throws into the tools waterfall (the tool-coach/post-execute precedent, non-negotiable 1).
	EVERY branch is wrapped.
	On ANY internal error (policy evaluation, job start, marker composition) it returns the downstream decision (pass-through).
	The call executes inline, exactly as if the plugin were NOT mounted (section 7's first bullet is hereby a HARD requirement, NOT design guidance).
	The listener must also NEVER leave a half-detached state.
	If the job starts but the marker composition fails, the listener kills the just-started job with reason `marker-failed` and returns pass-through.
3. The "still running" marker is the failure fallback.
	Whenever the transform CANNOT guarantee the full fiction (completion append path broken, composer error, standing-section renderer failure), the marker side stays honest.
	The standing block and/or the inline marker keep saying "still running / output pending".
	The model's recovery path is `job_output(job_id)`.
	The plugin NEVER fabricates a completion it did NOT observe from the `settled` event.
	A marker that CANNOT be withdrawn after restart renders `status: lost` (section 9 edge case 10), NEVER silently disappearing.

Acceptance addition: a smoke must prove (a) a detached command inherits the sandbox (a sandbox-denied command fails the same way detached as inline), (b) a thrown composer error yields inline execution + ledger `transform failed <tool> -> inline` and no orphan job, (c) NO completion block ever appears WITHOUT a corresponding settled event.
