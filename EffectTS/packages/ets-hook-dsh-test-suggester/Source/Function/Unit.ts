/**
 * @module Unit
 *
 * The session-projection unit itself: the per-session touch history as a PURE
 * fold over the committed `tool/call` events of one session.
 *
 * @remarks
 * THE FRAMEWORK DRIVES, THE DOMAIN COMPUTES: the registry subscribes to
 * `session/event` once and passes every committed event through `apply`, so
 * this module holds no subscription, no timer and no WeakMap - the same
 * computation the retired `session/event` fold performed, moved onto the seam
 * that actually receives the log. The drive reaches events the old fold never
 * saw: a resumed session's inherited prefix, a call whose post-execute never
 * ran, a call another plugin canceled.
 *
 * THE TWO LOAD-BEARING LAWS:
 *
 *   - PURITY. `apply` never mutates `state`: an event the unit ignores
 *     (`tool/result`, `turn/start`, a `tool/call` whose arguments name no
 *     path) returns the SAME reference, which is what tells the registry that
 *     nothing downstream changed. A folding event returns a NEW state object,
 *     because the registry compares by `Object.is` and the persisted cache
 *     clones the value.
 *   - PLAIN JSON. The state is `{ Seq, Touches }` of numbers and strings - the
 *     persisted-cache precondition - and `init` returns a FRESH array per
 *     session, never a shared one.
 *
 * The fold reuses the pack library's `Fold`, so the touch derivation (the
 * first path-shaped argument, `file_path` then `path` then `filePath`,
 * backslashes normalized to slashes, a leading `./` stripped) is byte-for-byte
 * the one the package always used, and the current call's own touch is
 * already in the state when `tools/post-execute` runs: the harness commits
 * `tool/call` as the call's STARTED record (recovery names a durable
 * `tool/call` with no result `TOOL_OUTCOME_UNKNOWN`), before dispatch, so the
 * anchor's prior touches are present without any post-execute append.
 */
import type {
	ProjectionUnit,
	SessionEvent,
	SessionHistory,
	StateSchema,
} from "@Interface/Projection.js";
import { Fold, type Touch } from "@playform/ets-lib-dsh-pack";
import { ProjectionCap, ProjectionKey, ProjectionVersion } from "@Variable/Projection.js";

/**
 * A non-negative integer, or the fallback (a corrupt persisted row).
 */
const Count = (Value: unknown, Fallback: number): number =>
	typeof Value === "number" && Number.isFinite(Value) && Value >= 0
		? Math.floor(Value)
		: Fallback;

/**
 * One persisted touch, or undefined when the row cannot be one. The cache row
 * is owner-written plain JSON, but an older build or a hand-edited file must
 * never crash the read path: an unusable touch is dropped, never thrown.
 */
const Restore = (Value: unknown): Touch | undefined => {
	if (Value === null || typeof Value !== "object") {
		return undefined;
	}
	const Row = Value as { seq?: unknown; path?: unknown; tool?: unknown };
	if (typeof Row.path !== "string" || Row.path.length === 0) {
		return undefined;
	}
	if (typeof Row.seq !== "number" || !Number.isFinite(Row.seq) || Row.seq < 0) {
		return undefined;
	}
	return {
		seq: Math.floor(Row.seq),
		path: Row.path,
		tool: typeof Row.tool === "string" ? Row.tool : "",
	};
};

/**
 * The persisted-state validator: the registry calls `parse` when it seeds a
 * fold from a cached row. It SANITIZES rather than throws - the hook is
 * fail-open by law, and a throw here would escape into the registry's read
 * path for the whole session - so a damaged row degrades to a shorter history
 * instead of a failed read.
 */
const Schema: StateSchema<SessionHistory> = {
	parse(Value: unknown): SessionHistory {
		const Row = (Value ?? {}) as { Seq?: unknown; Touches?: unknown };
		const Touches = Array.isArray(Row.Touches)
			? Row.Touches.map(Restore).filter((Entry): Entry is Touch => Entry !== undefined)
			: [];
		return {
			Seq: Count(Row.Seq, 0),
			Touches: Touches.slice(Math.max(0, Touches.length - ProjectionCap)),
		};
	},
};

/**
 * The pure transition: one committed event in, the next state out. Every
 * non-`tool/call` event and every call that names no path returns the state
 * reference UNCHANGED (the registry's zero-work signal); a folded call returns
 * a new `{ Seq, Touches }` with the touch appended and the cap enforced by
 * shifting the oldest out - exactly the retired fold's arithmetic, so the
 * sequence numbers (and therefore `Adjacent`'s distance scoring) are
 * unchanged.
 */
const Apply = (State: SessionHistory, Event: SessionEvent): SessionHistory => {
	if (Event?.type !== "tool/call") {
		return State;
	}
	const Data = Event.data;
	if (!Data || typeof Data !== "object") {
		return State;
	}
	const Touch = Fold(
		{
			type: "tool/call",
			name: typeof Data.name === "string" ? Data.name : "",
			arguments: Data.arguments,
		},
		State.Seq,
	);
	if (Touch === undefined) {
		return State;
	}
	const Touches = [...State.Touches, Touch];
	if (Touches.length > ProjectionCap) {
		Touches.splice(0, Touches.length - ProjectionCap);
	}
	return { Seq: State.Seq + 1, Touches };
};

/**
 * The unit: host-only (no `wire` block), versioned, and pure.
 */
const Unit: ProjectionUnit<SessionHistory> = {
	key: ProjectionKey,
	stateSchema: Schema,
	init: (): SessionHistory => ({ Seq: 0, Touches: [] }),
	apply: Apply,
	stateVersion: ProjectionVersion,
};

export default Unit;
