# CAN-2 - PLANTED LIVE BLOCKS (multi-level coordination)

## 1. The requirement statement (the user's intent, faithful)

A child subagent can have a PLANTED live block in the PARENT's conversation -
a TODO list that fills in dynamically without the parent awaiting the full
chain. A plantType live block programmed with how many agents are active -
all 5 report their progress into the one block. Multi-step, multi-level macro
coordination.

## 2. The verified machinery this rides on

- **The parent-child channel**: subagent results are delivered as
	`send_message` reports to the parent; the harness's own parent-side
	controls (interrupt_agent, send_message) work on running or idle children.
	Inside the harness runtime, `ctx.agents` is the delivery surface
	(dsh-tool-jobs README: "completion notices resolve their destination
	through ctx.agents").
- **The parent's block channel**: the v1 system-prompt/assemble section
	(hook-dsh-tool-coach/Source/Function/Apply.ts:499-556) - a standing block
	recomputed per request; the plugin appends ONE section and nothing else.
- **The child's job channel**: a child subagent started as a background job
	is itself a job in ctx.jobs (the dsh-jobs-local contract covers subagent
	jobs - job_output's "final-output jobs return their result" is exactly a
	subagent answer; "a subagent's answer" is named as the result in the
	tool-jobs README).
- **The per-agent scoping**: dsh-jobs-local's ScopedLayers - controllers and
	scoped subscriptions file into the calling context's scope; `{ owner }`
	subscriptions are unscoped; a preset's controls do not hold another
	agent's `start()` open.

## 3. The plantType block grammar (severe extension)

A planted block is a standing assemble-section block whose STATE is fed by
reports from child agents. Grammar (the config + the tool surface):

```
plant:
	id: string (stable label; the block's key)
	plantType: "agent-board" | "todo-fill" | "aggregate" | "custom"
	template: string (the rendered body; {{token}} variables)
	expectAgents: number (the programmed count; 5 in the user's example)
	memberIds: string[] (optional explicit agent ids; else auto-enrolled)
	aggregate: "count" | "mean" | "list" | "max" | "none"
	state (runtime, plugin-owned):
		members: { agentId: { status, lastReport, lastReportAt, done } }
		closedAt / openedAt
```

Rendered shape (byte-exact candidate):

```
--- LIVE PLANT <id> (agent-board; expect <n>) ---
[done]      worker-1 - step 3/3 - finished 12s
[running]   worker-2 - step 2/3 - last: "editing Apply.ts" (4s ago)
[running]   worker-3 - step 1/3 - last: "reading SCHEME.md" (9s ago)
[stalled]   worker-4 - no report for 47s
[none]      slot-5 - no agent enrolled
total: 1 done / 2 running / 1 stalled / 1 empty
--- END LIVE PLANT <id> ---
```

`todo-fill` variant: the block is the parent's TODO list; each child's report
carries a `todo` line that marks one list item's state (the todo items are
the block's slots, not the agents).

`aggregate` variant: a single computed line from all members (e.g.
`files changed: 17 | tests: 3 failing`), recomputed per report.

## 4. The progress-reporting channel (how 5 agents report into one block)

- **Enrollment**: when the parent dispatches children whose results are meant
	for one planted block, the plugin (or the parent's tool call
	`live_plant(id, plantType, expectAgents)`) creates the block and binds the
	agent ids. Auto-enroll: any child whose dispatch the plugin observes
	(through ctx.agents or the jobs registry's owner-relative records) while a
	board is open and slots are free gets the next slot.
- **Reports**: three carriers, in priority order:
	1. the child's job COMPLETION (settle event) - sets status done/error,
		aggregates the answer's summary (first line of the result, capped);
	2. the child's job PROGRESS line - dsh-jobs-local carries a live progress
		line in the snapshot (`status with the live progress line`); the board
		mirrors it verbatim (capped);
	3. explicit reports - a child that knows about the board reports through
		its own send_message to the parent; the parent-side plugin listener
		picks the report up and updates the member's lastReport. This is the
		highest-fidelity carrier and the one that makes "all 5 report their
		progress into the one block" literal.
- **No report for `stallMs` (default 45000)**: the member's row flips to
	`[stalled]` - the block itself surfaces the stalled member without any
	model noticing and asking (a CAN-4-adjacent property).

## 5. The parent-side update mechanics

- The block lives in the parent's assemble section and is RECOMPUTED at each
	parent request (the v1 seam) - a report that lands between requests shows
	up at the parent's next ask-time automatically; no push into history
	needed.
- OPTIONAL push (v1.1): when the LAST member settles, the plugin also lets
	the stock completion notice path inform the parent (the board closing is a
	job settlement for the parent's own aggregate job) so the parent is woken
	to consume the finished board rather than discovering it stale.
- Multi-level: a grandchild reporting to a child's own planted block composes
	exactly the same way one level down; the child's board is in the CHILD's
	section, and the child's completion summary is the one line the parent's
	board shows. Multi-level coordination therefore composes by recursion -
	nothing special is needed beyond per-agent scoping (ScopedLayers keeps the
	levels apart).

## 6. The TODO-list fills (the user's first example)

- The parent creates `plantType: "todo-fill"` with 5 items; each child is
	dispatched with its item name; as children report item-done, the block's
	checkbox fills: `[x] item-2 - by worker-2 (12s)`.
- Without the parent awaiting: the parent continues its own reasoning while
	the board fills - the exact CAN-2 property.
- On board close (all members settled), the block renders
	`board closed: 5/5 done in 41s` for one more request, then withdraws (the
	CAN-1 withdrawal discipline).

## 7. The failures

- **An agent dies** (child cancelled/errored): the settle event with cause
	kill or the error status marks the row `[failed] <reason>`; the board
	never shows a phantom running agent because the board's truth source is
	settlement, not hope.
- **The count mismatch** (more children than slots): extra children get
	`overflow` rows marked `[unboarded]` and their completions are still
	counted in the total line - the board degrades gracefully instead of
	lying.
	(fewer children than expectAgents): the empty slots render `[none]` -
	honest about the gap; after `closeMs` (default 300000) empty slots are
	dropped and the board closes.
- **The parent dies**: the board is the parent's per-agent state (WeakMap on
	the Agent object, the tool-coach pattern) - it dies with the parent; no
	orphan boards.
- **Report flooding**: a per-member report-rate cap (default 1 report per 2s
	counted; later reports coalesce into the last) so 5 chatty agents cannot
	spin the recompute; the ring-style coalescing mirrors dsh-jobs-local's
	retention discipline.
- **Name collisions**: plant ids are per-agent-keyed (`agentId/plantId`) -
	two agents may run identically named boards.

## 8. The seam map

- EXISTS: assemble standing section (parent-side rendering); jobs registry
	settle/progress (child truth source); ctx.agents delivery (report
	resolution); scoped layers (multi-level separation); per-agent WeakMap
	state (the tool-coach Apply.ts Agent() pattern).
- MISSING: (a) the plant tool (`live_plant`) + the enrollment logic; (b) the
	report-pickup listener (parent-side message observation - must be designed
	against the agent-loop inbox projection; the inbox mutation event
	`agent/inbox/spliced` is the fold point, verified in the dsh-agent-loop
	README); (c) the board renderer + close/withdraw; (d) cross-level summary
	composition.

## 9. The acceptance criteria

1. A parent with `expectAgents: 5` board sees five rows; a child settling
	flips its row to done with an elapsed time at the parent's next request.
2. An explicit child report updates the parent's board at the next request
	without any parent tool call about it.
3. A stalled member (no report past stallMs) renders `[stalled]` without any
	model action.
4. A dead child renders `[failed]` with the reason; the count never lies.
5. Multi-level: a child with its own board shows its board in its own
	section; the parent's board shows only the child's completion line.
6. Board close withdraws the block after one closing request; ledger strings
	byte-exact; no throw into the assemble waterfall ever.
