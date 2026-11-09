// Bound - the harness's bounded-render convention: render the first N items and
// report the remainder instead of printing everything (the shipped list pages
// bound the same way, packages/schedule/schedule/src/index.ts:108-111; the cost
// report already caps at 20, plugin-dsh-cost/Source/Function/Apply.ts:191-203).
// Pure: the caller owns every string.
export default <Item>(
	Items: readonly Item[],
	Limit: number,
): { Shown: readonly Item[]; More: number } => {
	const Cap = Math.max(0, Limit);
	return { Shown: Items.slice(0, Cap), More: Math.max(0, Items.length - Cap) };
};
