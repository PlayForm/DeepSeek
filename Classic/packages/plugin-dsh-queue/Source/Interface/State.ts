// State - the per-apply plugin state: the FACTORY's shared shape (built by
// Factory.State(ctx, config, { ... })) extended with the queue's own fields.
// Every config-derived field is volatile in the schema, so the factory's P10
// loader/volatile-update listener refreshes them in place.

import type Dispatcher from "@Function/Dispatcher.js";
import type Factory from "@playform/plugin-dsh-factory";
import type { Allowlist, State as Shared } from "@playform/plugin-dsh-factory";

import type Task from "./Task.js";

export default interface State extends Shared {
	/** Master switch (config `enabled`, volatile) - false = full passthrough. */
	On: boolean;
	/** The capacity model (config `capacity`, volatile): main pool / child cap. */
	Capacity: { main: number; child: number };
	/** Whether a freed slot triggers an automatic dispatch (volatile). */
	AutoDispatch: boolean;
	/** Whether the dispatch consults the routing enforcer (volatile). */
	RoutedDispatch: boolean;
	/** Whether an assignment actually starts a subagent through the harness's
	 * `ctx.subagents` service (config `autoSpawn`, volatile; the approval
	 * posture - shipped false). */
	AutoSpawn: boolean;
	/** The harness subagent provider the spawn selects by name (config
	 * `spawnProvider`, volatile). */
	SpawnProvider: string;
	/** The per-action allowlist (config `policy`, volatile) - the D6 OUTER
	 * gate in front of `AutoSpawn`. Named `Allow` because the factory's shared
	 * State already owns `Policy` (the configured global policy file path);
	 * `spawn` defaults to `approve`, so an assignment waits for the user. */
	Allow: Allowlist;
	/** The injected factory service itself (the ledger + the journal) - set
	 * once in Apply. */
	Factory: Factory;
	/** The queue store: insertion-ordered by enqueue sequence (the FIFO
	 * tiebreaker is the Map's insertion order). */
	Tasks: Map<string, Task>;
	/** The monotonic counters: the id sequence and the enqueue sequence. */
	Seq: number;
	/** The seat bookkeeping: active (dispatched or running) tasks per agent
	 * id; the key `main` is the main conversation's pool. */
	Seats: Map<string, number>;
	/** The in-flight spawn round-trips (`startActivation`'s promise) - the
	 * `Flush()` join point for the tests and the reconcile; never a hot-path
	 * wait. A live child's own result is NOT joined here (a caller that wants
	 * the task settled watches the task, not the queue). */
	Spawns: Set<Promise<void>>;
	/** task id -> the spawn's abort controller, so Interrupt cancels the
	 * child instead of only the bookkeeping. */
	Controllers: Map<string, AbortController>;
	/** The registered service itself, set once in Apply (the tools read the
	 * queue through it). */
	DshQueue?: Dispatcher | undefined;
}
