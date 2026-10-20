# SEAM MAP - verified machinery vs gaps (the design agent's work list)

All anchors verified first-hand this wave (2026-10-19) unless marked
"inherited" (verified in the v1 research and re-cited).

## 1. What EXISTS today

| # | Machinery | Anchor (verified) | Wave-2 consumers |
|---|---|---|---|
| E1 | tools/pre-execute waterfall, authoritative decisions, deny with reason text | Classic/packages/hook-dsh-tool-coach/Source/Function/Apply.ts:395-445 (deny at :435) | CAN-1 interception; CAN-4 silent modification |
| E2 | tools/post-execute waterfall, content replacement `{kind:'accept',content:[...]}`, prepend, fail-open | Classic/packages/hook-dsh-ccr/Source/Function/Apply.ts:204-269 | CAN-1 counters; CAN-3 sinceLastTool; CAN-4 triggers |
| E3 | system-prompt/assemble waterfall, append-only sections | hook-dsh-tool-coach/Source/Function/Apply.ts:499-556 | CAN-2 parent boards; CAN-3 all templates; CAN-5 suggestion section |
| E4 | agent/pre-step waterfall, user-message detection, payload {agent,messages,turn,step,signal} | hook-dsh-tool-coach Apply.ts:456-490 (detection :464-467); ccr Apply.ts:271-284 (pure observer posture) | CAN-3 resets; CAN-4 triggers; CAN-5 suggester trigger |
| E5 | ctx.jobs in-process registry: start() preflight, per-owner admission (maxConcurrentJobsPerOwner=10), bounded rings (262144/16384), first-wins settle, one settled event, ScopedLayers, owner teardown cancels | @deepseek-ai/dsh-jobs-local README (asar: dsh/node_modules/@deepseek-ai/dsh-jobs-local/README.md) | CAN-1 detach; CAN-2 child truth; CAN-5 detached suggester |
| E6 | job_output/job_list/job_kill tools; completion notices: busy-agent next-step injection, idle-agent wake turn, maxConsecutiveWakes; awaited settlement detection | @deepseek-ai/dsh-tool-jobs README (same tree) | CAN-1 completion append; CAN-6.7 schedule |
| E7 | subagent answers as job results ("a subagent's answer"); session timing records visible in GUI | dsh-tool-jobs + dsh-jobs-local READMEs | CAN-2 boards; CAN-8 dashboard idea |
| E8 | factory jobs controller attach (P1 effect, attachController(name)) | Classic/packages/plugin-dsh-factory/SCHEME.md:259-261 | all job-using listeners |
| E9 | factory detached contained continuation (Continue/Refresh/Inflight, logger-only errors) | SCHEME.md:185-223 | CAN-6.4 governor/pinner status precedent |
| E10 | volatile Schemastery cells; State builder unwraps `{ get }` | normalize-dash Config.ts:22-92 (inherited); SCHEME.md:225-240 | every hot knob |
| E11 | per-call `{"__normalize":false` first-key marker | normalize-dash Normalize.ts:41-67 (inherited) | the per-call control precedent (pattern only) |
| E12 | agent-loop turn/step flow: inbox projection + `agent/inbox/spliced` normalized event; deep-frozen derived messages; agent/request waterfall; one start/end per attempt | dsh-agent-loop README (asar: dsh/node_modules/@deepseek-ai/dsh-agent-loop/README.md, "Turn and step flow") | CAN-2 report pickup design; the in-body seam boundary |
| E13 | Aphrodite live-container fast path + CCR marker `<<<CCR:hash|type|size>>>`, result-side transform | Aphrodite docs/research/2026-10-19-hermes-aphrodite-research.md:120-146 | CAN-1 origin; CAN-6.5 composition |
| E14 | dsh-ptc-runtime-node (sandboxed TS) for the programmable stage | v1 research section 5 (inherited) | CAN-6.10 |
| E15 | prompt variables + dynamic contexts + `refreshContext()` per request | dsh-system-prompt README (inherited) | CAN-3 variable table |

## 2. What is MISSING (the gap list for the DESIGN agent)

- **G1 (CAN-1, highest priority)**: the synthetic-result decision in
	tools/pre-execute. The verified decision shapes are pass and deny-with-
	reason; whether a deny reason renders to the model as a tool RESULT (and
	with which isError value) is unverified. Design task: confirm the
	deny-reason rendering, or define the transform as an accept-with-content
	if the schema allows it. This single decision shapes CAN-1's carrier.
- **G2 (CAN-1)**: the producer re-dispatch - starting a ctx.jobs producer
	that re-executes the exact intercepted tool call (bash command with its
	cwd/env/policy) instead of an arbitrary function. Likely a thin wrapper
	around the bash tool's own execution path; needs a design pass against
	dsh-bash-local / dsh-subprocess-local.
- **G3 (CAN-1)**: the completion-block composer + standing-section renderer
	+ withdrawal after delivery (the append-then-remove lifecycle).
- **G4 (CAN-1)**: the policy engine (modes, long-running heuristics, dedup,
	admission guards) with per-agent observation history.
