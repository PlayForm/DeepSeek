import { build } from "../../../Icon/Index.mjs";

const Pad = (Value, Width) => String(Value).padEnd(Width);

export default (Root) => {
	const { genomes } = build(Root);
	console.log(
		`${Pad("package", 46)}${Pad("kind", 8)}${Pad("tree", 10)}${Pad("order", 7)}${Pad("arms", 6)}${Pad("rings", 7)}seed`,
	);
	for (const Genome of genomes) {
		console.log(
			[
				Pad(Genome.package, 46),
				Pad(Genome.kind, 8),
				Pad(Genome.tree, 10),
				Pad(Genome.plan?.order ?? "-", 7),
				Pad(Genome.plan?.arms ?? 0, 6),
				Pad(Genome.plan?.rings ?? Genome.plan?.mutations?.rings ?? 0, 7),
				Genome.seed.slice(0, 8),
			].join(""),
		);
	}
};
