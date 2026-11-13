/**
 * @module Ring
 *
 * The suggester ring: the per-agent cooldown and dedupe machine the suggester
 * hooks share.
 *
 * @remarks
 *
 * The ring is the per-agent state machine behind the suggester family: a WeakMap
 * keyed on the Agent object (one shared default key when a call carries no agent)
 * holding which families are cooling, which dedupe keys were already noted this
 * turn, how many notes and calls the agent has, and the open note the
 * follow-through watches.
 *
 * The window is the caller's per call, and it is counted in judged calls, never
 * in time: no timers, no clock, deterministic. Every judged call ages the
 * cooling families by one (`Tick`) and an emitted note opens a window (`Open`);
 * every judged call either FOLLOWS it - the call path names one of the
 * companions the note named, through the caller's own predicate - or AGES it by
 * one call, and a window that reaches its limit untouched closes as a soft
 * REJECT (`Age`). The per-turn reset (`Reset`) forgets an open note without a
 * verdict, so a reset never invents an outcome.
 *
 * The state and the companion predicate are the caller's: the factory takes the
 * state's own `Fresh` factory and the `Match` predicate (does this judged path
 * name that companion?), typed through the caller's state, and returns the eight
 * methods (`State`, `Touch`, `Tick`, `Mark`, `Open`, `Follow`, `Age`, `Reset`).
 * The caller's vocabulary - the family ids, the dedupe keys, the pending shape -
 * stays in the package.
 *
 * Pure: no I/O, no clock, no timers.
 */

/**
 * One open note awaiting its follow-through verdict (the caller's own pending
 * shape, read structurally).
 */
interface OpenNote {
	/**
	 * The family that emitted.
	 */
	family: string;

	/**
	 * The companion paths the note named.
	 */
	companions: string[];

	/**
	 * Judged calls since the emit (the window's position).
	 */
	since: number;
}

/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the factory's default key, so calls are still
 * tracked and noted.
 */
export default <
	S extends {
		/**
		 * The paths touched since the last user message.
		 */
		touched: Set<string>;

		/**
		 * The family ids that emitted within the cooldown window (id -> age in
		 * judged calls).
		 */
		cooled: Map<string, number>;

		/**
		 * The dedupe keys already noted this turn.
		 */
		cooledNoted: Set<string>;

		/**
		 * Notes emitted this turn.
		 */
		notes: number;

		/**
		 * Judged calls since the last user message (the turn counter).
		 */
		calls: number;

		/**
		 * The open note the follow-through watches, in the caller's own shape.
		 */
		pending?: unknown;
	},
>(
	/**
	 * The caller's fresh-state factory.
	 */
	Fresh: () => S,

	/**
	 * The caller's companion predicate: does the judged path name the companion?
	 */
	Match: (Path: string, Companion: string) => boolean,
) => {
	const Agents = new WeakMap<object, S>();
	const DefaultKey: object = {};
	return {
		/**
		 * Get (or create) the state for an agent key.
		 */
		State: (Key: unknown): S => {
			const Object_ = (Key as object) ?? DefaultKey;
			let State = Agents.get(Object_);
			if (!State) {
				State = Fresh();
				Agents.set(Object_, State);
			}
			return State;
		},
		/**
		 * Record one judged (edited) path.
		 */
		Touch: (State: S, Path: string): void => {
			State.touched.add(Path);
			State.calls += 1;
		},
		/**
		 * Age the cooldown counters by one judged call, dropping expired entries.
		 */
		Tick: (State: S, Window: number): void => {
			for (const [Family, Age] of State.cooled) {
				if (Age + 1 > Window) {
					State.cooled.delete(Family);
				} else {
					State.cooled.set(Family, Age + 1);
				}
			}
		},
		/**
		 * Mark an emit: the family cools, the dedupe key is kept, the counter moves.
		 */
		Mark: (State: S, Family: string, Key: string): void => {
			State.cooled.set(Family, 0);
			State.cooledNoted.add(Key);
			State.notes += 1;
		},
		/**
		 * Open the follow-through window for the note just emitted.
		 */
		Open: (State: S, Family: string, Companions: string[]): void => {
			State.pending = { family: Family, companions: [...Companions], since: 0 };
		},
		/**
		 * The follow signal: the call names a companion of the open note.
		 */
		Follow: (
			State: S,
			Path: string,
		): { family: string; companions: string[]; companion: string } | undefined => {
			const Pending_ = State.pending as OpenNote | undefined;
			switch (true) {
				case Pending_ === undefined:
					return undefined;
				default:
					break;
			}
			const Companion = Pending_.companions.find((One) => Match(Path, One));
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
		/**
		 * Age the open note by one judged call; the closed note is returned.
		 */
		Age: (State: S, Window: number): { family: string; companions: string[] } | undefined => {
			const Pending_ = State.pending as OpenNote | undefined;
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
		/**
		 * The per-turn reset: touched paths, cooldowns, dedupe, counters, the open note.
		 */
		Reset: (State: S): void => {
			State.touched.clear();
			State.cooled.clear();
			State.cooledNoted.clear();
			State.notes = 0;
			State.calls = 0;
			State.pending = undefined;
		},
	};
};
