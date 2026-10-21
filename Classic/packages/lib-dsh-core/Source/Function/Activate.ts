// Activate - the ACTIVATION-LINE composer: the `activated (...)` proof line
// every plugin's Apply stage emits to the ledger -
//   `activated (k1=v1, k2=v2, ...)`
// Nine Apply.ts sites hand-compose this exact template (the six stream
// normalizers and the governance trio - governor, pinner, cargo): the same
// `activated (` prefix, the `k=v` pair join with `, ` and the `)` suffix,
// six field-list variants of one shape. The string MECHANICS live here; the
// FIELD VALUES stay module-side - the module passes its own list of
// `[key, value]` pairs and the composer only joins them.
//
//   * A pair whose value is `undefined` is SKIPPED (the absent-field rule:
//     the replacement-less quotes/fullwidth variants simply omit the
//     `replacement=` pair from their lists);
//   * an EMPTY key renders the value as a BARE segment (the governance
//     trio's leading flavor word - `anywhere mode`, `pinner`,
//     `cargo flavor`) instead of a `k=v` pair;
//   * an empty-string value is a PRESENT field (the invisible flavor's
//     `replacement=` removal marker) - only `undefined` means absent.
//
// The composer is pure and byte-identical: no prefix, no timestamp, no
// module name - the `<module>:` prefix is the factory's Append/Journal
// layer, not this template's.
export default (Fields: readonly (readonly [string, string | undefined])[]): string => {
	const Parts: string[] = [];
	for (const [Key, Value] of Fields) {
		switch (true) {
			case Value === undefined:
				break;
			default:
				Parts.push(Key === "" ? Value : `${Key}=${Value}`);
		}
	}
	return `activated (${Parts.join(", ")})`;
};
