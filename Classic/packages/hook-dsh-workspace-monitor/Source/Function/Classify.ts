// Classify - the check-set classification (Function/Classify): match one
// path against the checksets table's globs and return the matching set
// identifiers in the table's insertion order (the deterministic order the
// ledger and the smoke rely on). The glob translator handles the catalog's
// patterns: a leading `**/` (any directory depth, including none), interior
// `**/` segments, and a `*` basename wildcard. A spec without a glob
// matches nothing.
const Glob = (Pattern: string): RegExp => {
	let Source = "";
	for (let Index = 0; Index < Pattern.length; Index += 1) {
		const Char: string = Pattern[Index] ?? "";
		switch (true) {
			case Char === "*" && Pattern[Index + 1] === "*" && Pattern[Index + 2] === "/":
				Source += "(?:.*/)?";
				Index += 2;
				break;
			case Char === "*" && Pattern[Index + 1] === "*":
				Source += ".*";
				Index += 1;
				break;
			case Char === "*":
				Source += "[^/]*";
				break;
			default:
				Source += Char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
		}
	}
	return new RegExp(`^${Source}$`);
};

export default (
	Path: string,
	CheckSets: Record<string, { glob?: string } | undefined>,
): string[] => {
	const Matched: string[] = [];
	for (const [Name, Specification] of Object.entries(CheckSets ?? {})) {
		switch (true) {
			case typeof Specification?.glob !== "string" || Specification.glob.length === 0:
				break;
			default:
				try {
					if (Glob(Specification.glob as string).test(Path)) {
						Matched.push(Name);
					}
				} catch {
					/* a broken pattern matches nothing, never throws out */
				}
		}
	}
	return Matched;
};
