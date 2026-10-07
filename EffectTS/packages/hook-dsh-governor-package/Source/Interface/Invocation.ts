// Invocation — one ncu run as derived from the resolved update policy: the
// base invocation (default target, no filter) plus one invocation per
// targets.overrides entry. Function/Update/Run dispatches each one through
// the selected mode; `filter` is null for the base run (ncu runs unfiltered).
export default interface Invocation {
	/** Ledger label for the run ("base" or "filter <pattern>"). */
	label: string;
	/** ncu --target for the run. */
	target: string;
	/** ncu -f filter, or null for the unfiltered base run. */
	filter: string | null;
}
