// Transliterate.mjs - the code-to-visual translation.
//
// Takes one package's plan (motif family, symmetry, style) and its inferred
// semantic tokens, and emits the component scene. The motif supplies the
// construction; every semantic fact the package actually has attaches one
// further layer: a medallion for the service it provides, halo rings for the
// services it injects, gate loops for the events it subscribes to, seam ticks
// for its ordering seams, ledger beads for its ledger lines, and wedge cutouts
// for the paths it refuses.

import { rotatePoints, scalePoints } from "./Envelope.mjs";
import { angleOf } from "./Lexicon.mjs";
import { familyOf, Ornament } from "./Motif.mjs";
import { digest, stream } from "./Prng.mjs";

const Weight = (Layer) => (Layer === "frame" || Layer === "body" ? 1.4 : 1.2);

const piece = (Id, Points, Options = {}) => ({
	id: Id,
	centerline: Points,
	geometry: {
		method: Options.method ?? "motif",
		topology: Options.closed === false ? "open" : "closed",
	},
	stroke: {
		width: Math.round((Options.width ?? 1.4) * Weight(Options.layer) * 10) / 10,
		join: Options.join ?? "round",
		start: Options.start ?? "butt",
		end: Options.end ?? "butt",
		outlineWidth: Options.outline ?? 0.7,
		widthProfile: Options.profile ?? "constant",
	},
	composition: {
		operation: Options.operation ?? "paint",
		collisionGroup: Options.layer ?? "body",
	},
	material: { tone: Options.tone ?? "ink" },
	...(Options.cutout === undefined ? {} : { cutout: Options.cutout }),
	...(Options.fill === undefined ? {} : { fill: Options.fill }),
});

const motifOf = (Plan, Seed) => {
	const Random = stream(digest(`${Seed}motif`));
	const Parts = familyOf(Plan.family, { Order: Plan.order, Seed, Random });
	const Phase =
		Plan.family === "divisionTile" || Plan.family === "isometricTiles"
			? 0
			: Random.pick([0, 15, 30, 45, 60, 90]);
	const Scale = 0.92 + (Random.next() % 9) / 100;
	return Parts.map((Part) => ({
		...Part,
		points: scalePoints(rotatePoints(Part.points, Phase), Scale),
	}));
};

const semanticsOf = (Tokens, Plan, Seed) => {
	const Parts = [];
	const Gates = Tokens.gate ?? [];
	const Seams = Tokens.seam ?? [];
	const Ledger = Tokens.ledger ?? [];
	const Services = Tokens.service ?? [];
	const Injections = Tokens.injection ?? [];
	const Tools = Tokens.tool ?? [];
	const Streams = Tokens.stream ?? [];
	const States = Tokens.state ?? [];
	const Transforms = Tokens.transform ?? [];

	for (let Index = 0; Index < Math.min(2, Injections.length); Index += 1) {
		Parts.push({
			key: `inject-${Index}`,
			points: Ornament.ring(15 + Index * 3, 36),
			closed: true,
			width: 0.7,
			method: "injection-ring",
			layer: "core",
			tone: "accent2",
		});
	}
	Gates.slice(0, 6).forEach((Name, Index) => {
		Parts.push({
			key: `gate-${Index}`,
			points: Ornament.loop(angleOf(Name, Seed), 30, 2.4),
			closed: true,
			width: 0.9,
			method: "gate-loop",
			layer: "detail",
			tone: "accent",
		});
	});
	const SeamCount = Math.min(8, Seams.length);
	for (let Index = 0; Index < SeamCount; Index += 1) {
		Parts.push({
			key: `seam-${Index}`,
			points: Ornament.tick((Index * 360) / SeamCount + 11, 31, 2.5),
			closed: false,
			width: 1.0,
			method: "seam-tick",
			layer: "detail",
			tone: "accent2",
		});
	}
	const LedgerCount = Math.min(10, Ledger.length);
	for (let Index = 0; Index < LedgerCount; Index += 1) {
		Parts.push({
			key: `ledger-${Index}`,
			points: Ornament.circleAt((Index * 360) / LedgerCount + 7, 29, 0.9, 6),
			closed: true,
			width: 0.6,
			method: "ledger-bead",
			layer: "detail",
			tone: "accent2",
		});
	}
	Tools.slice(0, 6).forEach((Name, Index) => {
		Parts.push({
			key: `tool-${Index}`,
			points: Ornament.circleAt(angleOf(Name, Seed + 3), 26, 1.4, 6),
			closed: true,
			width: 0.7,
			method: "tool-bead",
			layer: "detail",
			tone: "accent",
		});
	});
	if (Streams.length > 0) {
		Parts.push({
			key: "stream",
			points: Ornament.spiralAt(50, 50, 13, 0.9, 12),
			closed: false,
			width: 1.0,
			method: "stream-spiral",
			layer: "body",
			tone: "accent2",
		});
	}
	if (States.length > 0) {
		Parts.push({
			key: "state-1",
			points: Ornament.ring(5, 16),
			closed: true,
			width: 1.0,
			method: "state-nest",
			layer: "core",
			tone: "accent2",
		});
		Parts.push({
			key: "state-2",
			points: Ornament.ring(7.5, 20),
			closed: true,
			width: 0.8,
			method: "state-nest",
			layer: "core",
			tone: "accent2",
		});
	}
	if (Transforms.length > 0) {
		Parts.push({
			key: "transform-a",
			points: Ornament.spike({ Angle: 0, Inner: 36, Outer: 46, HalfWidth: 2 }),
			closed: true,
			width: 0.9,
			method: "transform-cusp",
			layer: "detail",
			tone: "accent",
		});
		Parts.push({
			key: "transform-b",
			points: Ornament.spike({ Angle: 180, Inner: 36, Outer: 46, HalfWidth: 2 }),
			closed: true,
			width: 0.9,
			method: "transform-cusp",
			layer: "detail",
			tone: "accent",
		});
	}
	return { parts: Parts, services: Services.length };
};

