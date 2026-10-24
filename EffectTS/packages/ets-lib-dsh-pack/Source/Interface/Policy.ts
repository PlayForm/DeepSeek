// Policy - the pack's policy section: the per-action allowlist (D6). The
// shape is open on purpose: an action name maps to "auto" or "approve". The
// policy block is a later lane; the pack carries the section so one file
// describes one repo, and this library only types and merges it.
export default interface Policy {
	/** The per-action allowlist (action -> "auto" | "approve"). */
	[Action: string]: "auto" | "approve" | undefined;
}
