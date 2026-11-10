/**
 * @module Tokens
 *
 * The budget's measurement (Function/Tokens): the harness `ctx.tokenMeter`
 * is used where available; otherwise the module's own estimate applies.
 *
 * @remarks
 *
 * V4-1 section 4: "the orientation budget uses ctx.tokenMeter where
 * available" - the meter's `estimate` function when probed. The local
 * estimate is ~4 characters per token, a ceil so the budget errs on the
 * small side. The meter is probed once at apply time and kept on
 * State.Meter.
 */
export default (
	State: { Meter?: { estimate?: (text: string) => number } | undefined },
	Text: string,
): number => {
	const Estimate = State.Meter?.estimate;
	switch (true) {
		case typeof Estimate === "function":
			try {
				return Math.max(0, Math.ceil(Number(Estimate(Text)) || 0));
			} catch {
				/* a throwing meter degrades to the local estimate */
			}
			break;
		default:
	}
	return Math.ceil(Text.length / 4);
};
