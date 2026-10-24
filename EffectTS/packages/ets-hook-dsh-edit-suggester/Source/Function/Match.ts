// Match - does a judged call name one of a note's companions? The
// follow-through's only lookup (completion spec 03-SUGGESTERS section 2: "a
// named companion subsequently touched").
//
// The pack mixes three path bases (repo-relative, package-relative and
// sibling globs), and a call path may be absolute or cwd-relative, so the
// rules mirror the existence filter's and the search consumer's graph match:
//
//   * a literal companion matches an equal call path or one ENDING in
//     `/<companion>` (the absolute form of a relative companion);
//   * a `*/<rest>` glob matches a call path ending in `/<rest>` (any package);
//   * any other glob is a segment-anchored regex (`**/` = any depth,
//     `*` = one segment).
/** Escape one literal glob segment for a RegExp. */
const Escape = (Text: string): string => Text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A glob translated to a segment-anchored RegExp. */
const Pattern = (Glob: string): RegExp => {
	const Body = Glob.split("**/")
		.map((Part) => Part.split("*").map(Escape).join("[^/]*"))
		.join("(?:.*/)?");
	return new RegExp(`(^|/)${Body}$`);
};

export default (
	/** The companion path or glob the note named. */
	Companion: string,
	/** The judged call's path. */
	CallPath: string,
): boolean => {
	switch (true) {
		case !Companion.includes("*"):
			return CallPath === Companion || CallPath.endsWith(`/${Companion}`);
		case Companion.startsWith("*/"):
			return CallPath.endsWith(`/${Companion.slice(2)}`);
		default:
			return Pattern(Companion).test(CallPath);
	}
};
