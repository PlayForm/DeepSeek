import { stream } from "./Prng.mjs";

const Grammars = {
	hook: "spike-star",
	plugin: "interlace-tile",
	client: "quatrefoil",
	lib: "crescent-ring",
};

const coreOf = (Domain) => {
	if (Domain.startsWith("normalize")) {
		return "barDiamond";
	}
	if (Domain.includes("governor")) {
		return "square";
	}
	if (Domain.includes("pinner")) {
		return "pin";
	}
	if (Domain.includes("factory")) {
		return "hexagon";
	}
	if (Domain.includes("trace")) {
		return "spiral";
	}
	if (Domain.includes("panel")) {
		return "grid";
	}
	if (Domain.includes("workspace")) {
		return "grid";
	}
	if (Domain === "core" || Domain.startsWith("core-")) {
		return "cross";
	}
	return "diamond";
};

const armsOf = (Features) => (Features.events > 0 ? 4 + 2 * (Features.events % 3) : 4);

export const planOf = (Genome) => {
	const Features = Genome.features;
	const Random = stream(Genome.seed);
	const Grammar = Grammars[Genome.kind] ?? "spike-star";
	const Evolution = Genome.mutations ?? { rings: 0, ticks: 0 };
	const Arms = armsOf(Features);

	const Order =
		Grammar === "spike-star"
			? Arms
			: Grammar === "crescent-ring"
				? Random.pick([4, 6, 8, 12])
				: Grammar === "interlace-tile"
					? Random.pick([4, 4, 8])
					: Random.pick([4, 4, 4, 8]);

	const Variant = Random.pick([0, 1, 2]);
	const Rim =
		Grammar === "interlace-tile"
			? Random.pick(["square", "square", "diamond", "woven"])
			: Grammar === "quatrefoil"
				? Random.pick(["scallop", "square", "none"])
				: Grammar === "crescent-ring"
					? Random.pick(["none", "none", "woven"])
					: Random.pick(["none", "none", "diamond"]);

	const OrbitGlyph =
		Grammar === "spike-star"
			? Features.seams > 0
				? "tick"
				: "dot"
			: Grammar === "crescent-ring"
				? "crescent"
				: "dot";

	const Orbit = (Features.tools > 0 ? 8 : 4) + (Genome.bundle ? 4 : 0);

	return {
		grammar: Grammar,
		variant: Variant,
		order: Order,
		arms: Arms,
		rings: Math.min(3, Features.injections),
		orbit: Orbit,
		orbitGlyph: OrbitGlyph,
		rim: Rim,
		rimGap: Features.seams > 0,
		rimNotch: Genome.bundle,
		core: coreOf(Genome.domain),
		detail: Features.functions > 3 ? Math.min(6, Features.functions) : 0,
		mode: Genome.tree === "EffectTS" ? "traced" : "single",
		mutations: { rings: Evolution.rings, ticks: Evolution.ticks },
		jitter: {
			armOuter: Random.jitter(40, 2),
			armWaist: Random.jitter(0.62, 0.05, 0.01),
			armWidth: Random.jitter(13, 2),
			orbitRadius: Random.jitter(43, 1.5),
			phase: Random.jitter(0, 45, 15),
			detailPhase: Random.jitter(0, 30, 10),
		},
	};
};
