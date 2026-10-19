# LIVE CONTAINERS - WAVE 2 - Requirements Overview

Date: 2026-10-19
Status: requirements only (the durable spec for the DESIGN agent and the
CODER agent; written by the wave-2 research agent).
Base: Documentation/Plans/LIVE-CONTAINERS-RESEARCH.md (the v1 research: the
system-prompt/assemble seam, the KV-cache honesty, the ptc-runtime
programmable stage, the 14 block types, the 3-agent specs). Wave 2 EXTENDS
that idea and never contradicts its verified seams.

---

## 1. The user's CANs (his words, faithful, organized into six clusters)

- CAN-1 - LIVE TOOL-CALL BLOCKS: "when an LLM calls cargo build or executes
	multiple commands, the backend automatically transforms this into a
	live-container call: propagate back - don't tell the LLM yet - modify the
	whole chain as if the tool call had already executed and completed - append
	a live marker at the end: 'this command's output is still running, you can
	proceed reasoning' - return that to the LLM - the conversation progresses
	while the build runs in the background - when it completes, append a block
	(or fill the same one) showing how it executed." The generalization the
	user drew from it: EVERY tool call becomes programmable, non-awaited,
	live - the LLM achieves micro-interaction without realizing it, is
	surprised at the end, schedules more, does more with less (one planned
	tool call dispatches many).
- CAN-2 - PLANTED LIVE BLOCKS: "a child subagent can have a PLANTED live
	block in the parent's conversation - a TODO list that fills in dynamically
	without the parent awaiting the full chain; a plantType live block
	programmed with how many agents are active - all 5 report their progress
	into the one block; multi-step, multi-level macro coordination."
- CAN-3 - THE TEMPLATE HOST: "the plugin ships a host of block
	templates/placeholders the user can use out of the box."
- CAN-4 - TASK-BASED FAILSAFES: "on the basis of task - not even notifying
	the conversation or the user - most tasks require live-block-ability as
	failsafes in different scenarios, like the tool-coach, fully modify the
	harness's behavior automatically."
- CAN-5 - THE MINI-CONVERSATION SUGGESTER: "when the user makes a request
	('implement feature X'), a side mini-conversation with a much smaller
	model infers from the idea + the templates whether a live block fits the
	request, and suggests to the main conversation: 'hey, you can use this
	live block (like a shared TODO list) or something else to achieve this'."
- CAN-6 - BETTER IDEAS: the user's explicit ask - "let me know if you have
	better ideas for this."

## 2. The origin (Aphrodite)

The cargo-block idea comes from the Aphrodite/Hermes work. The verified
origin text is Aphrodite's own research note,
~/Developer/Application/PlayForm/Aphrodite/docs/research/
2026-10-19-hermes-aphrodite-research.md:120-146: a long cargo build flows
through the CCR result transform (transform_tool_result_inner, hooks.rs:317-426)
with a live-container fast path at :370-380 and the
`<<<CCR:hash|type|size>>>` marker at the end. That is a RESULT-side
transform: the build still blocks the turn, and the marker replaces the
finished output. The user's wave-2 CAN-1 goes one step further: the CALL
itself becomes non-awaited - the marker appears BEFORE the build has
finished, and the completion report arrives later as a live append.

## 3. The Hermes delegate/poll mapping

Hermes precedent the user named: "what Hermes already has with DELEGATE POLL
PROCESSES (fire-and-forget calls)". In this harness the mapping is exact:

| Hermes idea | DSH machinery (verified) |
|---|---|
| fire-and-forget job | ctx.jobs.start() - @deepseek-ai/dsh-jobs-local (in-process registry, per-owner admission, output rings) |
| poll | job_output(job_id, wait?, timeout_ms?) - @deepseek-ai/dsh-tool-jobs |
| list/kill | job_list() / job_kill(job_id, reason?) - dsh-tool-jobs |
| completion report | the completion notice: busy agents get it injected into the next step; idle agents are woken with a follow-up turn; maxConsecutiveWakes caps the self-exciting chain |

The v1 research hosted live blocks in the system-prompt/assemble seam.
Wave 2 moves the center of gravity to the TOOL side: the assemble seam
remains for standing blocks (templates, CAN-3), but CAN-1 and CAN-2 live on
the jobs subsystem + the tools waterfall + completion notices.

## 4. The requirement-file index

| File | CAN | One line |
|---|---|---|
| 01-LIVE-TOOL-CALL-BLOCKS.md | CAN-1 | The per-tool-call transform to a detached live job + the still-running marker + the completion append |
| 02-PLANTED-BLOCKS.md | CAN-2 | Parent-side live blocks that children report into; multi-level coordination |
| 03-BLOCK-TEMPLATES.md | CAN-3 | The template host + the out-of-the-box catalog (12+ templates) |
| 04-TASK-FAILSAFES.md | CAN-4 | Automatic, task-based, silent behavior modification (the tool-coach posture) |
| 05-MINI-CONVERSATION-SUGGESTER.md | CAN-5 | A small-model side conversation that suggests live blocks for the main task |
| 06-BETTER-IDEAS.md | CAN-6 | Our own extensions and better ideas |
| 07-SEAM-MAP.md | all | What exists today (verified anchors) vs what is missing |

## 5. The shared non-negotiables (inherited from the family)

1. Never throw into a waterfall listener: next() FIRST, fail-open try/catch
	(hook-dsh-ccr Apply.ts:207, 257-266; hook-dsh-tool-coach Apply.ts:402,
	437-445).
2. Ledger strings byte-exact, one log per module, prefix per the plugin's
	name (the family ledger contract).
3. Volatile Schemastery cells for hot-editable knobs (the normalize-dash
	Config.ts pattern; the factory State builder unwraps `{ get }` cells).
4. The IDLE-forever posture: ship DISABLED, enable only by explicit
	ACTIVATE (the v1 research's residual 5).
5. The LIVE CONTAINER frame stays the plugin's own output - never
	impersonate harness state.
6. KV-cache honesty: anything that rewrites the prompt tail loses provider
	prefix reuse from its first changed token; append-only notices and
	stable-until-event blocks are preferred (v1 research section 2-3).
7. THE COMMAND-ONLY DETACH RULE (I1, binding - 01 section 12.1, 07
	section 5.1): the live transform detaches ONLY command-executing
	tools (bash, pwsh, cargo, npm, the command runners); content-mutating
	tools (write, edit, raw-write, normalize-file) NEVER detach - the
	fs/observed governance chain fires synchronously on tool-layer writes
	and a detached write would race it, silently breaking pin/govern.
8. THE SANDBOX + FAIL-OPEN RULE (I1, binding - 01 section 12.2, 07
	section 5.2): detached commands run under the same sandbox/deadlines/
	output-caps as the ptc runtime; the transform listener is fail-open
	(never throws into the tools waterfall - the CCR/tool-coach
	precedent); the "still running" marker is the failure fallback and no
	completion is fabricated without an observed settle.
