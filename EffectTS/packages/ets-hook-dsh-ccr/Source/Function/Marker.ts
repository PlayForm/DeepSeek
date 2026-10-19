// Marker - the format/parse pair for the retrieval marker
//
//     <<<CCR:<24hex>|<type>|<size>>>
//
// Byte-identical in shape with Aphrodite's `<<<CCR:hash|type|size>>>` (R:116-
// 118) so the research vocabulary carries over, with two deliberate deltas:
// the hash is 24 hex (not 40) and the type vocabulary is the reduced DSH set.
// The marker is PURE ASCII (digits, lowercase hex, letters, pipes) - it
// passes through every member of the harness's normalize family untouched
// (the dash class rewrites only unicode dashes; the quotes/ellipsis/space
// classes never touch ASCII pipes; `normalize-file` normalizes existing
// files, not model output), so the model can re-read the marker from its own
// transcript intact.
//
// format(hash, type, size)  - the marker line, exactly;
// parse(text)               - the STRICT extraction: the marker must occupy
//                             the WHOLE trimmed line, the hash must be 24
//                             lowercase hex characters, the type a non-empty
//                             token, the size a non-negative integer - no
//                             prefix or fuzzy matching, ever (the marker
//                             contract's rule). Returns null on any mismatch;
//                             the retrieval tool refuses everything else.
export default {
	format(Hash: string, Type: string, Size: number): string {
		return `<<<CCR:${Hash}|${Type}|${Size}>>>`;
	},
	parse(Line: string): { hash: string; type: string; size: number } | null {
		const Match = /^<<<CCR:([0-9a-f]{24})\|([a-z]+)\|(\d+)>>>$/.exec(Line.trim());
		switch (true) {
			case Match === null:
				return null;
			default:
				return {
					hash: Match[1] ?? "",
					type: Match[2] ?? "",
					size: Number(Match[3] ?? 0),
				};
		}
	},
};