- **G5 (CAN-2)**: the live_plant tool + auto-enrollment + the report
	pickup listener keyed on the inbox/agent events (the exact event for
	child->parent message delivery needs a design pass against the
	agent-loop inbox projection, E12).
- **G6 (CAN-2)**: the board renderer with stalled/failed/overflow rows and
	the close/withdraw lifecycle.
- **G7 (CAN-3)**: the catalog data + the kind registry + the substitution
	engine (v1 SPEC A1's Render.ts carried forward) + the
	live_container_set tool.
- **G8 (CAN-4)**: the trigger engine (thresholds/budgets/meta-budget), the
	channel selector, hang detection from ring offsets, section-collapse.
- **G9 (CAN-5)**: the suggester job runner (detached one-shot subagent),
	the prompt composer (request + catalog + facts), the delivery state,
	the auto-plant path, the privacy knob.
- **G10 (CAN-6 ideas)**: chain splitting (6.1), cross-agent dedup (6.2),
	coach-live notes (6.3), schedule-on-settle (6.7), the events sidecar
	(6.8), cross-conversation pins (6.9). All marked FUTURE - the design
	agent should sequence only 6.3 and 6.8 as cheap near-term additions.
- **G11 (cross-cutting)**: the ledger-string contract for the new plugin
	(byte-exact list per SCHEME) and the smoke battery (the family pattern:
	fake-ctx + real-factory, R/D series).

## 3. The sequencing recommendation (for the DESIGN agent)

1. G1 first (it gates CAN-1's shape).
2. G2, G4, G3 -> CAN-1 end-to-end with mode "long-running".
3. G7 -> CAN-3 (independent of CAN-1; ships first in a real schedule).
4. E3-based standing section from day one (the templates need no jobs).
5. G5, G6 -> CAN-2 after CAN-1 (boards consume job settle events).
6. G8 -> CAN-4 after CAN-2 (stall detection reuses board state).
7. G9 -> CAN-5 last (it suggests what 1-4 make possible).
8. The v1 research's A1/A2/A3 specs remain valid for the assemble-side
	plugin; wave 2 extends the same package rather than forking a second one
	(one plugin, two feature halves: templates + live execution).

## 4. The open questions carried forward

1. G1's decision shape (above).
2. Does the idle-agent wake turn count as a "user-visible" event for
	CAN-4's channel model? (It is model-visible; the user sees the wake in
	the GUI - classify as channel 4, and document.)
3. Withdrawal vs KV-cache: confirm that removing a standing section block
	after delivery is acceptable prompt-tail churn per settlement (01
	section 8 takes the position that honesty beats cache).
4. Whether the suggester's verbatim prompt forwarding needs an explicit
	user consent surface beyond the config flag (05 section on privacy
	takes the position: the SCHEME disclosure plus a default of redact for
	any non-local route).

## 5. BINDING CONSTRAINTS (appended by the I1 requirement-guard agent, 2026-10-19 - HARD requirements for the DESIGN agent; they scope the gaps above without rewriting them)

### 5.1 THE COMMAND-ONLY DETACH RULE (hard)

The detach transform (G2/G4) applies ONLY to command-executing tools
(`bash`, `pwsh`, and the command-runner family: `cargo`, `npm`, `pnpm`,
`make`, ...). The content-mutating tools - `write`, `edit`, `raw-write`,
`normalize-file` - NEVER detach in any mode, because the fs/observed
governance chain (governors/pinner/normalize family) fires synchronously
on tool-layer writes; a detached write races that chain and silently
breaks the pin/govern discipline. Consequences for the gap list:

- G4's policy engine must treat the mutation family as permanently
	non-detachable (rejected even under `all` and `selected`); `all`'s
	"EVERY tool call" wording in 01 section 5 is bounded by this rule.
- G2's producer re-dispatch is therefore ONLY ever a command-runner
	wrapper (bash-family execution path) - this NARROWS G2: no design pass
	is needed for re-dispatching arbitrary tools.
- Read-only observation tools may be detachable under `selected` only
	(01 section 12.1); they are out of the default detach set.

### 5.2 THE SANDBOX + FAIL-OPEN RULE (hard)

1. Detached commands run under the SAME sandbox + deadlines + output caps
	as the ptc/inline runtime: G2's producer must go through the governed
	bash execution path (sandbox unmodified); `liveTimeoutMs` must be <=
	the inline deadline for the tool family; the job ring caps are the
	output caps (2 KiB tail max in any rendered block). Detachment never
	buys weaker isolation or more runtime.
2. The transform listener is FAIL-OPEN: it never throws into the
	tools/pre-execute waterfall (the CCR/tool-coach precedent, E1/E2);
	on any internal error it returns pass-through, kills any half-started
	job (`marker-failed`), and ledgers `transform failed <tool> -> inline`.
3. The "still running" marker is the failure fallback: no completion
	block is ever rendered without an observed `settled` event; markers
	that outlive their registry render `status: lost` (01 section 9.10).

Sequencing note: 5.1 narrows G2 (design cost down), and 5.2's fail-open
clause makes 01 section 7's first bullet acceptance-testable (01 section
12.2 acceptance additions). No other gap in section 2 is re-scoped.
