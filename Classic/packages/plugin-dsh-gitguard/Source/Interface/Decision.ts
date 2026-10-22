// Decision - the guard's verdict (Interface/Decision): the result of
// classifying one command. `allow` passes through (the listener calls
// next()); `deny` refuses the dispatch (the listener returns the refusal
// line WITHOUT next() - the command must never execute).
export default interface Decision {
	/** The verdict. */
	verdict: "allow" | "deny";
	/** The reason (rides the ledger line and the refusal). */
	reason: string;
	/** The parsed git subcommand; "" for a bare git invocation, undefined
	 *  for a non-git command. */
	subcommand?: string;
}
