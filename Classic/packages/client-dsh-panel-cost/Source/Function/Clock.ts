/**
 * @module Clock
 *
 * The bar tooltip's start time: hour, minute and second, zero padded, in the browser's local time.
 *
 * @remarks
 * The dash for a missing or malformed stamp.
 */
import Dash from "@Variable/Dash";

const Pad = (Value: number): string => String(Value).padStart(2, "0");

export default function Clock(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	const Moment = new Date(Value);
	switch (true) {
		case Number.isNaN(Moment.getTime()):
			return Dash;
		default:
			return `${Pad(Moment.getHours())}:${Pad(Moment.getMinutes())}:${Pad(Moment.getSeconds())}`;
	}
}
