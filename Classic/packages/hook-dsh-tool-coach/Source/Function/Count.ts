// Count - the escalation math (plan Part 3 §3.5 step 2 + the tier ladder in
// TOOL-COACH-PLAN.md §5). Pure state transition: advances the per-agent
// counters for one JUDGED call (terminal calls only; non-terminal tools are
// transparent and never reach this function) and returns the decision. All
// counters are in JUDGED calls.
//
// The state (per agent, in a WeakMap keyed like the repeat-tool-reminder's
// chains): a sliding `window` of the last `window` judged calls (the offense
// match or null when the call was clean), the cooldown counter sinceNote, the
// total offense counter strikesSinceNote, the per-class offense counters
// classStrikes (tier-3 is armed per class), the clean counter sinceClean, the
// tier-2 flag, the tier-2 section cache, and the total judged-call clock.
//
// Decision precedence (per call):
//   1. a clean call while tier 2 is on: sinceClean grows; when it reaches
//      cleanWindow the section turns OFF (tier 2 off);
//   2. an offense: sinceClean resets, the window and all counters advance;
//      - tier 1 note when the offense's CLASS has reached `threshold` strikes
//        within the window AND the cooldown has elapsed since the last note
//        (both note counters reset - the note IS the last note);
//      - otherwise, when the class trigger is active but the cooldown has not
//        elapsed, the call is suppressed (ledger only);
//      - tier 2 turns ON when total offenses since the last note reach
//        escalateThreshold (idempotent while on);
//   3. tier 3 is armed but NOT decided here: the deny fires in the
//      tools/pre-execute listener (before the call runs) when the offense's
//      class has reached enforceThreshold strikes since the last note.
import type { AgentState, CoachClass, Decision, Match } from "@Interface/Execution.js";

/** The per-call knobs Count reads (the live State values, already unwrapped). */
export interface CountConfig {
	threshold: number;
	window: number;
	cooldown: number;
	escalateThreshold: number;
	cleanWindow: number;
}

/** A fresh per-agent state. */
export const FreshState = (): AgentState => ({
	window: [],
	sinceNote: Number.MAX_SAFE_INTEGER, // "never noted": the first note needs no cooldown wait
	strikesSinceNote: 0,
	classStrikes: { write: 0, read: 0, search: 0, discovery: 0, control: 0 },
	sinceClean: 0,
	tier2: false,
	calls: 0,
	exemptSeen: new Set(),
	lastCommand: "",
	lastClass: "write",
});

/** The per-class offense count within the current window. */
const ClassWindow = (State: AgentState, Class: CoachClass): number => {
	let Count = 0;
	for (const Entry of State.window) {
		if (Entry?.class === Class) {
			Count += 1;
		}
	}
	return Count;
};

/** Total strikes in the current window. */
const TotalWindow = (State: AgentState): number => {
	let Count = 0;
	for (const Entry of State.window) {
		if (Entry !== null) {
			Count += 1;
		}
	}
	return Count;
};

/**
 * Advance the state for one judged call and decide. `Match` is the offense
 * detected on THIS call, or null when the call was clean.
 */
export default (State: AgentState, Match: Match | null, Config: CountConfig): Decision => {
	// Every judged call advances the clock and the window.
	State.calls += 1;
	State.window.push(Match);
	while (State.window.length > Math.max(1, Config.window)) {
		State.window.shift();
	}
	State.sinceNote += 1;
	const Decision: Decision = {
		match: Match,
		tier: 0,
		note: false,
		tier2On: false,
		tier2Off: false,
		suppressed: false,
		strikes: 0,
		sinceNote: State.sinceNote,
	};

	// 1. A clean call while tier 2 is on: the clean window may clear it.
	if (Match === null) {
		State.sinceClean += 1;
		if (State.tier2 && State.sinceClean >= Config.cleanWindow) {
			State.tier2 = false;
			Decision.tier = 2;
			Decision.tier2Off = true;
		}
		Decision.strikes = TotalWindow(State);
		return Decision;
	}

	// 2. An offense: the clean counter resets, the class counters advance.
	State.sinceClean = 0;
	State.lastCommand = Match.command;
	State.lastClass = Match.class;
	State.classStrikes[Match.class] += 1;
	Decision.strikes = TotalWindow(State);

	const ClassCount = ClassWindow(State, Match.class);
	if (ClassCount >= Config.threshold && State.sinceNote >= Config.cooldown) {
		// Tier 1: the note fires; it IS the last note - both counters reset.
		Decision.tier = 1;
		Decision.note = true;
		State.sinceNote = 0;
		State.strikesSinceNote = 0;
		State.classStrikes = { write: 0, read: 0, search: 0, discovery: 0, control: 0 };
	} else if (ClassCount >= Config.threshold) {
		// The trigger is active but the cooldown suppresses the note.
		Decision.suppressed = true;
	}
	State.strikesSinceNote += 1;
	if (!State.tier2 && State.strikesSinceNote >= Config.escalateThreshold) {
		// Tier 2 ON (idempotent while on).
		State.tier2 = true;
		Decision.tier2On = true;
		if (Decision.tier < 2) {
			Decision.tier = 2;
		}
	}
	Decision.sinceNote = State.sinceNote;
	return Decision;
};
