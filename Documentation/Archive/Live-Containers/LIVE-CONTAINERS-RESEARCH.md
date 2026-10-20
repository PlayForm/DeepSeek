---
title: Live Containers - the v1 research
category: Archive/Live-Containers
kind: one-shot-record
date: 2026-10-19
status: complete
registry: Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md
index: Documentation/INDEX.md
statuses:
  - name: the feasibility verdict (possible via the system-prompt/assemble waterfall)
    state: resolved
    evidence: the tool-coach tier-2 precedent
  - name: the system-prompt-only caveat (no in-body seam)
    state: resolved
    evidence: the request build deep-freezes message identities
  - name: the v1 shape (the live section, the fixed frame, the five kinds)
    state: implemented
    evidence: the phase-1 plugin; hook-dsh-live-containers
  - name: the programmable stage (Node processes under the sandbox)
    state: deferred
    evidence: a future stage; Rust via koffi later; Rhai/WASM deferred
  - name: the 14 block types in the brainstorm
    state: in-progress
    evidence: the phase-1 kinds; the wave-2 kinds skip as unknown until wired
---

# LIVE CONTAINERS - Research

Date: 2026-10-19
Status: research only (read-only pass; this file is the sole deliverable)
Prepared by: the researcher subagent (GLM-5.3-Flash, cloudflare-workers-ai)
Routing law: every subagent = provider cloudflare-workers-ai / model
@cf/zai-org/glm-5.3-flash / reasoningEffort low.

---

## 1. The idea (the user's words, faithful)

LIVE CONTAINERS: dynamic, modifiable conversation blocks. Each time the
harness sends the full conversation to the LLM API, the live blocks get
RECOMPUTED and RE-INSERTED into the conversation, without modifying anything
else. Canonical example: "can you tell me the time" - either the LLM or the
user constructs a live block that (at conversation time) contains the time; on
every subsequent request the block is recomputed and re-inserted, so the block
always holds the CURRENT time at ask-time while the rest of the conversation
stays static. The block is a prefill, but dynamic.

LATER STAGE (a future date, to be prepared for): the blocks become fully
PROGRAMMABLE - TypeScript, Rhai, Rust or whatever the harness can run
dynamically - so a block can be a validator, hold variables (conversation
length, scores, token counts), and be programmed by the LLM itself, e.g.:

	(if this.context.message.length > 10) {
		echo "This conversation is exceeding the set limit";
	} else {
		echo "This is the first message in the conversation";
	}

The user wants: (1) a feasibility verdict with the exact seams; (2) a rich but
succinct brainstorm of pre-programmed blocks; (3) the programmable-stage
design grounded in what the harness can actually run dynamically; (4) three
fully self-contained agent specs so the work can be dispatched later.

---

## 2. The feasibility verdict + the seams map

VERDICT: **POSSIBLE for the core mechanic, with one caveat.** A per-request
recomputed-and-re-inserted block already exists in the harness as a first-class
seam - the `system-prompt/assemble` waterfall (the tool-coach's channel 2 is
the live precedent). The caveat: that seam inserts the block into the SYSTEM
PROMPT (or, via dynamic contexts, as a sourced user-role snapshot), NOT into
an arbitrary position inside the conversation body. There is NO plugin seam
today that rewrites a marker block inside the derived message body between the
session log and the API request; the design below therefore hosts v1 in the
assembly seam and proposes the in-body marker block as a future harness-side
addition.

### The verified seams (file:line anchors)

