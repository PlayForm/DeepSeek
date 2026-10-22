// Compile - the presentation compiler (BATCH-STATE-PLUGIN.md section 7.1):
// pure, deterministic functions over the state. Every block the agents
// receive is a COMPILED OUTPUT - the LLM's only role is to READ it and act;
// the batch state is never described ad-hoc by any agent. The blocks are
// bounded (the compact TOC + the scope + the pending - never the histories;
// plan section 3 item 5).
//
//   State(State)    -> the full snapshot (getState);
//   Context(State, agent) -> the dynamic table-of-contents block (getContext);
//   Scope(State, agent)   -> the compiled scope view (getScope);
//   Else(State, agent)    -> the "you are never alone" block (whoElse).
import type Member from "@Interface/Member.js";
import type Scope from "@Interface/Scope.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";

/** The surfaces another lane owns exclusively - the OFF-LIMITS list for one
 *  agent. A surface the agent shares with the owner is NOT off-limits (it
 *  is a shared overlap, reported by Scope). */
export const Off = (State: State, Agent: string): string[] => {
	const Mine = State.Members.get(Agent)?.scope ?? [];
	const Taken: string[] = [];
	for (const One of State.Members.values()) {
		switch (true) {
			case One.id === Agent:
				continue;
		}
		for (const Surface of One.scope) {
			switch (true) {
				case Mine.includes(Surface):
				case Taken.includes(Surface):
					continue;
			}
			Taken.push(Surface);
		}
	}
	return Taken;
};

/** The running members, queue order first (a non-queued member sorts by
 *  its activation timestamp). */
export const Running = (State: State): Member[] => {
	const Members = [...State.Members.values()].filter((One) => One.status === "active");
	return Members.sort((Left, Right) => {
		const L = Left.queue >= 0 ? Left.queue : Number.MAX_SAFE_INTEGER;
		const R = Right.queue >= 0 ? Right.queue : Number.MAX_SAFE_INTEGER;
		return L !== R ? L - R : Left.startedAt - Right.startedAt;
	});
};

/** The idle members, in queue order. */
export const Idle = (State: State): Member[] =>
	State.IdleQueue.map((Id) => State.Members.get(Id)).filter(
		(One): One is Member => One !== undefined,
	);

/** The full snapshot (getState). */
export const Snapshot = (State: State): Snapshot => ({
	batch: State.Batch,
	generatedAt: Date.now(),
	running: Running(State),
	idle: Idle(State),
	recent: [...State.Recent],
});

/** The compiled scope view for one agent (getScope): the file-ownership
 *  matrix derived at call time - pre-baked conflict avoidance, never
 *  negotiated (plan section 7.2 item 1). */
export const Scope = (State: State, Agent: string): Scope => {
	const Mine = State.Members.get(Agent)?.scope ?? [];
	const Shared: Record<string, string[]> = {};
	for (const One of State.Members.values()) {
		switch (true) {
			case One.id === Agent:
				continue;
		}
		const Overlap = One.scope.filter((Surface) => Mine.includes(Surface));
		switch (true) {
			case Overlap.length > 0:
				Shared[One.id] = Overlap;
				break;
			default:
		}
	}
	return { yours: [...Mine], shared: Shared, offLimits: Off(State, Agent) };
};

/** The compiled dynamic context block for one agent (getContext): the
 *  table of contents + the scope reminders + the pending list - what gets
 *  spliced (plan section 2.2). READ-ONLY for the agents: the block is the
 *  injected context, clearly delimited, never their own content. */
export const Context = (State: State, Agent: string): string => {
	const Lines = [`[BATCH STATE - ${State.Batch} - live]`];
	const Running0 = Running(State);
	Lines.push(`RUNNING: ${Running0.length} lanes`);
	for (const One of Running0) {
		Lines.push(
			`  ${One.id} ${One.task || "(no task reported)"} - OWNER: ${
				One.scope.join(", ") || "(none)"
			}`,
		);
	}
	const Idle0 = Idle(State);
	Lines.push(
		`IDLE: ${Idle0.length}${
			Idle0.length > 0 ? ` (${Idle0.map((One) => One.id).join(", ")})` : ""
		}`,
	);
	const Mine = State.Members.get(Agent);
	switch (true) {
		case Mine !== undefined:
			Lines.push(
				`YOUR SCOPE: ${Mine.scope.join(", ") || "(none)"} - OFF-LIMITS: ${
					Off(State, Agent).join(", ") || "(none)"
				}`,
			);
			break;
		default:
			Lines.push(`YOUR SCOPE: unknown agent "${Agent}"`);
	}
	Lines.push(`PENDING: ${State.IdleQueue.join(", ") || "(none)"}`);
	return Lines.join("\n");
};

/** The concurrent lanes' CURRENT activities for one agent (whoElse): the
 *  "you are never alone" block (plan section 2.1). */
export const Else = (State: State, Agent: string): string => {
	const Lines = ["[CONCURRENT LANES - live]"];
	for (const One of Running(State)) {
		switch (true) {
			case One.id === Agent:
				continue;
		}
		Lines.push(`  ${One.id} ${One.task || "(no task reported)"}`);
	}
	return Lines.length === 1 ? `${Lines[0]}\n  (none)` : Lines.join("\n");
};
