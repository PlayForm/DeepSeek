import type {
	ColumnDefinition,
	ResolvedTable,
	TableDefinition,
	TablePreferences,
} from "@Interface/Table";

/**
 * @module Resolve
 *
 * The one resolution every table render reads: a definition and a preference set become the
 * columns that survive, their final order and the percent width they add up to.
 *
 * @remarks
 *
 * The identity column - the definition's first column - is never hidden; an id either preference
 * list does not match is ignored rather than bound to another column; the order list leads with
 * the ids it names, and the columns it does not name keep their definition order.
 */
/**
 * Rank - the place each named id takes: the first mention wins, so a duplicated id cannot make the
 * order depend on which copy was read.
 */
const Rank = (Order: readonly string[]): ReadonlyMap<string, number> => {
	const Places = new Map<string, number>();
	for (const [Index, Id] of Order.entries()) if (!Places.has(Id)) Places.set(Id, Index);
	return Places;
};

export default function Resolve<Row>(
	Definition: TableDefinition<Row>,
	Preferences: TablePreferences,
): ResolvedTable<Row> {
	const Hidden = new Set<string>(Preferences.hidden);
	const Identity = Definition.columns[0]?.id;
	const Kept = Definition.columns.filter(
		(Column: ColumnDefinition<Row>) => Column.id === Identity || !Hidden.has(Column.id),
	);
	const Places = Rank(Preferences.order ?? []);
	const Ordered = Kept.map((Column, Index) => ({ Column, Index }))
		.sort((Left, Right) => {
			const LeftPlace = Places.get(Left.Column.id);
			const RightPlace = Places.get(Right.Column.id);
			switch (true) {
				case LeftPlace !== undefined && RightPlace !== undefined:
					return LeftPlace - RightPlace;
				case LeftPlace !== undefined:
					return -1;
				case RightPlace !== undefined:
					return 1;
				default:
					return Left.Index - Right.Index;
			}
		})
		.map((Entry) => Entry.Column);
	return {
		columns: Ordered,
		width: Ordered.reduce((Total, Column) => Total + Column.width, 0),
	};
}
