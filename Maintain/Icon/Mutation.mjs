// Maintain/Icon/Mutation.mjs - section 8: the changelog is the evolution
// history. Each "## <version>" heading starts a mutation in file order, and
// the bullet lines ("- ") inside that section are its entries; bullets before
// the first heading belong to no version and are ignored.

/** The mutations of one CHANGELOG.md text, in file order. */
export const mutationsOf = (changelogText) => {
	const Mutations = [];
	for (const Line of changelogText.split("\n")) {
		const Heading = Line.match(/^##\s+(.+?)\s*$/);
		if (Heading !== null) {
			Mutations.push({ version: Heading[1], entries: 0 });
			continue;
		}
		if (Mutations.length > 0 && /^- /.test(Line)) {
			Mutations[Mutations.length - 1].entries += 1;
		}
	}
	return Mutations;
};

/** The evolution shape of a mutation list: one ring per release after the
 ** first, one tick per changelog entry on the outermost ring. */
export const evolutionOf = (mutations) => ({
	rings: Math.max(0, mutations.length - 1),
	ticks: mutations.reduce((Sum, Mutation) => Sum + Mutation.entries, 0),
});
