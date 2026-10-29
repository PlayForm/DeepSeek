// Resolve - the shared touch resolution (the derivation "which files did this
// step touch", written once instead of once per plugin): one tool/call's name
// and arguments become the file touches it performs, in argument order,
// resolved against the session's working directory and normalized. A tool the
// vocabulary does not map and a malformed or alien arguments value yield no
// touches; the parser never throws. Both Function/Fold and Function/Emits
// import this one module - the rule lives here alone. Pure: node:path reads
// no filesystem, and a relative path with no session cwd resolves to nothing
// (never the process's own cwd).
import { resolve } from "node:path";

type Kind = "read" | "write" | "edit" | "delete" | "search";

type Touched = { Path: string; Kind: Kind };

// The tool vocabulary, one kind each; every other tool touches nothing (a
// tool call the vocabulary cannot attribute to files resolves no touch).
const KindOf = (Tool: string): Kind | undefined => {
	switch (true) {
		case Tool === "read":
			return "read";
		case Tool === "write":
			return "write";
		case Tool === "edit" || Tool === "multi_edit":
			return "edit";
		case Tool === "rm":
			return "delete";
		case Tool === "glob" || Tool === "grep":
			return "search";
		default:
			return undefined;
	}
};

// The argument keys that carry file paths: the single-path keys in priority
// order, then the plural files key (string entries only).
const Paths = (Args: Record<string, unknown>): string[] => {
	const Found: string[] = [];
	for (const Key of ["file_path", "path", "target"] as const) {
		const Value = Args[Key];
		if (typeof Value === "string" && Value.length > 0) {
			Found.push(Value);
		}
	}
	const Files = Args["files"];
	if (Array.isArray(Files)) {
		for (const File of Files) {
			if (typeof File === "string" && File.length > 0) {
				Found.push(File);
			}
		}
	}
	return Found;
};

// A search tool names a directory or a pattern, not a file: "grep foo src"
// carries a path the fold would otherwise record as a file touch and rank
// above the real ones. A basename with no dot is a directory, so a search
// touch survives only when it names something that looks like a file.
const FileLike = (Path: string): boolean => {
	const Name = Path.slice(Path.lastIndexOf("/") + 1);
	return Name.includes(".");
};

export default (Name: string, Arguments: unknown, Cwd: string): readonly Touched[] => {
	const Kind = KindOf(Name);
	switch (true) {
		case Kind === undefined:
			return [];
		default:
	}
	let Parsed: unknown = Arguments;
	if (typeof Arguments === "string") {
		try {
			Parsed = JSON.parse(Arguments);
		} catch {
			return [];
		}
	}
	if (Parsed === null || typeof Parsed !== "object" || Array.isArray(Parsed)) {
		return [];
	}
	return Paths(Parsed as Record<string, unknown>)
		.flatMap((Path) => {
			switch (true) {
				case Path.startsWith("/"):
					return [{ Path: resolve(Path), Kind }];
				case Cwd === "":
					return [];
				default:
					return [{ Path: resolve(Cwd, Path), Kind }];
			}
		})
		.filter(({ Path }) => Kind !== "search" || FileLike(Path));
};
