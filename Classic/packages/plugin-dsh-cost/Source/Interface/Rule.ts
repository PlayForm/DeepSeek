/**
 * @module Rule
 *
 * One effective-dated modifier the cost arithmetic multiplies by: a config or
 * ledger Modifier row parsed to its arithmetic shape.
 *
 * @remarks
 *
 * The shape follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.2.
 * Kind is the pricing mode the rule applies to (batch, flex, priority,
 * ultrafast), Model NULL means the rule is provider-wide, and
 * EffectiveFrom/EffectiveTo bound the window in epoch milliseconds (a NULL
 * EffectiveTo never ends). The multiplier scales the priced total; the Value
 * label stays in the ledger for the audit.
 */
export default interface Rule {
	/**
	 * The provider the rule applies to.
	 */
	readonly Provider: string;
	/**
	 * The model the rule is scoped to, null for provider-wide.
	 */
	readonly Model: string | null;
	/**
	 * The pricing mode the rule applies to.
	 */
	readonly Kind: string;
	/**
	 * The multiplier the priced total is scaled by.
	 */
	readonly Multiplier: number;
	/**
	 * The window's start, in epoch milliseconds.
	 */
	readonly EffectiveFrom: number;
	/**
	 * The window's end, null for a rule that never ends.
	 */
	readonly EffectiveTo: number | null;
}
