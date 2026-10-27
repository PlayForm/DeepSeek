// Rule - one effective-dated modifier the cost arithmetic multiplies by
// (Documentation/Plans/COST-TRACK-PLUGIN.md section 17.2): a config or
// ledger Modifier row parsed to its arithmetic shape. Kind is the pricing
// mode the rule applies to (batch, flex, priority, ultrafast), Model NULL
// means the rule is provider-wide, and EffectiveFrom/EffectiveTo bound the
// window in epoch milliseconds (a NULL EffectiveTo never ends). The
// multiplier scales the priced total; the Value label stays in the ledger
// for the audit.
export default interface Rule {
	readonly Provider: string;
	readonly Model: string | null;
	readonly Kind: string;
	readonly Multiplier: number;
	readonly EffectiveFrom: number;
	readonly EffectiveTo: number | null;
}
