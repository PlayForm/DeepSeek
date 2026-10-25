// Atlas.mjs - the scene atlas.
//
// Every icon is assembled from solid-colour paths on separated layers. The four
// references supply the vocabulary:
//   - the ornamental sheet: the 14 motif families (Motif.mjs)
//   - the generative examples: recursive division cells and isometric tiles
//   - the emblem: interlocking plates, discs, quadrants, wedges, diagonal splits
//   - the pictogram sheet: one semantic glyph per harness feature
//
// Every shape here is a filled polygon (a solid colour), never a stroke. Layers
// are separated by depth; an upper layer covers the lower one.

import { Ornament } from "./Motif.mjs";
import { digest, stream } from "./Prng.mjs";

const part = (key, layer, tone, points, options = {}) => ({
	key,
	layer,
	tone,
	points,
	closed: options.closed ?? true,
	render: options.render ?? "solid",
	width: 1.1,
	method: options.method ?? "atlas",
	...(options.cutout === undefined ? {} : { cutout: options.cutout }),
});

const square = (Radius, Phase = 45) => Ornament.polygon(4, Radius, Phase);

const rect = (X, Y, Width, Height) => [
	{ x: X, y: Y },
	{ x: X + Width, y: Y },
	{ x: X + Width, y: Y + Height },
	{ x: X, y: Y + Height },
];

const at = (X, Y) => ({ x: X, y: Y });

const Glyphs = {
	chip: () => [
		part("chip-body", "core", "accent", square(9)),
		part("chip-cut", "core", "accent", square(4.5), { cutout: [square(3.4)] }),
		part("chip-pin-a", "core", "accent", rect(45, 36, 10, 2.5)),
		part("chip-pin-b", "core", "accent", rect(45, 61.5, 10, 2.5)),
		part("chip-pin-c", "core", "accent", rect(36, 45, 2.5, 10)),
		part("chip-pin-d", "core", "accent", rect(61.5, 45, 2.5, 10)),
	],
	layers: () => [
		part("layer-a", "core", "accent", rect(40, 40, 20, 3.4)),
		part("layer-b", "core", "accent", rect(38, 47.6, 24, 3.4)),
		part("layer-c", "core", "accent", rect(40, 55.2, 20, 3.4)),
	],
	brackets: () => [
		part("bracket-left", "core", "accent", [
			at(38, 38),
			at(34, 38),
			at(34, 62),
			at(38, 62),
			at(38, 59),
			at(37, 59),
			at(37, 41),
			at(38, 41),
		]),
		part("bracket-right", "core", "accent", [
			at(62, 38),
			at(66, 38),
			at(66, 62),
			at(62, 62),
			at(62, 59),
			at(63, 59),
			at(63, 41),
			at(62, 41),
		]),
		part("bracket-dot", "core", "ink", Ornament.ring(3.4, 16)),
	],
	clock: () => [
		part("clock-face", "core", "accent", Ornament.ring(11, 40), {
			cutout: [Ornament.ring(8.4, 40), rect(48.6, 44, 2.8, 9), rect(50, 48.6, 8, 2.8)],
		}),
	],
	magnifier: () => [
		part("lens", "core", "accent", Ornament.ring(9, 32), { cutout: [Ornament.ring(5.4, 32)] }),
		part("handle", "core", "accent", rect(57, 57, 4.4, 12)),
	],
	grid: () => [
		part("grid-a", "core", "accent", rect(38, 38, 9, 9)),
		part("grid-b", "core", "accent", rect(53, 38, 9, 9)),
		part("grid-c", "core", "accent", rect(38, 53, 9, 9)),
		part("grid-d", "core", "accent", rect(53, 53, 9, 9)),
	],
	shield: () => [
		part("shield-body", "core", "accent", [
			at(50, 34),
			at(66, 40),
			at(64, 56),
			at(50, 68),
			at(36, 56),
			at(34, 40),
		]),
		part("shield-cut", "core", "accent", Ornament.ring(5, 20), {
			cutout: [Ornament.ring(2.6, 20), rect(48.8, 52, 2.4, 8)],
		}),
	],
	gear: () => [
		part(
			"gear-body",
			"core",
			"accent",
			Ornament.star({ Order: 8, Inner: 8, Outer: 13, Bow: 0.1 }),
		),
		part("gear-cut", "core", "accent", Ornament.ring(5, 20), {
			cutout: [Ornament.ring(2.8, 20)],
		}),
	],
	window: () => [
		part("window-body", "core", "accent", square(12, 45)),
		part("window-bar", "core", "accent", rect(38, 38, 24, 3.6)),
		part("window-dot-a", "core", "ink", Ornament.ring(1.4, 8)),
		part("window-dot-b", "core", "ink", Ornament.ring(1.4, 8)),
	],
	book: () => [
		part("book-body", "core", "accent", rect(38, 36, 24, 28)),
		part("book-spine", "core", "accent", rect(41, 36, 2.6, 28)),
	],
	target: () => [
		part("target-1", "core", "accent", Ornament.ring(13, 36), {
			cutout: [Ornament.ring(9.4, 36)],
		}),
		part("target-2", "core", "accent", Ornament.ring(6.6, 28), {
			cutout: [Ornament.ring(3.6, 28)],
		}),
		part("target-3", "core", "ink", Ornament.ring(1.8, 12)),
	],
	chat: () => [
		part("chat-body", "core", "accent", square(12, 45)),
		part("chat-tail", "core", "accent", [at(44, 62), at(50, 62), at(46, 68)]),
		part("chat-dot-a", "core", "ink", Ornament.ring(1.3, 8)),
		part("chat-dot-b", "core", "ink", Ornament.ring(1.3, 8)),
		part("chat-dot-c", "core", "ink", Ornament.ring(1.3, 8)),
	],
	key: () => [
		part("key-bow", "core", "accent", Ornament.ring(7.5, 28), {
			cutout: [Ornament.ring(3.6, 28)],
		}),
		part("key-shaft", "core", "accent", rect(55, 47.6, 15, 4.8)),
		part("key-tooth-a", "core", "accent", rect(64, 52.4, 3.4, 5)),
		part("key-tooth-b", "core", "accent", rect(58, 52.4, 3.4, 5)),
	],
};

