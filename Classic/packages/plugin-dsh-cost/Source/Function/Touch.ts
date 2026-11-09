// Touch - the tool/call and tool/result parser (Documentation/Plans/
// COST-TRACK-PLUGIN.md section 1, Temporary/Cost-Research/Backlog.md E4): one
// tool/call event's name and arguments string become the file interactions the
// call performs, resolved against the session's working directory and
// normalized POSIX - and, for a search-family tool, one tool/result event's
// discovered paths become one read touch each. A search's argument is a scope
// (a directory, a glob or a query), never a file, so it yields no touch of its
// own: the files it found are the result's. A tool the ledger does not map, a
// malformed or alien arguments string, and an absent or unreadable result
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

// The search family: the tools whose argument names a scope and whose files
// are the result's. The classification is KindOf's own, so a tool the
// vocabulary gains as a search is discovered without a second list.
export const Search = (Tool: string): boolean => KindOf(Tool) === "search";

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

// One non-empty string field of an unknown object, or undefined when the value
// is absent, alien or empty - the guard every result read goes through.
const StringOf = (Source: unknown, Key: string): string | undefined => {
	if (Source === null || typeof Source !== "object") {
		return undefined;
	}
	const Value = (Source as Record<string, unknown>)[Key];
	return typeof Value === "string" && Value.length > 0 ? Value : undefined;
};

// The paths the harness's structured result carries (read from a live session
// log's tool/result events): a glob records { shape: "paths", paths, ... }
// with one entry per matched path, and a grep records { shape: "matches",
// files: [{ path, matches }, ...], ... } with one entry per matching file.
// undefined means the result carries no shape this parser knows, so the
// rendered text is the fallback - never a guess.
const Structured = (Result: unknown): readonly string[] | undefined => {
	if (Result === null || typeof Result !== "object") {
		return undefined;
	}
	const Meta = (Result as Record<string, unknown>)["meta"];
	if (Meta === null || typeof Meta !== "object") {
		return undefined;
	}
	const Fields = Meta as Record<string, unknown>;
	const Found: string[] = [];
	switch (true) {
		case Fields["shape"] === "paths": {
			const Values = Fields["paths"];
			if (Array.isArray(Values)) {
				for (const Value of Values) {
					if (typeof Value === "string" && Value.length > 0) {
						Found.push(Value);
					}
				}
			}
			return Found;
		}
		case Fields["shape"] === "matches": {
			const Values = Fields["files"];
			if (Array.isArray(Values)) {
				for (const Value of Values) {
					const Path = StringOf(Value, "path");
					if (Path !== undefined) {
						Found.push(Path);
					}
				}
			}
			return Found;
		}
		default:
			return undefined;
	}
};

// The result's model-facing text: the text blocks of the tool-role message the
// tool/result event carries (data.message.content[].text), else a plain
// string.
const Text = (Result: unknown): string => {
	if (typeof Result === "string") {
		return Result;
	}
	if (Result === null || typeof Result !== "object") {
		return "";
	}
	const Message = (Result as Record<string, unknown>)["message"];
	if (Message === null || typeof Message !== "object") {
		return "";
	}
	const Content = (Message as Record<string, unknown>)["content"];
	if (!Array.isArray(Content)) {
		return "";
	}
	const Parts: string[] = [];
	for (const Block of Content) {
		if (Block === null || typeof Block !== "object") {
			continue;
		}
		const Fields = Block as Record<string, unknown>;
		if (Fields["type"] === "text" && typeof Fields["text"] === "string") {
			Parts.push(Fields["text"]);
		}
	}
	return Parts.join("\n");
};

// The file paths a search result's TEXT names: a glob lists one matched path
// per line, a grep groups its matches by file with the file's path on its own
// line (a dialect that prefixes each match with "path:<line>: " is read the
// same way). The "Found <n> matches" header, a match line ("Line <n>: ..."),
// the "No files found" empty result and the spill note ("(Showing 100 of
// ...)") are not paths, and a line that reads as prose is never taken as one.
const Listed = (Body: string): readonly string[] => {
	const Found: string[] = [];
	for (const Raw of Body.split("\n")) {
		const Line = Raw.trim();
		switch (true) {
			case Line.length === 0:
			case Line === "No files found":
			case Line.startsWith("Line "):
			case Line.startsWith("Found ") && Line.includes("match"):
			case Line.startsWith("(") && Line.endsWith(")"):
				continue;
			default:
		}
		const Prefixed = /^(.+?):\d+(?::\d+)?:/.exec(Line);
		const Candidate = Prefixed?.[1] ?? Line;
		// a candidate names a file: it is one token, and it is not a bare
		// dot, a bare slash or a prose line that happens to have no spaces
		switch (true) {
			case /\s/.test(Candidate):
			case !/[^./]/.test(Candidate):
				continue;
			default:
		}
		Found.push(Candidate);
	}
	return Found;
};

// The files one search result discovered: the structured payload first (the
// exact paths, spaces included), the rendered text as the fallback. A path
// ending in "/" names a directory - a scope, not a file - and is never a
// touch.
const Discovered = (Result: unknown): readonly string[] =>
	(Structured(Result) ?? Listed(Text(Result))).filter((Path) => !Path.endsWith("/"));

// The discovered files as read touches: resolved against the session's working
// directory and listed once each, in the result's order.
const Reads = (Files: readonly string[], Cwd: string): readonly Touched[] => {
	const Seen = new Set<string>();
	const Found: Touched[] = [];
	for (const File of Files) {
		const Path = resolve(Cwd, File);
		if (Seen.has(Path)) {
			continue;
		}
		Seen.add(Path);
		Found.push({ Path, Kind: "read" });
	}
	return Found;
};

export default (
	Name: string,
	Arguments: string,
	Cwd: string,
	Result?: unknown,
): readonly Touched[] => {
	const Kind = KindOf(Name);
	if (Kind === undefined) {
		return [];
	}
	// A search scope is not a file: the touches are the result's alone.
	if (Kind === "search") {
		return Reads(Discovered(Result), Cwd);
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
	return Paths(Parsed as Record<string, unknown>).map((Path) => ({
		Path: resolve(Cwd, Path),
		Kind,
	}));
};
