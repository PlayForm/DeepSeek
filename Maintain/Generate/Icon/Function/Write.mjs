import { build, write } from "../../../Icon/Index.mjs";

export default (Root) => {
	const { genomes } = build(Root);
	const { written } = write(Root);
	const Classic = genomes.filter((Genome) => Genome.tree === "Classic").length;
	const KindCount = (Kind) => genomes.filter((Genome) => Genome.kind === Kind).length;
	console.log(
		`Packages: ${genomes.length} (Classic ${Classic}, EffectTS ${genomes.length - Classic}; ` +
			`hook ${KindCount("hook")}, plugin ${KindCount("plugin")}, ` +
			`client ${KindCount("client")}, lib ${KindCount("lib")})`,
	);
	console.log(
		`Wrote ${written} files (mono ${genomes.length}, colour ${genomes.length}, ledger 1).`,
	);
};