1. `system-prompt/assemble` waterfall - fires ONCE PER REQUEST, the returned
	assembly is AUTHORITATIVE, a listener appends `{name, text}` sections
	without touching anything else:
	- Classic/packages/hook-dsh-tool-coach/Source/Function/Apply.ts:499-556
		(the tier-2 persistent section listener: `next()` first, append-only
		sections, fail-open try/catch, TTL cache rebuilt on sectionTtl and
		invalidated on `tools/change`).
	- Classic/packages/hook-dsh-tool-coach/README.md:20-37 (the four tiers +
		the dynamic instruction engine - live-fetched tool table, TTL, tools
		change invalidation: a per-request recompute ALREADY ships).
	- Harness (app.asar dsh/node_modules/@deepseek-ai/dsh-system-prompt/
		README.md, "Understand the implementation"): one `assemble()` call
		merges layers, canonicalizes order, runs the scope-filtered
		`system-prompt/assemble` waterfall; sections become prompt text;
		dynamic contexts become SOURCED USER-ROLE SNAPSHOTS in model history;
		`refreshContext()` re-reads registered context providers after
		pre-step on every step. Listener counts: the waterfall determines the
		delivered prompt and tool schemas.
2. Prompt variables - `{{name}}` resolved AT EACH ASSEMBLY, a plugin
	registers `ctx.systemPrompt.variable('x', () => value)`:
	- dsh-system-prompt README ("Contribute a prompt variable"). This is the
	cheapest live-block primitive: the template is static, the value is
	recomputed per request.
