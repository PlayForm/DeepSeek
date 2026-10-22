// Remove - the removeFile body: resolve, delete the record from the mirror
// and the store, bump the indexRevision, persist the meta record, and ledger
// the byte-exact `removed <path>` line. A path with no record returns false
// silently (nothing to remove, nothing to ledger).
import type State from "@Interface/State.js";

import Append from "./Append.js";
import Store from "./Store.js";

export default async (StateRef: State, Path: string): Promise<boolean> => {
	try {
		const Fs = (StateRef.Context as unknown as { fs: any }).fs;
		const Target = await Fs.resolve(Path);
		const Key = Target.displayPath as string;
		const Mirror = StateRef.Records.delete(Key);
		const Stored = await Store.remove(StateRef, Key);
		const Removed = Mirror || Stored;
		if (!Removed) {
			return false;
		}
		StateRef.Revision += 1;
		await Store.putMeta(StateRef, StateRef.Revision);
		Append(StateRef, `removed ${Key}`);
		return true;
	} catch {
		return false;
	}
};
