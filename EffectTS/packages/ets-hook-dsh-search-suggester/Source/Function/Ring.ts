// Ring - the per-agent state (the tool-coach precedent): a WeakMap keyed on
// the Agent object holding the last 8 tool calls (name + classified text +
// path), the intent ids they produced, the cooldown counters, the dedupe set
// and the per-turn note count. Reset on `agent/pre-step` when a user message
// enters the step (the per-turn boundary of plan section 4.2).
import type { CallView } from "../Interface/Execution.js";

/** One ring entry: the call view plus the intent id the classifier produced. */
export interface Entry {
	/** The call view. */
	call: CallView;
	/** The intent id, or "" when the call produced no detection. */
	intent: string;
	/** Whether the call was a write/edit (it clears the loop credit). */
	edit: boolean;
}

/** The per-agent ring state. */
export interface RingState {
	/** The last calls, oldest first, capped at 8. */
	entries: Entry[];
	/** The intents that emitted within the cooldown window. */
	cooled: Map<string, number>;
	/** The dedupe keys already noted this turn. */
	cooledNoted: Set<string>;
	/** The candidate paths suggested within the cooldown window. */
	recent: Map<string, number>;
	/** Notes emitted this turn. */
	notes: number;
	/** Judged calls since the last user message (the turn counter). */
	calls: number;
	/** The current step's user text, lowercased (the R12 context input). */
	userText: string;
	/** The open note awaiting its learning verdict (plan 6.2). */
	pending?: { intent: string; since: number } | undefined;
	/** The sticky section's cached text and build call (the second surface). */
	sectionText?: string | undefined;
	sectionBuilt?: number | undefined;
}

/** The ring capacity (plan section 4.3: the last 8 tool calls). */
const Capacity = 8;

/** Create a fresh per-agent state. */
export const Fresh = (): RingState => ({
	entries: [],
	cooled: new Map(),
	cooledNoted: new Set(),
	recent: new Map(),
	notes: 0,
	calls: 0,
	userText: "",
});

/**
 * The per-agent ring: one WeakMap per Apply, keyed on the Agent object. A
 * call without an agent shares the module's default key, so calls are still
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
		/** Record one judged call and its intent (or ""). */
		Push: (State: RingState, Call: CallView, Intent: string, Edit: boolean): void => {
			State.entries.push({ call: Call, intent: Intent, edit: Edit });
			if (State.entries.length > Capacity) {
				State.entries.shift();
			}
			State.calls += 1;
		},
		/** The recent intent ids, oldest first (an edit entry contributes "edit" so the loop credit dilutes). */
		Intents: (State: RingState): string[] =>
			State.entries.map((Entry) => (Entry.edit ? "edit" : Entry.intent)),
		/** Age the cooldown counters by one judged call, dropping expired entries. */
		Tick: (State: RingState, Window: number): void => {
			for (const [Intent, Age] of State.cooled) {
				if (Age + 1 > Window) {
					State.cooled.delete(Intent);
				} else {
					State.cooled.set(Intent, Age + 1);
				}
			}
			for (const [Path, Age] of State.recent) {
				if (Age + 1 > Window) {
					State.recent.delete(Path);
				} else {
					State.recent.set(Path, Age + 1);
				}
			}
		},
		/** Mark an emit: the intent cools, the candidates become recent, the dedupe key is kept, the counter moves, and the note opens its learning window (plan 6.2). */
		Mark: (State: RingState, Intent: string, Paths: string[], Key: string): void => {
			State.cooled.set(Intent, 0);
			for (const Path of Paths) {
				State.recent.set(Path, 0);
			}
			State.cooledNoted.add(Key);
			State.notes += 1;
			State.pending = { intent: Intent, since: 0 };
		},
		/** The per-turn reset (plan 4.2): ring, cooldowns, dedupe, counters, caches. */
		Reset: (State: RingState): void => {
			State.entries.length = 0;
			State.cooled.clear();
			State.cooledNoted.clear();
			State.recent.clear();
			State.notes = 0;
			State.calls = 0;
			State.userText = "";
			State.pending = undefined;
			State.sectionText = undefined;
			State.sectionBuilt = undefined;
		},
	};
};
