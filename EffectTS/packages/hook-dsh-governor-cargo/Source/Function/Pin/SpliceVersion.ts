// SpliceVersion — replace the version string inside a single line's value
// with the canonical form. The `version` key is tried FIRST so an inline
// table that also carries `path`/`git` keys (`dep = { path = "../x",
// version = "0.1" }`) splices the right string; the quoted-string form
// (`name = "0.3.4"`, with or without a trailing comment) is the fallback
// for the simple requirement shape. Returns the line unchanged when no
// version string is present.
export default (Line: string, To: string): string => {
	const ViaKey = Line.replace(
		/(version\s*=\s*)("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/,
		(_All, Lead: string) => `${Lead}"${To}"`,
	);
	switch (true) {
		case ViaKey !== Line:
			return ViaKey;
	}
	return Line.replace(
		/(=\s*)("((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/,
		(_All, Lead: string) => `${Lead}"${To}"`,
	);
};
