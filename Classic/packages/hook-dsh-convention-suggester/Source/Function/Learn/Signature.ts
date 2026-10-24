// Signature - the proposal's signature markers, derived from the markers the
// scan actually found (D4): the strongest identity first.
//
//   * Documentation/ARCHIVE-STYLE.md - the full doc-graph identity (the
//     built-in pack's own marker);
//   * Documentation/INDEX.md - a repo with an index but no style guide;
//   * package.json - a package-shaped repo without a doc graph.
//
// No marker means no proposal: the root is not a workspace this learner can
// describe, and the honest answer is silence. The signature is a one-element
// list because the gate's rule is OR (any declared marker identifies the
// repo); one marker is the narrowest honest claim.
const Order = ["Documentation/ARCHIVE-STYLE.md", "Documentation/INDEX.md", "package.json"];

export default (Found: Set<string>): string[] | undefined => {
	const Marker = Order.find((Candidate) => Found.has(Candidate));
	return Marker === undefined ? undefined : [Marker];
};
