/**
 * @module Glob
 *
 * The minimal matcher for the config's include and exclude globs.
 *
 * @remarks
 * `**` matches across separators, `*` within one, `?` a single character, and everything
 * else is literal.
 *
 * A pattern matches at ANY path depth (an implicit `**` + `/` prefix - the default exclude
 * list is written exactly that way: `node_modules/**` must keep `pkg/node_modules/x.js`
 * out too), and a pattern without a slash also matches the basename (the gitignore
 * convenience).
 *
 * The matcher carries no dependency and no caching: one compiled RegExp per call (v0
 * volumes).
 */
export default (Pattern: string, Path: string): boolean => {
	const Source = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.split("**")
		.map((Part) => Part.replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]"))
		.join(".*");
	const Full = new RegExp(`^(?:.*/)?${Source}$`);
	if (Full.test(Path)) {
		return true;
	}
	if (!Pattern.includes("/")) {
		const Base = Path.split("/").at(-1) ?? Path;
		return Full.test(Base);
	}
	return false;
};
