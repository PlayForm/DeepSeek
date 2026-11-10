/**
 * @module Rule
 *
 * One effective-dated modifier the cost arithmetic multiplies by
 * (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.2): a config or
 * ledger Modifier row parsed to its arithmetic shape.
 *
 * @remarks
 * Kind is the pricing mode the rule applies to (batch, flex, priority,
 * ultrafast), Model NULL means the rule is provider-wide, and
 * EffectiveFrom/EffectiveTo bound the window in epoch milliseconds (a NULL
 * EffectiveTo never ends). The multiplier scales the priced total; the
 * Value label stays in the ledger for the audit.
 */

/**
 * One parsed modifier rule.
 */
export default interface Rule {
	/**
	 * The provider the rule applies to.
	 */
	readonly Provider: string;

	/**
	 * The model the rule is scoped to (null is provider-wide).
	 */
	readonly Model: string | null;

	/**
	 * The pricing mode the rule applies in.
	 */
	readonly Kind: string;

	/**
	 * The multiplier the arithmetic scales by.
	 */
	readonly Multiplier: number;

	/**
	 * The epoch ms the rule applies from.
	 */
	readonly EffectiveFrom: number;

	/**
	 * The epoch ms the rule applies until (null never ends).
	 */
	readonly EffectiveTo: number | null;
}