export const sceneOf = (Genome, Plan) => {
	const Manifest = Genome.manifest ?? { tokens: {} };
	const Tokens = Manifest.tokens ?? {};
	const Seed = Number.parseInt(String(Genome.seed).slice(0, 6), 16) || 1;
	const Motif = motifOf(Plan, Seed);
	const { parts, services } = semanticsOf(Tokens, Plan, Seed);
	const Traces = Tokens.trace ?? [];
	const Fill = Plan.fill === "none" ? undefined : Plan.fill;

	if (Traces.length > 0) {
		const Body = Motif.find((Part) => Part.layer === "body");
		if (Body !== undefined) {
			parts.push({
				key: "trace",
				points: scalePoints(Body.points, 1.06),
				closed: Body.closed,
				width: 0.6,
				method: "trace-echo",
				layer: "frame",
				tone: "accent2",
			});
		}
	}
	if (services > 0 && !Motif.some((Part) => Part.layer === "core")) {
		parts.push({
			key: "medallion",
			points: Ornament.ring(10 + Math.min(2, services), 28),
			closed: true,
			width: 1.4,
			method: "medallion",
			layer: "core",
			fill: Fill,
		});
	}

	const Raw = [...Motif, ...parts];
	const Rings = Math.min(3, Plan.mutations?.rings ?? 0);
	for (let Index = 0; Index < Rings; Index += 1) {
		Raw.push({
			key: `evolution-${Index}`,
			points: Ornament.ring(20 + Index * 3, 32),
			closed: true,
			width: 0.6,
			method: "evolution-ring",
			layer: "detail",
			tone: "accent2",
		});
	}
	const Components = Raw.map((Part, Index) =>
		piece(Part.key ?? `part-${Index}`, Part.points, Part),
	);
	if (Fill !== undefined) {
		const Core = Components.find(
			(Component) => Component.composition.collisionGroup === "core",
		);
		if (Core !== undefined) {
			Core.fill = Fill;
		}
	}
	return {
		components: Components,
		closure: (Tokens.gate ?? []).length > 0 ? "open" : "closed",
	};
};

export const readingOf = (Scene) => {
	const Groups = new Map();
	for (const Component of Scene.components) {
		const Group = Component.composition.collisionGroup;
		Groups.set(Group, (Groups.get(Group) ?? 0) + 1);
	}
	return [...Groups.entries()].map(([Group, Count]) => ({ group: Group, count: Count }));
};
