// Name — the `name = value` declaration matcher on one Cargo.toml line:
// the (quoted or bare) key and the remainder after the equals. Returns null
// for lines that are not declarations (the scanner skips them).
export default (Rest: string): { key: string; rest: string } | null => {
	const Match =
		/^\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([A-Za-z0-9_\-]+))\s*=\s*(.*)$/.exec(Rest);
	switch (true) {
		case !Match:
			return null;
	}
	return {
		key: (Match[1] ?? Match[2] ?? Match[3]) as string,
		rest: Match[4] as string,
	};
};