const GlyphOf = (Feature) => {
	switch (Feature) {
		case "compaction":
			return "layers";
		case "context":
			return "brackets";
		case "session":
			return "clock";
		case "session-query":
			return "magnifier";
		case "workspace":
			return "grid";
		case "guard":
			return "shield";
		case "preset":
			return "gear";
		case "client":
			return "window";
		case "skill":
			return "book";
		case "web":
			return "magnifier";
		case "tools":
			return "gear";
		case "schedule":
			return "clock";
		case "goal":
			return "target";
		case "subagent":
			return "grid";
		case "workflow":
			return "layers";
		case "credentials":
			return "key";
		case "interaction":
			return "chat";
		default:
			return "chip";
	}
};

const wedge = (Angle, Inner, Outer, Spread) => {
	const Points = [];
	for (let Index = 0; Index <= 6; Index += 1) {
		Points.push(Ornament.at(Angle - Spread / 2 + (Spread * Index) / 6, Outer));
	}
	for (let Index = 6; Index >= 0; Index -= 1) {
		Points.push(Ornament.at(Angle - Spread / 2 + (Spread * Index) / 6, Inner));
	}
	return Points;
};

export const atlasOf = (Genome, Plan) => {
	const Profile = Genome.profile ?? {};
	const Seed = Number.parseInt(String(Genome.seed).slice(0, 6), 16) || 1;
	const Random = stream(digest(`${Seed}atlas`));
	const Parts = [];

	Parts.push(part("plate", "frame", "tint", square(46, 45)));
	Parts.push(
		part("disc", "frame", "accent2", Ornament.ring(37, 40), {
			cutout: [Ornament.ring(26, 40)],
		}),
	);

	if (Plan.role === "renderer" || Plan.role === "orchestrator" || Plan.role === "analyzer") {
		for (let Index = 0; Index < 4; Index += 1) {
			Parts.push(
				part(
					`quadrant-${Index}`,
					"body",
					Index % 2 === 0 ? "ink" : "accent",
					wedge(45 + Index * 90, 0, 30, 90),
				),
			);
		}
	}
	if (Plan.role === "interceptor" || Plan.role === "router") {
		Parts.push(part("split", "frame", "tint", [at(6, 94), at(94, 6), at(6, 6)]));
	}
	if (Plan.role === "governor" || Plan.role === "store") {
		Parts.push(
			part("ring", "frame", "accent2", Ornament.ring(41, 48), {
				cutout: [Ornament.ring(38.4, 48)],
			}),
		);
	}
	const Spokes = Math.min(8, 6 + (Plan.order ?? 4) / 2);
	for (let Index = 0; Index < Spokes; Index += 1) {
		const Angle = (Index * 360) / Spokes + (Plan.phase ?? 0);
		Parts.push(
			part(
				`spoke-${Index}`,
				"detail",
				"accent",
				[Ornament.at(Angle, 30), Ornament.at(Angle, 36)],
				{ render: "ribbon", closed: false },
			),
		);
	}

	const Feature = typeof Profile.feature === "string" ? Profile.feature : "core";
	Parts.push(...Glyphs[GlyphOf(Feature)]());

	return Parts;
};

export const glyphsOf = () => Object.keys(Glyphs);
