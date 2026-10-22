// Ring - the per-agent state (the tool-coach precedent): a WeakMap keyed on
// the Agent object holding the doc paths touched since the last user
// message, the cooldown counters, the dedupe set and the per-turn note
// count. Reset on `agent/pre-step` when a user message enters the step.
export interface RingState {
	/** The doc paths touched since the last user message (already-touched companions are dropped from later notes). */
	touched: Set<string>;
	/** The family ids that emitted within the cooldown window (id → age in judged calls). */
	cooled: Map<string, number>;
	/** The dedupe keys already noted this turn. */
	cooledNoted: Set<string>;
	/** Notes emitted this turn. */
	notes: number;
	/** Judged calls since the last user message (the turn counter). */
	calls: number;
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
 * call without an agent shares the module's default key, so doc calls are
 * still tracked and noted.
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
		/** Record one judged (named) doc path. */
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
		/** The per-turn reset: touched paths, cooldowns, dedupe, counters. */
		Reset: (State: RingState): void => {
			State.touched.clear();
			State.cooled.clear();
			State.cooledNoted.clear();
			State.notes = 0;
			State.calls = 0;
		},
	};
};
