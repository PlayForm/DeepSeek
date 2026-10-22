// Invalidate - the stale-validation invalidation (Function/Invalidate), the
// Acar seam: every validation object whose declared dependencies include the
// key goes stale, in one pass (the incremental-computation principle). A
// stale object is never guessed back to fresh: a revalidation is a new
// validation object (the Declare path). The return is the number of objects
// invalidated.
//
// The two callers: the fs/observed listener (the key is the changed path,
// Function/Watch) and the service's explicit invalidate(key) - any
// dependency key, not just a file path.
import type State from "@Interface/State.js";

export default (State: State, Key: string): number => {
	let Count = 0;
	for (const [Id, Object] of State.Store) {
		switch (true) {
			case Object.status !== "fresh":
				// Stale and superseded objects stay in their terminal
				// states; only a fresh object can go stale.
				break;
			case !Object.dependencies.includes(Key):
				break;
			default:
				Object.status = "stale";
				Count += 1;
				State.Factory.Append(State, `stale ${Id} (dependency ${Key})`);
		}
	}
	switch (true) {
		case Count > 0:
			try {
				void State.Handle?.table("meta")
					.put("__sequence", State.Sequence)
					.catch(() => {
						/* persistence best-effort */
					});
				for (const [Id, Object] of State.Store) {
					if (Object.status === "stale") {
						void State.Handle?.table("validations")
							.put(Id, Object)
							.catch(() => {
								/* persistence best-effort */
							});
					}
				}
			} catch {
				/* persistence best-effort */
			}
			break;
		default:
			// Nothing invalidated: no write, no line beyond the caller's.
			State.Factory.Append(State, `no stale (dependency ${Key})`);
	}
	return Count;
};
