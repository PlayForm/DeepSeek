import type { Touch } from "@playform/ets-lib-dsh-pack";

/**
 * @module Projection
 *
 * Declares the structural view of the harness's session-projection seam the hook folds
 * the session history through.
 *
 * @remarks
 *
 * The STRUCTURAL view of the harness's session-projection seam (`ctx.sessionProjections`,
 * the `SessionProjectionRegistry` of `@deepseek-ai/dsh-session-projection`), the seam the
 * edit suggester folds the session history through. The types are structural on purpose:
 * the projection package is NOT a dependency of this hook (no runtime import, no type
 * import), so the seam is described here by the faces the hook consumes, verified against
 * the installed harness source and the subsystem guide:
 *
 * - `register(definition)` - "Register one domain's unit on the calling context's fiber
 *   ... Callers must await registration before publishing consumers" (the generated
 *   service surface of the installed build);
 * - `stateOf(session, key)` - "reads one unit's live read-only host state without
 *   computing unrelated views" (the same surface, and the face every shipped consumer
 *   uses, e.g. `ctx.sessionProjections.stateOf(session, "turnBoundary")`).
 *
 * THE UNIT CONTRACT (the subsystem guide's `ProjectionDefinition`): `apply(state, event)`
 * is "Pure transition: previous state + one committed event -> next state. A unit
 * uninterested in an event MUST return the same state reference - an unchanged reference
 * (`Object.is`) produces zero downstream work." `state` MUST be plain JSON (the
 * persisted-cache precondition), and `stateSchema` "Validates persisted state before it
 * seeds a fold" - the registry reads it through `parse` only
 * (`def.stateSchema.parse(row.val)` in the installed source), which is why `StateSchema`
 * below is the one-face structural stand-in rather than a zod type this package cannot
 * import.
 *
 * THE DRIVE (the installed service description): "The service subscribes to
 * `session/event` once; every committed event passes every registered unit's `apply`
 * (eager drive) ... Cells build lazily - a unit registered after events flowed, or a
 * session older than the registry, folds `init` over the in-memory log on first touch
 * (event or read)." The suggester therefore owns NO subscription: it registers the unit
 * and reads the per-session cell.
 *
 * THE VERSION SKEW, AND WHY THE READ GOES THROUGH THE REGISTRY: the installed build's
 * `register(definition)` is a plain method whose README calls the result a disposer,
 * while the current source's generated surface types it `Promise<ProjectionHandle<S>>`
 * (a handle with `stateOf(session)`, `readerFor(session)`, `dispose()`). The hook only
 * AWAITS the result and discards it, so both generations work, and it reads state through
 * `registry.stateOf(session, key)` - a face both generations serve and the one every
 * shipped consumer uses. A handle-based read would break on the installed build, where
 * `register` returns a function, not a handle.
 */
/**
 * The unit's host state: one session's touch history, the SAME shape the retired
 * `session/event` listener fold kept in `State.History` (the sequence number of the next
 * touch and the touches, oldest first, capped at 512). Host-only: the unit declares no
 * `wire` block, so no client ever reads it.
 */
export interface SessionHistory {
	/**
	 * The next touch's sequence number.
	 */
	Seq: number;

	/**
	 * The folded touches, oldest first.
	 */
	Touches: Touch[];
}

/**
 * One committed session event, as the registry hands it to `apply`. Only the
 * `tool/call` records matter here: their payload is `{ turn, step, callId, name,
 * arguments }` with `arguments` the RAW JSON STRING the model emitted (the pack
 * library's `Fold` parses it defensively), while `seq` is the session-log position the
 * registry itself uses.
 */
export interface SessionEvent {
	/**
	 * The event kind (`tool/call`, `tool/result`, `turn/start`, ...).
	 */
	readonly type?: string;

	/**
	 * The committed log position.
	 */
	readonly seq?: number;

	/**
	 * The event payload.
	 */
	readonly data?: {
		readonly name?: unknown;
		readonly arguments?: unknown;
	};
}

/**
 * The persisted-state validator, structurally: the registry calls `parse` when it seeds
 * a fold from a cached row, and nothing else.
 */
export interface StateSchema<S> {
	parse(Value: unknown): S;
}

/**
 * One domain's fold unit, structurally (the guide's `ProjectionDefinition` minus the
 * optional `wire` block this host-only unit omits).
 */
export interface ProjectionUnit<S> {
	/**
	 * The projection key this unit owns.
	 */
	readonly key: string;

	/**
	 * Validates persisted state before it seeds a fold.
	 */
	readonly stateSchema: StateSchema<S>;

	/**
	 * State for the empty log and its immutable Session metadata.
	 */
	init(header: unknown, inheritedEventCount: unknown): S;

	/**
	 * Pure transition: previous state + one committed event -> next state.
	 */
	apply(state: S, event: SessionEvent): S;

	/**
	 * Persisted-cache invalidation version.
	 */
	readonly stateVersion: number;
}

/**
 * The registry faces the hook consumes.
 */
export interface ProjectionRegistry {
	/**
	 * Install one unit on the calling context's fiber.
	 */
	register(unit: ProjectionUnit<SessionHistory>): unknown;

	/**
	 * Read one unit's live read-only host state for one session.
	 */
	stateOf(session: unknown, key: string): SessionHistory | undefined;
}

/**
 * The child context `ctx.inject` hands the registration callback: the service is a legal
 * property there because the injection declared it.
 */
export interface ProjectionChild {
	readonly sessionProjections: ProjectionRegistry;
}

/**
 * The optional-registration face of the plugin context (cordis `inject`).
 */
export interface InjectingContext {
	inject?(dependencies: string[], callback: (child: ProjectionChild) => unknown): unknown;
}

/**
 * The optional-read face of the plugin context (cordis `get`): "Read a service from the
 * store without the inject requirement." The hook does NOT declare `sessionProjections`
 * in its `inject` array - a mount without the registry must still load - so the service
 * is probed here, never read as `ctx.sessionProjections` (a property read requires the
 * inject declaration).
 */
export interface ProbingContext {
	get?(name: string): unknown;
}
