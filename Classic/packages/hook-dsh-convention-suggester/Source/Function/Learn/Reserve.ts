// Reserve - the once-per-workspace-per-PROCESS gate (D4): the first judged
// call in a workspace reserves its root; every later call in the same root -
// from the same mount or from a second mount of the hook - gets false and
// stays silent. The set is module-level on purpose: "per process" is the
// contract, so a remount does not re-propose and does not re-note.
//
// A reservation is taken BEFORE the scan/write (the note and the file are one
// event), so a failed write is warned once and not retried in this process -
// the fail-open posture: the bootstrap is best-effort and the next process
// tries again.
const Reserved = new Set<string>();

export default (Root: string): boolean => {
	if (Reserved.has(Root)) {
		return false;
	}
	Reserved.add(Root);
	return true;
};
