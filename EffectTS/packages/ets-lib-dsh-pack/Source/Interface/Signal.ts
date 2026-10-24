// Signal - one path/pattern rule of a pack family: the rule id (for the
// ledger and the smokes), the regex source, the evidence weight a match
// contributes, and an optional tool-name restriction (absent = any tool).
export default interface Signal {
	/** The rule id this row implements. */
	rule: string;
	/** The regex source, matched against the family's call probe. */
	pattern: string;
	/** The evidence weight a match contributes. */
	weight: number;
	/** Optional tool-name restriction: empty/undefined = any tool. */
	tools?: string[];
}
