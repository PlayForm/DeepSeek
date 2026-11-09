// CountShort - the compact token formatter of the tokens column: the K and
// M ladder the harness tokens cells use, with two decimals below 1,000, one
// decimal from 1,000 up, and one decimal M from 10,000,000 up.
import Dash from "@Variable/Dash";

export default function CountShort(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	switch (true) {
		case Value >= 10000000:
			return `${(Value / 1000000).toFixed(1)}M`;
		case Value >= 1000:
			return `${(Value / 1000).toFixed(1)}K`;
		default:
			return `${(Value / 1000).toFixed(2)}K`;
	}
}
