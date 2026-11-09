import type Options from "../Interface/Options.js";
import type Pack from "../Interface/Pack.js";
import Builtin from "../Variable/Builtin.js";
import Home from "./Home.js";
import Resolve from "./Resolve.js";

/**
 * @module Load
 *
 * The process memo of `Resolve`: one pack per (home, root), read once and
 * shared by every call.
 *
 * @remarks
 * The suggester family resolves per workspace root on the hot path, so the memo
 * is what keeps a pack read off it. A pack edit lands on the next process by
 * contract (a boot-time memo, not a watcher).
 */

const Cache = new Map<string, Pack>();

export default (Root: string, Options?: Options): Pack => {
	const Key = `${Home(Options)}\u0000${Root}`;
	const Hit = Cache.get(Key);
	if (Hit !== undefined) {
		return Hit;
	}
	const Loaded = Resolve(Root, Options);
	if (Loaded === undefined) {
		return Builtin;
	}
	Cache.set(Key, Loaded);
	return Loaded;
};
