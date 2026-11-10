import Dash from "@Variable/Dash";

/**
 * @module Count
 *
 * The integer formatter of the detail expansion and the Lines helper.
 *
 * @remarks
 *
 * Thousands-grouped, rounded to the nearest integer, the dash for every value that is not a finite
 * number.
 */
export default function Count(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return Dash;
	return String(Math.round(Value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
