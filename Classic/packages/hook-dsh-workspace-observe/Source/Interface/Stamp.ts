// Stamp - the observation record the hook writes (Interface/Stamp). One stamp
// per fs/observed event (or manual call): the path, the version observed at
// the event, the origin, and the hook's own monotonic sequence.
//
// THE SEQUENCE IS NOT A CLOCK: it is the plugin's own monotonic counter,
// incremented once per recorded stamp and persisted with the domain (recovered
// on mount as the maximum loaded sequence). The family's no-real-timers rule -
// never a wall clock, never Date.now on the record path.
export default interface Stamp {
	/** The path as the event carried it (`displayPath` - the model-facing form). */
	path: string;
	/** The observed version token, verbatim; "absent" for an absent observation. */
	version: string;
	/** How the stamp was recorded: the fs/observed event, or a manual call. */
	origin: "fs/observed" | "manual";
	/** The plugin's own monotonic sequence (never a wall clock). */
	sequence: number;
}