3. The request-build path (what a plugin can and cannot touch):
	- dsh/node_modules/@deepseek-ai/dsh-agent-loop/README.md ("Turn and step
		flow", "Request headers and adapter defaults"): the request is
		`header.config` + `deriveMessages()` + `header.tools`; it carries NO
		separate `system` field - the prompt lives as `system/message` nodes
		in derived history; the loop DEEP-FREEZES each derived message
		identity on its first request; `llm/stream` listeners receive CHUNKS
		and the options arrive deep-frozen - a plugin cannot rewrite message
		bodies at request-build time. Prompt CHANGES inside a continuing
		series are appended after the cached history only when the prepared
		route declares `systemPromptUpdate: 'in-history'`; otherwise the
		system node is rewritten in place and provider prefix cache misses
		from the first changed token (dsh-system-prompt README, "KV Cache
		effect").
	- Conclusion: the conversation-body rewrite seam does NOT exist for
		plugins; the per-request recompute seam DOES exist (assemble + dynamic
		contexts + variables).
4. Per-call markers and volatile scopes (the family's own mechanics to reuse):
	- Classic/packages/hook-dsh-normalize-dash/Source/Function/Normalize.ts:41-67
		(the `{"__normalize":false` FIRST-KEY per-call opt-out marker, detected
		on the first delta, marker stripped by the core).
	- Classic/packages/hook-dsh-normalize-dash/Source/Variable/Config.ts:22-92
		(volatile Schemastery cells - hot edits commit WITHOUT remounting; the
		loader hands volatile fields to apply as `{ get() }` cells).
	- Classic/packages/plugin-dsh-factory/SCHEME.md:232,294 (the factory's
		State builder defensively unwraps volatile cells; the P10
		loader/volatile-update listener refreshes them in place - the
		tool-coach applies the same pattern at Apply.ts:178-202).
5. Dynamic-language reality TODAY:
	- dsh/node_modules/@deepseek-ai/dsh-ptc-runtime-node/README.md: model-
		written TypeScript runs in fresh Node processes under the same
		platform sandbox policy as Bash (`per-call` mode) or in a confined
		per-agent persistent REPL (`persistent-in-memory`), with deadlines,
		output caps, and a V8 heap limit. THIS is the harness's dynamic
		execution engine.
	- Documentation/Plans/APHRODITE-RUST-DYLIB-INTEGRATION.md:1-106: Rust is
		runnable dynamically via `koffi` (already bundled at app.asar.unpacked
		/dsh/node_modules/koffi) loading a prebuilt dylib with a JSON-string C
		ABI; the plan recommends dylib-primary with an HTTP fallback. So a
		Rhai/Rust-backed block is feasible by the same pattern - but it is a
		later stage, not v1.
6. Dynamic content in tool results (the other insertion point the family
	uses): Classic/packages/hook-dsh-ccr/README.md - `tools/post-execute` is
	"the only point that can legally replace model-visible output for all
	tools" (marker + retrieval). Useful for tool-result-adjacent live blocks,
	not for a standing per-request block.

---

## 3. The proof-of-concept v1 shape

**Seam choice:** v1 hosts each live block as a `system-prompt/assemble`
SECTION named `live-containers`, appended after `next()` exactly like the
tool-coach's tier-2 section (Apply.ts:540-543). Each configured block
contributes one labeled stanza recomputed at assembly time. For blocks that
should read as part of the conversation rather than as instructions, v1 can
additionally register a dynamic CONTEXT (user-role snapshot) provider - the
harness re-reads context text per request via `refreshContext()`
(dsh-system-prompt README). An in-body marker block (a `{{live:...}}` token
inside a logged message that the LOOP renders at derive time) is explicitly
OUT of scope for v1: no plugin seam exists; it is the harness-side follow-up.

**v1 config surface (all volatile cells, hot-editable, no remount):**

	enabled: boolean (default false - the IDLE-forever posture)
	logFile: string (default ~/.dsh/live-containers.log)
	sectionName: string (default "live-containers")
	refresh: "request" | "ttl" (default "request")
	ttlCalls: number (default 1; when refresh = "ttl", the section cache is
		rebuilt every ttlCalls assemblies - the tool-coach's sectionTtl
		pattern)
	separator: string (default ASCII dashes)
	blocks: array of block specs, each:
		id: string (stable label)
		kind: "time" | "counter" | "manifest" | "gauge" | "note" | "template"
		template: string (the rendered body; {{token}} variables resolved per
			request from the block's own variable table)
		enabled: boolean (per-block flip)

**The variables v1 ships:** `{{time}}`, `{{date}}`, `{{tz}}`,
`{{messageCount}}` (from a cheap `agent/pre-step`-adjacent count the plugin
keeps itself), `{{turnCount}}`, `{{sinceLastTool}}` (elapsed seconds, updated
on `tools/post-execute`), `{{sessionId}}`, `{{cwd}}` (via
`ctx.systemPrompt`-registered values the plugin owns).

**Recompute trigger:** the assemble listener runs per request by definition;
`refresh: "ttl"` merely caches the rendered text for N assemblies (KV-cache
friendliness - see below).

**Ledger strings (byte-exact contract, `live-containers: ` prefix):**
`disabled (enabled=false)`, `activated blocks=<n> refresh=<policy>`,
`block rendered <id> (<len> bytes)`, `block skipped <id> (<reason>)`,
`section rebuilt (ttl <n>)`, `render failed <id> -> skipped`.

**Order-safety + byte-identity:**
- The family's ledger strings stay byte-exact; the live block content is NOT
	a ledger string - it is the plugin's own dynamic output.
- Every block renders inside a fixed frame so the model cannot confuse it
	with the harness's real state:

		--- LIVE CONTAINER <id> (recomputed each request; not harness state) ---
		<rendered body>
		--- END LIVE CONTAINER <id> ---

- The section is APPEND-ONLY in the waterfall (after `next()`); nothing else
	in the assembly is touched (the tool-coach discipline, Apply.ts:493-497).
- KV-cache honesty: a block whose text changes every request invalidates
	provider prefix reuse from its first changed token (dsh-system-prompt
	README, KV Cache effect). The design says so plainly: refresh "request"
	is cache-hostile; "ttl" with ttlCalls >= 8 is the recommended default for
	always-differing blocks like time-with-seconds, while stable-until-event
	blocks (scoreboard, manifest) cost nothing extra.

---

## 4. The brainstorm (the use-case catalog)

Each entry: what the LLM sees (shape), the recompute trigger, the knobs.

1. **The time/date block** (the canonical example).
	Shape: `--- LIVE CONTAINER time --- 2026-10-19T17:09:45+03:00
	[Europe/Sofia] --- END ---`.
	Trigger: every request (or TTL 60 calls for cache hygiene).
	Knobs: timezone, format, ttlCalls.
2. **The conversation-state block** (the user's pseudo-code, concrete).
	Shape: `messages=17 turns=5 sinceLastTool=42s headroom=~118k tokens`.
	Trigger: every request. Knobs: which gauges, warning thresholds.
	The validator variant renders the user's echo lines:
	`if messages > 10 -> "This conversation is exceeding the set limit"`
	else -> `"This is the first message in the conversation"`.
3. **The scoreboard/checklist block** - progress through a multi-step task.
	Shape: `TODO 3/7 done | current: "write smoke C4" | next: "docs"`.
	Trigger: recompute per request; STATE advanced by the LLM asking (a tiny
	`live_container_set` tool) or by watching tool calls.
	Knobs: items list, done-marker token.
4. **The live-manifest block** - the family's own state surfaced INSIDE the
	conversation. Shape: one line per plugin:
	`tool-coach=on tier=2 | ccr=on stored=41 | normalize=dash scopes=3`.
	Trigger: per request (cheap string concat over the plugins' ledgers or
	debug attachments). Knobs: which plugins, depth.
5. **The guard/validator block** - threshold warnings.
	Shape: `WARNING: tool retries >= 3 this turn - consider a different
	approach` (or silence when under threshold).
	Trigger: every request; fires only when a threshold trips. Knobs:
	thresholds, echo lines.
6. **The counter block** - attempts, retries, elapsed time since the last
	tool call. Shape: `bash attempts this turn: 2 | last tool 42s ago`.
	Trigger: every request. Knobs: window, reset-on-user-message (the
	tool-coach's agent/pre-step reset precedent, Apply.ts:456-490).
7. **The interactive-coach block** - a tool-coach-style note that updates
	itself. Shape: `Tip: use the edit tool for file content (last 3 calls
	were bash reads)`. Trigger: recompute per request from the plugin's own
	counters. Knobs: tips table, cooldown.
8. **The memory block** - the LLM's own pinned notes, re-injected every
	request so they survive context growth. Shape: `PIN: the build command
	is pnpm -r build; tests live in Target/`. Trigger: per request; state
	set via a `live_container_set memory=...` tool. Knobs: max bytes.
9. **The constraint-reminder block** - standing rules the user wants
	undeniable at ask-time. Shape: `NEVER run git mutations. ASCII only.
	Tabs only.` Trigger: per request. Knobs: free-text rule list.
10. **The session-stats block** - token/context meters. Shape:
	`approx chars sent last request: 84k | sections: 6`. Trigger: per
	request or TTL. Knobs: metrics set, format.
11. **The TODO-tracker block** - the harness-equivalent of the todo list,
	kept current without the LLM re-stating it. Shape: rendered checklist
	from the plugin's state. Trigger: per request. Knobs: item schema.
12. **The diff-summary block** - a rolling summary of files the session
	touched (from fs/tool observation). Shape: `changed: Apply.ts +40-12,
	Config.ts +6`. Trigger: TTL (expensive to build). Knobs: watch list.
13. **The countdown/expiry block** - "research deadline in 2h 14m" or
	"goal round 4 of 8". Trigger: per request. Knobs: target time, label.
14. **The environment-drift block** - cwd, branch (read-only), free disk,
	battery of the workspace. Shape: one compact line. Trigger: TTL.
	Knobs: which facts.

---

## 5. The programmable-stage design (the later stage)

**What the harness can run dynamically TODAY:**
- TypeScript: `@deepseek-ai/dsh-ptc-runtime-node` - model-written TS in a
	fresh Node process under the Bash platform sandbox (`per-call`), or a
	confined persistent REPL per agent (`persistent-in-memory`), with
	deadline, output-cap, and V8 heap limits. This is the sanctioned engine.
- Rust: the Aphrodite pattern - a prebuilt dylib with a JSON-string C ABI
	loaded via the bundled `koffi` (Documentation/Plans/
	APHRODITE-RUST-DYLIB-INTEGRATION.md:14-65). Feasible, but adds binary
	distribution and signing concerns (open question 5 there: Gatekeeper).
- Rhai (or WASM): no existing harness facility; would require shipping an
	interpreter/wasm runtime inside the bundle. WASM via a pure-JS engine is
	possible but slow; Rhai would need a wasm or napi build. Deferred.
- What the harness can NOT do: arbitrary `eval` in the plugin's own process
	is not a sanctioned surface - plugin code ships as bundled TS; a live
	block must never `eval` its template. v1 therefore uses a safe
	substitution engine (token replace only, no expressions). The
	programmable stage routes expression evaluation through the ptc-runtime
	(sandboxed, capped) - never through `new Function`.

**Design for the programmable stage:**
- Each block gains `kind: "program"` with `program: string` (the source) and
	`context: "time" | "counters" | "full"`.
- Execution: send `{ source, context }` to a ptc-runtime call; the program
	returns a STRING (the rendered body) or a structured
	`{ body, severity }`; anything else is a render failure -> block skipped
	+ ledger line `render failed <id> -> skipped`.
- Caps: per-call timeout (default 2s), output cap 16 KiB, no filesystem
	access in the block's sandbox policy, no network. The LLM can WRITE
	programs (the user's vision: "programmed by the LLM itself") through a
	`live_container_program` tool that validates and stores the source in
	the volatile config/state; programs are versioned in the ledger.
- Safety invariants: a program failure never fails the assembly (fail-open,
	the waterfall discipline); a program never sees message CONTENT unless
	`context: "full"` is explicitly enabled per block (privacy gate); the
	program's output is always framed by the LIVE CONTAINER markers so it
	cannot impersonate harness state; a size cap on stored programs.
- Rust/Rhai path (optional later): same interface behind a `kind: "dylib"`
	block backed by the koffi pattern, for blocks that must be fast and
	stateful (e.g. a token estimator).

---

## 6. The 3-agent specs

Routing triple for ALL three: provider cloudflare-workers-ai, model
@cf/zai-org/glm-5.3-flash, reasoningEffort low. All three specs are COMPLETE
and self-contained. **NOT to be executed until the ACTIVATE message arrives.**

---

### SPEC A1 - the LIVE-CONTAINERS plugin coder

ROLE: implement `Classic/packages/hook-dsh-live-containers/` (the Classic +
EffectTS twin discipline of the family; mirror the tool-coach's anatomy
exactly: package.json, cordis.patch.yml, Configuration, Source/{Function,
Interface,Variable}, Target, README.md, SCHEME.md).

SURFACE: ONLY `Classic/packages/hook-dsh-live-containers/**`. Read first:
Classic/packages/hook-dsh-tool-coach/Source/Function/Apply.ts (the five
listeners + the waterfall discipline + the State build), the tool-coach
README.md + SCHEME.md, Classic/packages/plugin-dsh-factory/SCHEME.md (the
State builder + volatile cells), Classic/packages/hook-dsh-normalize-dash/
Source/Variable/Config.ts (the volatile Config schema pattern),
Documentation/Archive/Live-Containers/LIVE-CONTAINERS-RESEARCH.md sections 3-5 (the v1 shape,
the ledger strings, the block kinds).

DELIVERABLES:
1. Source/Variable/Config.ts - the v1 schema of research section 3, every
	knob volatile except kind-changing fields.
2. Source/Function/Apply.ts - the entry: fail-loud validation, the factory
	State build with the volatile mappings, the durable activation proof,
	and TWO listeners: (a) `system-prompt/assemble` (waterfall, next()
	first, append ONE section named `live-containers` whose body is every
	enabled block rendered inside the LIVE CONTAINER frame; TTL cache when
	refresh = "ttl"; fail-open try/catch, a render failure skips the block
	and logs), (b) `tools/post-execute` (emit/plain: update the counters the
	gauge blocks read - last-tool timestamp, per-turn attempt counts) plus
	an `agent/pre-step` listener that resets per-turn counters on a user
	message (the tool-coach precedent, Apply.ts:456-490).
3. Source/Function/Render.ts - the substitution engine: {{token}} replace
	ONLY (no eval, no expressions), the block kinds time/counter/manifest/
	gauge/note/template, the variable table, the frame.
4. Source/Function/Counters.ts - the per-agent state (WeakMap on the Agent
	object, the tool-coach pattern) and the gauge formulas.
5. The block-kind table with the ledger strings of research section 3,
	byte-exact, `live-containers: ` prefix, one log per module
	(~/.dsh/live-containers.log).
6. package.json + cordis.patch.yml mirroring the tool-coach's (enabled by
	config only; the profile wiring is NOT part of this spec - the plugin
	must ship DISABLED, the IDLE-forever posture).

ARBITER: the family smoke suite (A2's deliverable) must pass; the ledger
strings must match SCHEME.md byte-exactly; no other package may be modified.

REPORT FORMAT: one message - the file tree created, per-file one-line
summary, the exact ledger strings shipped, the smoke results (pass/fail
counts), and any deviation from the research doc with a one-line reason.

DISCIPLINES: never run git commands; never write through the tool API beyond
your own package's files; ASCII only; tabs only; no builds, no dev server,
no test runs beyond what the smoke harness itself performs when the
orchestrator runs it; never enable the plugin in the profile.
LIVE-CONTAINERS A1 SPEC RETAINED - IDLE

---

### SPEC A2 - the smoke/harness writer

ROLE: write the smoke suite for hook-dsh-live-containers following the
family's fake-ctx + real-factory harness pattern.

SURFACE: ONLY `Classic/packages/hook-dsh-live-containers/Target/Smoke/`
(+ the package's smoke runner wiring, mirroring the tool-coach's suite
layout: R-series render tests + D-series discipline tests, 129 checks in the
tool-coach's suite as the size reference).

DELIVERABLES:
1. The fake-ctx harness that mounts the plugin with the real factory State
	builder and drives `system-prompt/assemble` twice with different
	assemble contexts, asserting: the section appears exactly once, its name
	is `live-containers`, the body contains the LIVE CONTAINER frame, and a
	time block's rendered value CHANGES between two assemblies whose clock
	advances (inject a fake clock - do not sleep).
2. The volatile-flip tests: flip `enabled` and a per-block `enabled` through
	the volatile cell (`{ get }` reference) and assert the next assembly
	respects the flip without a remount (the P10 pattern).
3. The byte-identity tests: every ledger string asserted against its exact
	expected bytes; a render failure asserts the fail-open pass-through (the
	assembly still resolves, the block is skipped, the ledger gains
	`render failed <id> -> skipped`).
4. The TTL tests: refresh "ttl" with ttlCalls=2 renders once and reuses the
	cache on the second assembly; refresh "request" re-renders.
5. The vacuously-green guard: every test asserts on the rendered SECTION
	text or ledger lines (never on "no throw"); at least one negative test
	per block kind (bad template token -> skipped block, not a broken
	assembly).

ARBITER: the suite must be runnable by the orchestrator with the family's
standard smoke command (mirror the tool-coach's smoke wiring); all green is
the acceptance condition; A1's code is the system under test - report bugs,
do not patch A1's files.

REPORT FORMAT: one message - the test inventory (ids + one-line purpose),
the pass/fail counts, and the list of any A1 bugs found with the minimal
reproducer.

DISCIPLINES: never run git commands; ASCII only; tabs only; never write
outside your smoke directory; never enable the plugin in the profile; no
real network, no real clock dependence.
LIVE-CONTAINERS A2 SPEC RETAINED - IDLE

---

### SPEC A3 - the docs + site writer

ROLE: write the user-facing documentation for live containers.

SURFACE: ONLY `Classic/packages/hook-dsh-live-containers/README.md`,
`Classic/packages/hook-dsh-live-containers/SCHEME.md`, and the site's
live-containers page/section (mirror where the tool-coach's docs live in the
site tree; locate it by reading the tool-coach's site file paths, then
create the sibling). Nothing else.

DELIVERABLES:
1. README.md - the package README in the family voice (the tool-coach
	README is the style reference): what live containers are (the
	dynamic-recompute idea in one paragraph), the block catalog of research
	section 4 as a table (shape / trigger / knobs), the install line, the
	"every knob is volatile" note, the ledger strings list, the KV-cache
	honesty paragraph (a per-request-changing block invalidates prefix
	reuse from its first changed token; prefer TTL for always-differing
	blocks).
2. SCHEME.md - the full config surface (every field, type, default,
	volatile-or-not), the ledger-string contract (byte-exact list), the
	smoke battery map (R/D ids from A2's inventory - placeholders marked
	"per A2's final inventory" if written before A2 finishes), and the
	programmable-stage section copied from research section 5 (clearly
	labeled FUTURE - not in v1).
3. The site page - the family site's live-containers entry: the one-screen
	pitch, the block catalog, the safety framing (the LIVE CONTAINER frame
	is the plugin's own output, never harness state), and the status line
	"planned - not yet in the profile" (the IDLE-forever posture stated
	plainly).

ARBITER: family doc conventions (tab-indented markdown code, ASCII only,
the ledger strings must match A1's SCHEME exactly); a mismatch with A1's
shipped strings is a defect to report, not to paper over.

REPORT FORMAT: one message - the files written, the section outline of
each, and any mismatch found between the docs and A1's actual config or
ledger strings.

DISCIPLINES: never run git commands; never write through the tool API outside
the three surfaces above; ASCII only; tabs only; no builds; never enable the
plugin in the profile.
LIVE-CONTAINERS A3 SPEC RETAINED - IDLE

---

## 7. The residuals + the open questions

1. **No in-body seam.** The true "block inside the conversation body,
	recomputed per request" does not exist as a plugin seam: the loop's
	`deriveMessages()` is internal and message identities are deep-frozen
	(dsh-agent-loop README). v1 lives in the system prompt / dynamic-context
	seams. A harness-side proposal would be a `live/message` content-block
	type that the LOOP renders at derive time - future work, upstream.
2. **KV-cache cost.** Every-request-changing blocks rewrite the prompt tail
	and lose prefix reuse from the first changed token (dsh-system-prompt
	README). Mitigation shipped in v1: the TTL refresh + the in-history
	append when the route declares `systemPromptUpdate: 'in-history'`.
3. **Counter sources.** v1 counts what the plugin itself observes
	(agent/pre-step, tools/post-execute). Exact token counts are NOT
	available to plugins (the loop does not expose usage to listeners in the
	verified docs) - the gauge blocks report approximations and say so.
4. **Variable collision.** `{{token}}` substitution must not collide with
	the harness's own prompt variables (dsh-system-prompt resolves
	`{{name}}` too and FAILS assembly on unresolved references). v1 must
	use `interpolate: false` on its section (the documented escape hatch)
	so only the plugin's own engine touches its tokens. Verified in the
	dsh-system-prompt README ("No inline escape syntax" limitation).
5. **The IDLE-forever posture** (the user's mandate): the plugin ships
	DISABLED, never appears in the profile's bundles, enables only by an
	explicit ACTIVATE. Every spec above restates it; the activation proof
	logs `disabled (enabled=false)` on a cold mount.
6. **Open questions for the ACTIVATE round:** (a) does a `live_container_set`
	tool (for LLM-programmed state) belong in v1 or the programmable stage;
	(b) the exact TTL default per block kind; (c) whether the dynamic-context
	(user-role snapshot) variant is v1 or v1.1 - it is the closest thing to
	an in-conversation block and costs one design pass against the harness's
	context refresh rules.
