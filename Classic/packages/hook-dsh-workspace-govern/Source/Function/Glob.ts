// Glob - one glob match (Function/Glob): the tiny matcher the gate uses for
// the scope allowlist and the exclusion list. Supported syntax, deliberately
// minimal: `**` crosses directory separators, `*` matches within one
// segment, `?` matches one character; everything else is literal. A pattern
// without a slash anchors at the start of the path either way (the match is
// always full-path, never suffix).
export default (Path: string, Pattern: string): boolean => {
	let Source = "";
	for (let Index = 0; Index < Pattern.length; Index += 1) {
		const Char: string = Pattern[Index] ?? "";
		if (Char === "*") {
			if (Pattern[Index + 1] === "*") {
				Source += ".*";
				Index += 1;
			} else {
				Source += "[^/]*";
			}
		} else if (Char === "?") {
			Source += "[^/]";
		} else {
			Source += Char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
	}
	try {
		return new RegExp(`^${Source}$`).test(Path);
	} catch {
		// An unrepresentable pattern matches nothing - never everything.
		return false;
	}
};
