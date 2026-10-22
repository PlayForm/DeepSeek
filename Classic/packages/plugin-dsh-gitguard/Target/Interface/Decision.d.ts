export default interface Decision {
    /** The verdict. */
    verdict: "allow" | "deny";
    /** The reason (rides the ledger line and the refusal). */
    reason: string;
    /** The parsed git subcommand; "" for a bare git invocation, undefined
     *  for a non-git command. */
    subcommand?: string;
}
