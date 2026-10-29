// Touch - the tool/call arguments parser (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 1): one tool/call event's name and arguments
// string become the file interactions it performs, in argument order,
// resolved against the session's working directory and normalized POSIX. A
// tool the ledger does not map and a malformed or alien arguments string
// yield no touches; the parser never throws.
import { resolve } from "node:path";

type Kind = "read" | "write" | "edit" | "delete" | "search";

type Touched = { Path: string; Kind: Kind };

// The tool vocabulary the ledger maps, one kind each; every other tool is
// ignored (a tool call the ledger cannot attribute to files touches nothing).
const KindOf = (Tool: string): Kind | undefined => {
	switch (true) {
		case Tool === "read":
			return "read";
		case Tool === "write" || Tool === "move":
			return "write";
		case Tool === "edit" ||
			Tool === "multi_edit" ||
			Tool === "apply_patch" ||
			Tool === "batch_edit" ||
			Tool === "batch_edit_commit":
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
// order, then the plural files key.
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
			switch (true) {
				case typeof File === "string" && File.length > 0:
					Found.push(File);
					break;
				case File !== null && typeof File === "object": {
					const Entry = File as Record<string, unknown>;
					const Nested = Entry["path"] ?? Entry["file_path"];
					if (typeof Nested === "string" && Nested.length > 0) {
						Found.push(Nested);
					}
					break;
				}
				default:
			}
		}
	}
	return Found;
};

// A search tool names a directory or a pattern, not a file: "glob src/**" and
// "grep -r foo src" both carry a path that the ledger would otherwise record
// as a file and rank above the real ones. A basename with no dot is a
// directory, so a search touch survives only when it names something that
// looks like a file.
const FileLike = (Path: string): boolean => {
	const Name = Path.slice(Path.lastIndexOf("/") + 1);
	return Name.includes(".");
};

export default (Name: string, Arguments: string, Cwd: string): readonly Touched[] => {
	const Kind = KindOf(Name);
	if (Kind === undefined) {
		return [];
	}
	let Parsed: unknown;
	try {
		Parsed = JSON.parse(Arguments);
	} catch {
		return [];
	}
	if (Parsed === null || typeof Parsed !== "object" || Array.isArray(Parsed)) {
		return [];
	}
	return Paths(Parsed as Record<string, unknown>)
		.map((Path) => ({
			Path: resolve(Cwd, Path),
			Kind,
		}))
		.filter((Touched) => Touched.Kind !== "search" || FileLike(Touched.Path));
};
