// Rate - the cache-hit formatter: a share of prompt tokens as a percentage
// with two decimals, the dash when the call recorded no prompt tokens.
import Dash from "@Variable/Dash";

export default function Rate(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	return `${(Value * 100).toFixed(2)}%`;
}
