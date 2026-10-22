// ScanImports - the v0 import-specifier scanner: static `from "..."` /
// `from '...'` and dynamic `import("...")` / `import('...')` occurrences per
// line, comment lines skipped. The caller decides which specifiers become
// edges: only RELATIVE specifiers produce an `imports` edge; a non-relative
// specifier is recorded as a skipped import in the parse result - never as a
// fake node or edge.
export interface ImportMatch {
	specifier: string;
	line: number;
}

const Static = /\bfrom\s+(['"])([^'"]+)\1/g;

const Dynamic = /\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

const Comment = /^\s*(\/\/|\*|\/\*)/;

export default (Lines: string[]): ImportMatch[] => {
	const Matches: ImportMatch[] = [];
	Lines.forEach((Line, Index) => {
		if (Comment.test(Line)) {
			return;
		}
		for (const Match of Line.matchAll(Static)) {
			Matches.push({ specifier: Match[2] ?? "", line: Index + 1 });
		}
		for (const Match of Line.matchAll(Dynamic)) {
			Matches.push({ specifier: Match[2] ?? "", line: Index + 1 });
		}
	});
	return Matches;
};
