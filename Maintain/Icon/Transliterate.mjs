// Transliterate.mjs - the degenerative scene.
//
// The scene is the residue returned by Decay.mjs plus the semantic accents the
// package's own tokens demand. There is no motif library here: the icon is a
// decayed seed, and the tokens add the marks that name the package's facts.
// Every component is a solid path with a palette tone.

import { decayOf } from "./Decay.mjs";
import { angleOf } from "./Lexicon.mjs";
import { Ornament } from "./Motif.mjs";

const ToneByLayer = (Layer) => {
	switch (Layer) {
		case "frame":
			return "accent2";
		case "core":
			return "accent";
		case "detail":
			return "accent2";
		default:
			return "ink";
	}
};

const piece = (Id, Points, Options = {}) => ({
	id: Id,
	centerline: Points,
	geometry: {
		method: Options.method ?? "decay",
		topology: Options.closed === false ? "open" : "closed",
	},
	stroke: {
		width: Options.width ?? 1.1,
		join: Options.join ?? "round",
		start: Options.start ?? "butt",
		end: Options.end ?? "butt",
		outlineWidth: 0.7,
		widthProfile: "constant",
	},
	composition: {
		operation: "paint",
		collisionGroup: Options.layer ?? "body",
		depth: Options.depth ?? 0,
	},
	material: { tone: Options.tone ?? ToneByLayer(Options.layer), opacity: 1 },
	render: Options.render ?? "solid",
	...(Options.cutout === undefined ? {} : { cutout: Options.cutout }),
});

const annulus = (Radius, Width, Samples = 28) => ({
	points: Ornament.ring(Radius, Samples),
	cutout: [Ornament.ring(Radius - Width, Samples)],
});

export const sceneOf = (Genome, Plan) => {
	const Residue = decayOf(Genome.profile ?? {}, Genome.seed);
	const Tokens = (Genome.manifest ?? { tokens: {} }).tokens ?? {};
	const Seed = Number.parseInt(String(Genome.seed).slice(0, 6), 16) || 1;
	const Parts = [Residue.plate, ...Residue.fragments, Residue.shape];

	const Gates = Tokens.gate ?? [];
	const Tools = Tokens.tool ?? [];
	const Injections = Tokens.injection ?? [];
	const Services = Tokens.service ?? [];
	const States = Tokens.state ?? [];
	const Seams = Tokens.seam ?? [];
	const Ledger = Tokens.ledger ?? [];
	const Transforms = Tokens.transform ?? [];
	const Rings = Math.min(3, Plan.mutations?.rings ?? 0);
	const Detail =
		Plan.density === undefined
			? Math.min(6, Plan.detail ?? 0)
			: [0, 3, 5, 6][Math.min(3, Math.max(0, Plan.density))];

	Gates.slice(0, 6).forEach((Name, Index) => {
		Parts.push({
			key: `gate-${Index}`,
			points: Ornament.circleAt(angleOf(Name, Seed), 34, 2.4, 8),
			method: "gate-loop",
			layer: "detail",
			tone: "accent2",
		});
	});
	Tools.slice(0, 4).forEach((Name, Index) => {
		Parts.push({
			key: `tool-${Index}`,
			points: Ornament.circleAt(angleOf(Name, Seed + 3), 28, 1.6, 6),
			method: "tool-bead",
			layer: "detail",
			tone: "accent",
		});
	});
	Injections.slice(0, 2).forEach((_, Index) => {
		Parts.push({
			key: `inject-${Index}`,
			...annulus(14 + Index * 3, 2.4, 24),
			method: "injection-ring",
			layer: "core",
			tone: "accent2",
		});
	});
	if (Services.length > 0) {
		Parts.push({
			key: "medallion",
			points: Ornament.ring(9, 24),
			method: "medallion",
			layer: "core",
			tone: "accent",
		});
	}
	if (States.length > 0) {
		Parts.push({
			key: "state",
			...annulus(5, 1.6, 16),
			method: "state-nest",
			layer: "core",
			tone: "accent2",
		});
	}
	const SeamCount = Math.min(6, Seams.length);
	for (let Index = 0; Index < SeamCount; Index += 1) {
		const Angle = (Index * 360) / SeamCount + 11;
		const Inner = Ornament.at(Angle, 38);
		const Outer = Ornament.at(Angle, 41.5);
		Parts.push({
			key: `seam-${Index}`,
			points: [
				Inner,
				Outer,
				{ x: Outer.x + 0.9, y: Outer.y },
				{ x: Inner.x + 0.9, y: Inner.y },
			],
			method: "seam-tick",
			layer: "detail",
			tone: "accent",
		});
	}
	const LedgerCount = Math.min(8, Ledger.length);
	for (let Index = 0; Index < LedgerCount; Index += 1) {
		Parts.push({
			key: `ledger-${Index}`,
			points: Ornament.circleAt((Index * 360) / LedgerCount + 7, 24, 0.9, 6),
			method: "ledger-bead",
			layer: "detail",
			tone: "accent2",
		});
	}
	Transforms.slice(0, 2).forEach((_, Index) => {
		const Angle = Index * 180;
		Parts.push({
			key: `transform-${Index}`,
			points: [
				Ornament.at(Angle - 3, 42),
				Ornament.at(Angle, 36),
				Ornament.at(Angle + 3, 42),
			],
			method: "transform-cusp",
			layer: "detail",
			tone: "accent",
		});
	});
	for (let Index = 0; Index < Rings; Index += 1) {
		Parts.push({
			key: `evolution-${Index}`,
			...annulus(20 + Index * 3, 1.4, 28),
			method: "evolution-ring",
			layer: "detail",
			tone: "accent2",
		});
	}
	for (let Index = 0; Index < Detail; Index += 1) {
		Parts.push({
			key: `detail-${Index}`,
			points: Ornament.circleAt((Index * 360) / Detail + 17, 24, 0.8, 6),
			method: "detail-bead",
			layer: "detail",
			tone: "accent2",
		});
	}
	Parts.push(Residue.core);

	const Components = Parts.map((Part, Index) =>
		piece(Part.key ?? `part-${Index}`, Part.points, { ...Part, depth: Part.depth ?? Index }),
	);
	return { components: Components, closure: Gates.length > 0 ? "open" : "closed" };
};

export const readingOf = (Scene) => {
	const Groups = new Map();
	for (const Component of Scene.components) {
		const Group = Component.composition.collisionGroup;
		Groups.set(Group, (Groups.get(Group) ?? 0) + 1);
	}
	return [...Groups.entries()].map(([Group, Count]) => ({ group: Group, count: Count }));
};
