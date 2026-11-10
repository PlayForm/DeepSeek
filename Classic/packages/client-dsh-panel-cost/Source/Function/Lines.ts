import Count from "@Function/Count";

/**
 * @module Lines
 *
 * The signed line delta of a file pill's tooltip.
 *
 * @remarks
 *
 * A plus for added lines, an ASCII minus for removed lines, both through the grouped Count, and an
 * empty string when the ledger recorded no delta.
 */
export default function Lines(Value: number | null): string {
	if (typeof Value !== "number" || !Number.isFinite(Value)) return "";
	return Value >= 0 ? `+${Count(Value)}` : `-${Count(Math.abs(Value))}`;
}
