// Root - the pack-independent workspace root: start at the path's directory
// (or at the explicit cwd when the path is empty) and walk upward until a
// directory carries `.git` or `package.json` - the workspace is the repo, not
// the signature. The walk stops at the filesystem root; the explicit cwd is
// only the starting point for the walk (when the path is empty), so a walk
// that finds no marker returns no root.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** The path normalized the same way the fold normalizes it. */
const Clean = (Value: string): string => Value.replaceAll("\\", "/").replace(/^\.\//, "");

export default (Path: string, Cwd?: string): string | undefined => {
	let Directory =
		Path.length === 0
			? typeof Cwd === "string" && Cwd.length > 0
				? Cwd
				: undefined
			: dirname(Clean(Path));
	if (Directory === undefined) {
		return undefined;
	}
	for (let Current = Directory; ; Current = dirname(Current)) {
		if (existsSync(join(Current, ".git")) || existsSync(join(Current, "package.json"))) {
			return Current;
		}
		if (Current === dirname(Current)) {
			break;
		}
	}
	return undefined;
};
