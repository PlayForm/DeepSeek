import Dash from "@Variable/Dash";

/**
 * @module Rate
 *
 * The cache-hit formatter.
 *
 * @remarks
 *
 * A share of prompt tokens as a percentage with two decimals, the dash when the call recorded no
 * prompt tokens.
 */
export default function Rate(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	return `${(Value * 100).toFixed(2)}%`;
}
