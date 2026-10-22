// Match - the exclusion/inclusion check for the hook's own path lists
// (config `exclude` and `include`). The factory's Match is the segment match
// (any path segment equal to a listed name); the hook's frozen default list
// is the GLOB triple `node_modules/**, **/Target/**, **/.git/**`, so the
// module owns its leaf and provides the glob-aware matcher:
//
//   * a pattern containing `*` compiles to an anchored regex (`**` → `.*`,
//     `*` → `[^/]*`) and is tested against the full path AND against every
//     path SUFFIX starting at a segment boundary (so `**/Target/**` matches
//     `/repo/Target/x.ts` and `node_modules/**` matches
//     `/repo/node_modules/x.ts`);
//   * a plain pattern (no `*`) is the segment match (the factory's
//     semantics) - any path segment equal to the pattern excludes the path.
//
// Pure internal calculation. No List (or empty) matches nothing.
const Compile = (Glob: string): RegExp => {
	const Escaped = Glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const Source = Escaped.split("**")
		.map((Part) => Part.replace(/\*/g, "[^/]*"))
		.join(".*");
	return new RegExp(`^${Source}$`);
};

const Suffixes = (Path: string): string[] => {
	const Segments = Path.split(/[\\/]/).filter((Segment) => Segment.length > 0);
	return Segments.map((_, Index) => Segments.slice(Index).join("/"));
};

export default (Path: string, List: string[] | null | undefined): boolean => {
	switch (true) {
		case !List || List.length === 0:
			return false;
	}
	const Wild = List.some((Glob) => Glob.includes("*"));
	switch (true) {
		case Wild:
			return List.some((Glob) => {
				const Regex = Compile(Glob);
				return Regex.test(Path) || Suffixes(Path).some((Suffix) => Regex.test(Suffix));
			});
		default:
			return Path.split(/[\\/]/).some((Segment) => List.includes(Segment));
	}
};
