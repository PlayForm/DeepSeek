# APPEND-SEAM (I3) - the completion-append seam, independently resolved

Status: RATIFICATION addendum for D2's IMPLEMENTATION-DESIGN.md section 3.3.
Where this file conflicts with D2's 3.3, THIS FILE WINS for the C2 dispatch
(the CONFLICT TABLE at the end). All anchors verified first-hand 2026-10-19
against the asar READMEs, read in place from
/Applications/DeepSeek Harness.app/Contents/Resources/app.asar/dsh/.
ASCII + tabs throughout.

## 0. The one-paragraph decision

The completion block is NOT appended as a hand-written session log event and
NOT delivered through the stock notice path. It is a REGISTERED DYNAMIC
CONTEXT contribution (`ctx.systemPrompt.context(...)`) whose text the plugin
flips from the completed frame to empty exactly once per settlement; the
agent loop turns a present, non-empty context into a SOURCED USER-ROLE
SNAPSHOT appended to model history (dsh-system-prompt README: "contexts
become sourced user-role snapshots in model history under the loop"), and an
absent context produces NO event at all - so the withdrawal after delivery is
free (absence, not a rewrite). The standing section keeps only the running
frames and the out-of-order caveat line. On prompt-capable routes the
secondary carrier (the section itself) is an in-history APPEND, not a tail
rewrite; on incapable routes a section change is a node-0 consolidation and
loses the WHOLE prefix - a cost D2's "honesty beats cache" position
understated and that this carrier choice avoids entirely.

## 1. The verified machinery (the anchors)

1.1 The stock notice path is NOT composable (D2 verified; re-confirmed):
dsh-tool-jobs README "Completion notices" - the notice string
`background job <id> (<kind>: <label>) finished [status: ...]. Read its
output with job_output.` is fixed; the plugin decides only the LANE
(wakeup turn on an idle owner, or injection into a busy owner's next-step
inbox). No hook exists for sibling notice text. REJECTED as the carrier;
retained as the wake mechanism that covers the idle-agent gap.

1.2 The direct session-log append path is CLOSED to plugins:
dsh-session README - surface events (`user/message`, `system/message`,
...) are validated, projected, and owned by the loop ("the loop is the
production acquisition point for session write handles");
`appendPluginRecord` is forbidden to plugins and records "never enter the
model-visible surface" anyway. A plugin cannot hand-append a message event.
REJECTED.

1.3 The REAL conversation-append surfaces the loop itself exposes:
	(a) system/message surface nodes: the rendered prompt reaches the model
		as a system-role message - "surface node 0, or the latest system
		node after an in-history update" (dsh-system-prompt README). Route
		dependent admission (dsh-agent-loop README): without
		`systemPromptUpdate`, a non-empty prompt change consolidates at the
		first system node through logged per-node replacements - cache miss
		from the first changed token (node 0 = the WHOLE prefix). With
		`systemPromptUpdate: 'in-history'`, "the agent loop appends a
		non-empty changed prompt after the cached history inside a
		continuing request series, so the prefix through that history stays
		reusable"; retained in-history nodes stay model-visible until a
		later consolidation.
	(b) dynamic contexts: "Ordered dynamic contexts are separate from
		sections and become sourced user-role snapshots only when present"
		(dsh-system-prompt README). A context that is present and
		non-empty at admission time becomes a user-role message appended
		to history; ordinary history growth "is append-only and preserves
		reusable entries" (dsh-agent-loop README). An absent/empty context
		contributes nothing and logs nothing - withdrawal by absence.

1.4 The plugin-accessible registration: `ctx.systemPrompt.context({...})`
	with an order, optional/required flag, and a provider read "again
	before admission" (dsh-system-prompt README "refreshes registered
	runtime facts after pre-step and route preparation"). `refreshContext`
	"preserves accepted sections ... contributed only by the assembly
	waterfall" - our contribution must be a REGISTERED context, not a
	waterfall-mutated one, to ride the refresh path.

## 2. The mechanism (the decision)

2.1 Registration (phase 2, at plugin attach, per agent scope):

	ctx.systemPrompt.context({
		name: 'live-containers-completion',
		order: <getContextOrder allocation>,	// after the standing section
		required: false,			// optional: suppressible, absent when empty
		provider: () => pendingFrameText()	// see 2.3
	})

2.2 Delivery: on the L6 settled subscription (D2 section 3.6), if the owner
	agent is gone -> ledger `owner gone <job-id>`, nothing renders (the
	tool-jobs skip contract, mirrored). Otherwise the plugin formats the
	COMPLETED FRAME (D2 section 4.2 bytes, wrapped per 2.5) into the
	per-agent pending slot. The loop reads the provider before the next
	admission; the frame becomes ONE sourced user-role snapshot appended
	after the cached history. The stock notice (1.1) still runs on its own
	lane: it wakes an idle owner so a request actually happens, or rides
	the busy step the owner is already paying for. `awaited` settlements
	(job settled by a live job_output wait) need no wake - the model is
	active and the next attempt renders the frame.

2.3 The emit-at-most-once discipline (the self-deduplication trick): the
	provider returns the pending frame text exactly while the frame is
	pending, and the plugin CLEARS the slot when the frame is durably
	rendered - observed as the session event whose user message carries
	the context snapshot (a session/event observer keyed on the job id),
	NOT on provider read. Consume-on-read is WRONG: a read followed by a
	rejected decision or an aborted attempt (the loop commits "neither"
	the pending prompt nor the users) would strand the frame silently.
	Consume-on-logged-snapshot makes the frame re-deliver on the next
	attempt if an attempt dies, and makes the batched form natural: N
	jobs settling between two attempts produce ONE pending text carrying
	N frames -> ONE snapshot. After clearing, ledger
	`withdrawn <job-id> (completed)`.

2.4 Withdrawal: there is NO withdrawal event. The context goes empty, the
	next requests carry no snapshot, and the DELIVERED snapshot remains
	in history permanently - which is correct: the completion record is
	exactly the durable "this is how the command executed" fact 01
	section 3 step 6 wanted, and it survives compaction rules like any
	user-role message. The KV-cache penalty D2 accepted per settlement
	does not exist on this carrier.

2.5 The wrapper line (the one grammar addition): a bare user-role snapshot
	reads as a user instruction, so the pending text is wrapped with ONE
	line above D2's 4.2 block, byte-exact:

	[live] completion report (harness-appended; not a user request):

	then the 4.2 block verbatim, then the 4.2 resume-hint line verbatim.
	See section 5 for the full candidate.

2.6 The standing section stays (E3, D2 section 3.1) and shrinks in scope:
	it carries the running frames, the fleet line, and the caveat line
	`--- LIVE CONTAINERS (background tasks; completions may arrive out of
	order) ---`. It no longer carries completed frames; its text changes
	only when jobs START (and at fleet drain), so the section is
	stable-until-start - fewer prompt events than D2's design, which also
	changed the section at settle/withdraw.

2.7 What happens on routes without in-history admission: the section
	changes (a job started) trigger node-0 consolidation = full-prefix
	miss per start. This is a cost of the RUNNING surface, not of the
	completion carrier, and it is disclosed in the SCHEME (residual R3).

## 3. The KV-cache + conversation-order consequences

3.1 Completion delivery: append-only user-role snapshot AFTER the cached
	history - the reusable prefix through the entire history is preserved;
	the marginal cache cost is the frame's own bytes. No replacement, no
	projection, no contentGeneration bump (context snapshots are ordinary
	history growth, not surface replacements).

3.2 Withdrawal: zero cache cost, zero events. The delivered snapshot stays;
	no "honesty beats cache" tail rewrite exists on this carrier. The 01
	section 8 position is thereby SATISFIED more cheaply than it argued.

3.3 The running section on in-history routes: every section text change
	(start of a job, fleet drain) appends the FULL new rendered prompt as
	a new system node after the history - the per-change cost is the whole
	prompt text, not the delta, and old states remain visible until
	consolidation. This is a cost D2's 11.1(a) did not count. It bounds
	fine for long-running-detach (starts are rare); documented in the
	SCHEME, not worked around.

3.4 On incapable routes the same section change is a node-0 rewrite:
	full-prefix miss per start. The SCHEME must state that detach is
	cache-cheapest on in-history-capable routes and costs one full miss
	per job start otherwise.

3.5 Conversation order: the completion snapshot appears in history AFTER
	whatever user/assistant turns precede the next attempt - the model can
	see a completion for a job whose tool call it issued turns ago, and
	snapshots for several jobs merge into one message in settle order
	(first-wins order), not tool-call order. The standing caveat line
	discloses this (unchanged from D2). Timestamps inside the frame make
	the ordering reconstructible.

3.6 Honesty: the frame is never rendered without an observed `settled`
	event; a marker surviving a restart without a live registry renders
	`status: lost (process exit)` in the standing section (01 section
	9.10, mirrored); a pending frame lost to a process exit renders
	nothing (the ledger record is the truth) - the stock notice is equally
	gone, and the model's world model degrades to the lost marker line.

## 4. Fallback carrier (if the context semantics fail C2's verification)

If verification of the dynamic-context admission shows anything other than
"present non-empty context -> one sourced user-role snapshot, absent ->
nothing" (for example a snapshot per request while present, or no snapshot
route for plugin-registered optional contexts), the fallback is the STANDING
SECTION carrier exactly as D2 section 3.3 defines it, amended by this
file's section 3 cache corrections: delivery at the next assembly,
withdrawal by section edit, with the withdrawal's cache cost stated as
"node-0 full miss on incapable routes, in-history append on capable
routes". The pending-frame/consume-on-commit discipline of 2.3 carries over
unchanged (clear after the assemble that rendered the frame is observable
via the next waterfall pass, ledgered identically).

## 5. The byte-exact candidate shape of the pending text

Per job (wrapped frame; N jobs merge into one pending text, frames in
settle order, blank-line separated, one wrapper line per pending text):

	[live] completion report (harness-appended; not a user request):
	--- LIVE CONTAINER <job-id> completed ---
	status: <status> (<cause>: producer|kill|teardown)
	elapsed: <n>s
	output (tail up to 2 KiB):
	<tail; stderr in a [stderr] section exactly as job_output does>
	[stderr]
	<stderr tail>
	--- END LIVE CONTAINER <job-id> ---
	[live] job_output <job-id> to read the full output.

Everything below the wrapper line is D2 section 4.2 verbatim (ratified);
failure variant `status: error`, kill variant `status: killed` with the
kill reason. Total pending text cap: 2 KiB per frame plus the wrapper,
bounded by the producer ring tail (07 section 5.2 clause 1). ASCII only.

## 6. RESIDUALS

	R1 (C2 must verify): the exact admission semantics of plugin-
	registered optional dynamic contexts - one snapshot per change vs per
	request while present, and whether the snapshot's user message is
	observable in the session log with a stable shape the 2.3 observer can
	match (dsh-session README says contexts "become sourced user-role
	snapshots"; the event shape itself is unverified). Fallback = section 4.
	R2: whether `refreshContext` reads optional suppressed contexts (a
	scoped `suppressRuntimeContext()` suppressor would hide the frame
	silently). Rule: if suppressed, the frame stays pending and re-renders
	when suppression lifts - never dropped, only delayed; ledger nothing.
	R3: the SCHEME must carry the two cache-cost statements (3.3/3.4) and
	the wrapper line in the ledger-string contract list.
	R4: the exact `getContextOrder` allocation for the completion context
	and the standing section (one `getSectionOrder` + one `getContextOrder`
	call at attach; collision with a future first-party order is a re-run
	cost, not a correctness cost).
	R5: consume-on-logged-snapshot depends on session/event observation
	reaching the plugin's subscription scope for the owner's session (the
	jobs-local `{ owner }` layering precedent suggests yes; unverified).

## 7. CONFLICT TABLE (this file vs D2 section 3.3 vs the winner)

| # | Point | D2 3.3 | I3 (this file) | Winner + reason |
|---|---|---|---|---|
| 1 | Carrier | completed frame rendered in the STANDING SECTION at the next assembly | registered DYNAMIC CONTEXT -> sourced user-role snapshot appended to history | I3: the context carrier is the verified true append path (1.3b) and makes withdrawal free (2.4) |
| 2 | Withdrawal cost | withdrawal "rewrites the prompt tail ONCE per settlement" - honesty beats cache | NO withdrawal event at all; absence; delivered snapshot stays in history | I3: verified absence semantics (1.3b, 2.4); the honesty position is satisfied without the penalty |
| 3 | Cache model of section changes | section is "stable-until-event ... changes exactly twice per job"; tail-rewrite framing | on in-history routes each section change APPENDS the full prompt (cost = whole prompt, old states retained); on incapable routes it is a node-0 FULL-prefix miss | I3: verified against agent-loop/system-prompt READMEs; D2 understated the incapable-route cost and missed the retained-nodes cost |
| 4 | Emit-once discipline | "rendered at most once" by post-render withdrawal in the section | consume-on-LOGGED-SNAPSHOT (2.3): clear on the session event, never on read; aborted attempts re-deliver | I3: consume-on-read/read-side clearing can strand a frame on a rejected/aborted attempt (1.4/2.3 reasoning) |
| 5 | Block bytes | 4.2 block + resume hint | 4.2 block + resume hint VERBATIM, plus one wrapper line above the block (2.5) | D2 bytes stand; I3 adds the wrapper only because the carrier is user-role - one-line delta, listed in R3 |
| 6 | Idle-agent coverage | implicit (settled subscription renders at next assembly) | explicit split of duties: stock notice keeps the wake lane (2.2); the context carrier needs a request to exist | I3: makes the wake dependency explicit so `completionDelivery: quiet` sessions are documented as frame-delayed until the next user turn |
| 7 | Not-composable notice, batched merge, owner-gone skip, lost markers | asserted | re-verified and ADOPTED unchanged | agreement (no conflict) |
