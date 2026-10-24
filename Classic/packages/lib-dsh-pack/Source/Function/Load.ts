// Load - the process memo of Resolve: one pack per (home, root), read once
// and shared by every call. The suggester family resolves per workspace root
// on the hot path, so the memo is what keeps a pack read off it; a pack edit
// lands on the next process by contract (a boot-time memo, not a watcher).
import type Options from "../Interface/Options.js";
import type Pack from "../Interface/Pack.js";
import Home from "./Home.js";
import Resolve from "./Resolve.js";

const Cache = new Map<string, Pack>();

export default (Root: string, Options?: Options): Pack => {
	const Key = `${Home(Options)}\u0000${Root}`;
	const Hit = Cache.get(Key);
	if (Hit !== undefined) {
		return Hit;
	}
	const Loaded = Resolve(Root, Options);
	Cache.set(Key, Loaded);
	return Loaded;
};
