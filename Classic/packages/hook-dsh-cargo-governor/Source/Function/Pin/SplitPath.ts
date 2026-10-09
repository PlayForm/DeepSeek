// SplitPath — split a TOML header's inner content on dots that are not
// inside quotes, then unquote each segment — producing the same normalized
// path Function/Decode derives from the parsed document (the surgical
// rewrite's scanner-state input).
export default (Inner: string): string[] => {
	const Parts: string[] = [];
	let Current = "";
	let Quote: string | null = null;
	for (const Char of Inner) {
		switch (true) {
			case Quote !== null:
				switch (true) {
					case Char === Quote:
						Quote = null;
						break;
					default:
						Current += Char;
				}
				break;
			case Char === '"' || Char === "'":
				Quote = Char;
				break;
			case Char === ".":
				Parts.push(Current.trim());
				Current = "";
				break;
			default:
				Current += Char;
		}
	}
	Parts.push(Current.trim());
	return Parts;
};
