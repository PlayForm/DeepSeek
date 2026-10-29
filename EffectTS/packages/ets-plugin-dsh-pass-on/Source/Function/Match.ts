// Match - the glob matcher: a minimal `**`/`*`/`?` translation to a RegExp,
// anchored at both ends. `**` crosses directories; `*` does not. No
// dependency on an external glob library (the PO C self-containment rule).
export default (Pattern: string): RegExp => {
	const Source = Pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "\u0000")
		.replace(/\*/g, "[^/]*")
		.replace(/\?/g, "[^/]")
		.replace(/\u0000/g, ".*");
	return new RegExp(`^${Source}$`);
};
