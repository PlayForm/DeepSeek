// Ring - the per-agent state (the tool-coach precedent): a WeakMap keyed on
// the Agent object holding the paths touched since the last user message,
// the cooldown counters, the dedupe set, the per-turn note count, and the
// OPEN NOTE the follow-through watches (completion spec 03-SUGGESTERS
// section 2: "watch the next judged calls within a window").
//
// THE OPEN NOTE (the outcome signal): an emitted note opens a window with the
// family and the companion paths it named; every judged in-workspace call
// either FOLLOWS it (the call path names a companion - an ACCEPT) or AGES it
// by one call. The window is counted in calls, never in time: no timers, no
// clock, deterministic. A window that reaches the config's `learnWindow`
// untouched closes as a soft REJECT. The per-turn reset forgets an open note
// without a verdict (the turn boundary is not a judged call), so a reset
// never invents an outcome.
import Match from "./Match.js";

/** One open note awaiting its follow-through verdict. */
export interface Pending {
	/** The family that emitted. */
	family: string;
	/** The companion paths the note named. */
	companions: string[];
	/** Judged calls since the emit (the window's position). */
	since: number;
}

export interface RingState {
	/** The paths touched since the last user message (already-touched companions are dropped from later notes). */
	touched: Set<string>;
	/** The family ids that emitted within the cooldown window (id → age in judged calls). */
	cooled: Map<string, number>;
	/** The dedupe keys already noted this turn. */
	cooledNoted: Set<string>;
	/** Notes emitted this turn. */
	notes: number;
	/** Judged calls since the last user message (the turn counter). */
	calls: number;
	/** The open note the follow-through watches (undefined when none). */
	pending?: Pending | undefined;
}

/** Create a fresh per-agent state. */
export const Fresh = (): RingState => ({
	touched: new Set(),
	cooled: new Map(),
	cooledNoted: new Set(),
	notes: 0,
	calls: 0,
});

/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so edits are still
 * tracked and noted.
 */
export default () => {
	const Agents = new WeakMap<object, RingState>();
	const DefaultKey: object = {};
	return {
		/** Get (or create) the state for an agent key. */
		State: (Key: unknown): RingState => {
			const Object_ = (Key as object) ?? DefaultKey;
			let State = Agents.get(Object_);
			if (!State) {
				State = Fresh();
				Agents.set(Object_, State);
			}
			return State;
		},
		/** Record one judged (edited) path. */
		Touch: (State: RingState, Path: string): void => {
			State.touched.add(Path);
			State.calls += 1;
		},
		/** Age the cooldown counters by one judged call, dropping expired entries. */
		Tick: (State: RingState, Window: number): void => {
			for (const [Family, Age] of State.cooled) {
				if (Age + 1 > Window) {
					State.cooled.delete(Family);
				} else {
					State.cooled.set(Family, Age + 1);
				}
			}
		},
		/** Mark an emit: the family cools, the dedupe key is kept, the counter moves. */
		Mark: (State: RingState, Family: string, Key: string): void => {
			State.cooled.set(Family, 0);
			State.cooledNoted.add(Key);
			State.notes += 1;
		},
		/** Open the follow-through window for the note just emitted. */
		Open: (State: RingState, Family: string, Companions: string[]): void => {
			State.pending = { family: Family, companions: [...Companions], since: 0 };
		},
		/** The follow signal: the call names a companion of the open note. */
		Follow: (
			State: RingState,
			Path: string,
		): { family: string; companions: string[]; companion: string } | undefined => {
			const Pending_ = State.pending;
			switch (true) {
				case Pending_ === undefined:
					return undefined;
				default:
					break;
			}
			const Companion = Pending_.companions.find((One) => Match(One, Path));
			switch (true) {
				case Companion === undefined:
					return undefined;
				default:
					break;
			}
			State.pending = undefined;
			return {
				family: Pending_.family,
				companions: Pending_.companions,
				companion: Companion as string,
			};
		},
		/** Age the open note by one judged call; the closed note is returned. */
		Age: (
			State: RingState,
			Window: number,
		): { family: string; companions: string[] } | undefined => {
			const Pending_ = State.pending;
			switch (true) {
				case Pending_ === undefined:
					return undefined;
				default:
					break;
			}
			Pending_.since += 1;
			switch (true) {
				case Pending_.since < Window:
					return undefined;
				default:
					break;
			}
			State.pending = undefined;
			return { family: Pending_.family, companions: Pending_.companions };
		},
		/** The per-turn reset: touched paths, cooldowns, dedupe, counters, the open note. */
		Reset: (State: RingState): void => {
			State.touched.clear();
			State.cooled.clear();
			State.cooledNoted.clear();
			State.notes = 0;
			State.calls = 0;
			State.pending = undefined;
		},
	};
};
