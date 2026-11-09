// Home - the harness home precedence without a harness import: an explicit
// configured path wins at the caller, then $DSH_HOME, then ~/.dsh (the
// resolveDshHome order, packages/util/home-paths/src/index.ts:12, 127-137).
// Pure string mechanics: no fs, no directory creation, no ledger string, and
// no environment read at module scope - the caller passes the environment.
const Root = (Environment: Record<string, string | undefined>): string => {
	const Override = Environment["DSH_HOME"];
	switch (true) {
		// The harness treats a whitespace-only value as unset
		// (home-paths/src/index.ts:108), so the trim is the precedence rule,
		// not a nicety: " " must fall through to ~/.dsh.
		case typeof Override === "string" && Override.trim().length > 0:
			return Override;
		default:
			return `${Environment["HOME"] ?? "~"}/.dsh`;
	}
};

export default (
	Segments: readonly string[],
	Environment: Record<string, string | undefined> = typeof process === "undefined"
		? {}
		: process.env,
): string => [Root(Environment), ...Segments].join("/");
