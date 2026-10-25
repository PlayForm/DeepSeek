import { familyFor } from "./Motif.mjs";
import { digest, stream } from "./Prng.mjs";

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

/** A zone's complexity: 0..3, gated by a feature and nudged by the seed. */
const level = (Base, Random) => Math.max(0, Math.min(3, Base + Random.pick([-1, 0, 0, 0, 1])));

const armsOf = (Features) => (Features.events > 0 ? 4 + 2 * (Features.events % 3) : 4);

export const planOf = (Genome) => {
	const Features = Genome.features;
	const Random = stream(`${Genome.seed}grammar`);
	const Grammar = Grammars[Genome.kind] ?? "spike-star";
	const Evolution = Genome.mutations ?? { rings: 0, ticks: 0 };
	const Arms = armsOf(Features);

	const Motif = stream(digest(`${String(Genome.dir ?? "").replace(/^ets-/, "")}motif`));
	const Family = familyFor(Genome.kind, Motif);
	const Order = Motif.pick([4, 6, 6, 8, 8, 8, 12]);

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

	// The per-zone complexity vector: each LEVEL of separation gets its own
	// richness, so one package can carry a rich core over a plain body while its
	// sibling carries a plain core inside a dense rim. The reference sheet varies
	// exactly this way; the gates below decide the base, the seed nudges it.
	const Levels = {
		core: level(
			coreOf(Genome.domain) === "grid" || coreOf(Genome.domain) === "hexagon" ? 2 : 1,
			Random,
		),
		body: level(Features.functions > 8 ? 3 : Features.functions > 3 ? 2 : 1, Random),
		detail: level(Features.functions > 5 ? 2 : Features.functions > 2 ? 1 : 0, Random),
		evolution: Math.min(3, Evolution.rings),
		orbit: level(Features.tools > 0 ? 3 : Features.injections > 1 ? 2 : 1, Random),
		rim: level(Genome.bundle ? 3 : Features.seams > 0 ? 2 : 1, Random),
	};

	const Weight =
		Math.round(
			(1.3 +
				(Features.functions > 4 ? 0.2 : 0) +
				(Genome.bundle ? 0.2 : 0) +
				(Features.tools > 0 ? 0.1 : 0)) *
				10,
		) / 10;
	const StrokeMode = Variant === 1 ? "double" : "outline";
	const Cap = Genome.kind === "hook" || Genome.kind === "plugin" ? "butt" : "round";
	const Join = Genome.kind === "hook" || Genome.kind === "plugin" ? "miter" : "round";
	const Fill = Variant === 2 ? "solid" : Variant === 0 ? "tint" : "none";

	return {
		grammar: Grammar,
		family: Family,
		variant: Variant,
		order: Order,
		arms: Arms,
		rings: Math.min(3, Features.injections),
		orbit: (Features.tools > 0 ? 8 : 4) + (Genome.bundle ? 4 : 0),
		orbitGlyph: OrbitGlyph,
		rim: Rim,
		rimGap: Features.seams > 0,
		rimNotch: Genome.bundle,
		core: coreOf(Genome.domain),
		detail: Features.functions > 3 ? Math.min(6, Features.functions) : 0,
		mode: Genome.tree === "EffectTS" ? "traced" : "single",
		mutations: { rings: Evolution.rings, ticks: Evolution.ticks },
		levels: Levels,
		stroke: { weight: Weight, mode: StrokeMode, cap: Cap, join: Join },
		fill: Fill,
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
