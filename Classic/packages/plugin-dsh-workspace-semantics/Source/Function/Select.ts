// Select - the adapter lookup for one path (Function/Select): the exact
// BASENAME first (the file adapters - package.json - win over their
// extension), then the lowercase dotted extension. The returned key is the
// registry key that matched, so the caller can look the deepener up under the
// same extension; the suffix is the path's extension ("" when there is none)
// for the byte-exact `refused <path> (no adapter for <suffix>)` line.
import type Adapter from "@Interface/Adapter.js";
import type State from "@Interface/State.js";

/** The last path segment (both separators). */
const Basename = (Path: string): string => {
	const Slash = Math.max(Path.lastIndexOf("/"), Path.lastIndexOf("\\"));
	return Path.slice(Slash + 1);
};

/** The extension of a path (with dot, lowercase), or "" for none. */
const Suffix = (Path: string): string => {
	const Dot = Path.lastIndexOf(".");
	const Slash = Math.max(Path.lastIndexOf("/"), Path.lastIndexOf("\\"));
	return Dot > Slash ? Path.slice(Dot).toLowerCase() : "";
};

export default (
	State: State,
	Path: string,
): { Adapter: Adapter | undefined; Key: string; Suffix: string } => {
	const File = Basename(Path);
	const ByFile = State.Adapters.get(File);
	switch (true) {
		case ByFile !== undefined:
			return { Adapter: ByFile, Key: File, Suffix: Suffix(Path) };
		default: {
			const Extension = Suffix(Path);
			return { Adapter: State.Adapters.get(Extension), Key: Extension, Suffix: Extension };
		}
	}
};
