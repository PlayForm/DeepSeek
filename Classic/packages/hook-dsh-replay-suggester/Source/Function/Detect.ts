// Detect - the DETERMINISTIC CLASSIFIER (the plan §4.3: pure function, no
// LLM, no I/O, O(intents x rules) + a map lookup). Given the compiled pack,
// a call probe (the tool name + the JSON of its arguments) and the history
// signal's lift (0 when no record was recalled), it returns the winning
// Match or null - the algebra's identity element is silence.
//
// The math is the plan's §3.5: k = sigmoid(sum(weights of matching signals,
// plus the history lift) + bias), bias -0.6. The lift is the plan's
// "history" evidence row: without a recalled record the Repeat intent's
// sum stays at 1.2 (k 0.62) and abstains - the replay answer requires the
// memory, never a guess.
//
// The regexes arrive precompiled (Function/Apply compiles once at apply) -
// the hot path never compiles a regex.
import type { CompiledIntent, Intent, Match } from "@Interface/Pack.js";

/** The plan's bias constant (§3.5): keeps a single weak signal below the gate. */
const Bias = -0.6;

/** The sigmoid squashes the weighted evidence sum into [0,1]. */
const Sigmoid = (X: number): number => 1 / (1 + Math.exp(-X));

export default (Rules: CompiledIntent[], Tool: string, Probe: string, Lift = 0): Match | null => {
	let Winner: Match | null = null;
	for (const Intent of Rules) {
		let Sum = Lift;
		for (const Signal of Intent.signals) {
			switch (true) {
				case Signal.tools !== undefined &&
					!Signal.tools.includes(Tool) &&
					!Signal.tools.includes("*"):
					continue;
			}
			if (Signal.pattern.test(Probe)) {
				Sum += Signal.weight;
			}
		}
		const K = Sigmoid(Sum + Bias);
		if (K >= Intent.threshold && (Winner === null || K > Winner.k)) {
			Winner = { intent: Intent, k: K };
		}
	}
	return Winner;
};

/**
 * Compile the raw pack once at apply: the regex sources become RegExp
 * objects (with the case-insensitive flag - the probes are prose-ish) and
 * invalid patterns are dropped rather than thrown (fail-open posture).
 */
export const Compile = (Raw: Intent[]): CompiledIntent[] =>
	Raw.map((Intent) => ({
		...Intent,
		signals: Intent.signals.map((Signal) => ({
			...Signal,
			pattern: new RegExp(Signal.pattern, "i"),
		})),
	}));
