// Stamp - the turn and step clock: month, day, hour and minute, zero
// padded, in the browser's local time, the dash for a missing or malformed
// stamp.
import Dash from "@Variable/Dash";

const Pad = (Value: number): string => String(Value).padStart(2, "0");

export default function Stamp(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	const Moment = new Date(Value);
	switch (true) {
		case Number.isNaN(Moment.getTime()):
			return Dash;
		default:
			return `${Pad(Moment.getMonth() + 1)}-${Pad(Moment.getDate())} ${Pad(
				Moment.getHours(),
			)}:${Pad(Moment.getMinutes())}`;
	}
}
