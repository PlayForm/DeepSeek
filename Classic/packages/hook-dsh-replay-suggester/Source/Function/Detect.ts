import type { CompiledIntent, Intent, Match } from "@Interface/Pack.js";

/**
 * @module Detect
 *
 * The deterministic classifier: a pure function that scores a call probe
 * against compiled rules and returns the winning Match or null.
 *
 * @remarks
 *
 * The plan §4.3 shapes it: pure function, no LLM, no I/O, O(intents x rules)
 * + a map lookup. Given the compiled rules (the synthesized `Repeat` family
 * first, then an explicit pack's families) and a call probe (the tool name +
 * the JSON of its arguments), it returns the winning Match or null - the
 * algebra's identity element is silence.
 *
 * The math is the plan's §3.5: k = sigmoid(sum(weights of matching signals)
 * + bias), bias -0.6. The history evidence is no longer a separate lift: it
 * is the synthesized family's `history` signal (weight 2.5), so a recalled
 * record crosses the gate at k = sigmoid(2.5 - 0.6) = 0.87, while an
 * explicit pack family still has to earn its own weight.
 *
 * The regexes arrive precompiled (Function/Apply compiles the explicit pack
 * once per root and the synthesized family once per call) - this leaf never
 * compiles a regex itself.
 */
/**
 * The plan's bias constant (§3.5): keeps a single weak signal below the gate.
 */
const Bias = -0.6;

/**
 * The sigmoid squashes the weighted evidence sum into [0,1].
 */
const Sigmoid = (X: number): number => 1 / (1 + Math.exp(-X));

export default (Rules: CompiledIntent[], Tool: string, Probe: string): Match | null => {
	let Winner: Match | null = null;
	for (const Intent of Rules) {
		let Sum = 0;
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
 * Compile the raw rows: the regex sources become RegExp objects (with the
 * case-insensitive flag - the probes are prose-ish). Function/Apply calls it
 * for the explicit pack (once per root) and for the synthesized family (once
 * per call); a malformed pattern throws, and the listener's try/catch is the
 * fail-open posture (the call passes through unnoted).
 */
export const Compile = (Raw: Intent[]): CompiledIntent[] =>
	Raw.map((Intent) => ({
		...Intent,
		signals: Intent.signals.map((Signal) => ({
			...Signal,
			pattern: new RegExp(Signal.pattern, "i"),
		})),
	}));
