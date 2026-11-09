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
