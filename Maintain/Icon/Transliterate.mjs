// Transliterate.mjs - the code-to-visual translation: semantic tokens in, a
// layered scene of components out (and, through Lexicon.readLayer, back).
//
// Each lexicon entry owns a layer and a glyph. A token's NAME decides its angle
// (angleOf), so the same gate lands in the same place on every build; the token
// count decides how many glyphs; the zone decides the radius band. The body
// always carries the grammar's anchor ring, so the icon still reads as its kind.

import { arc, circle, cusp, hook, lobedRing, spiral, superellipse } from "./Curve.mjs";
import { angleOf, Lexicon } from "./Lexicon.mjs";
import { stream } from "./Prng.mjs";

const at = (Angle, Radius) => ({
	x: 50 + Radius * Math.cos((Angle * Math.PI) / 180),
	y: 50 + Radius * Math.sin((Angle * Math.PI) / 180),
});

const dot = (X, Y, Radius = 1.2) => {
	const Points = [];
	for (let Step = 0; Step < 6; Step += 1) {
		const Angle = (Step * 2 * Math.PI) / 6;
		Points.push({ x: X + Radius * Math.cos(Angle), y: Y + Radius * Math.sin(Angle) });
	}
	return Points;
};

const part = (id, centerline, options = {}) => ({
	id,
	centerline,
	geometry: { method: options.method ?? "token", topology: options.topology ?? "open" },
	stroke: {
		width: options.width ?? 1.6,
		join: options.join ?? "round",
		start: options.start ?? "butt",
		end: options.end ?? "butt",
		outlineWidth: 0.7,
		widthProfile: options.widthProfile ?? "constant",
	},
	composition: {
		operation: options.operation ?? "paint",
		collisionGroup: options.group ?? "body",
	},
	material: { tone: options.tone ?? "ink" },
	...(options.cutout === undefined ? {} : { cutout: options.cutout }),
	...(options.decorate === undefined ? {} : { decorate: options.decorate }),
});

/** The grammar's anchor ring, always present: the icon still reads as its kind. */
const anchorOf = (Plan) => {
	if (Plan.grammar === "interlace-tile") {
		return part(
			"anchor",
			superellipse({ Radius: 28, Power: Plan.variant === 1 ? 3 : 4, Samples: 64, Phase: 45 }),
			{
				method: "closed-ring",
				topology: "closed",
				width: 1.8,
				join: "miter",
			},
		);
	}
	if (Plan.grammar === "quatrefoil") {
		return part(
			"anchor",
			lobedRing({
				Lobes: Plan.order === 8 ? 8 : 4,
				Inner: 10,
				Amplitude: 20,
				Power: 2,
				Samples: 96,
			}),
			{
				method: "closed-ring",
				topology: "closed",
				width: 1.8,
				join: "round",
			},
		);
	}
	if (Plan.grammar === "crescent-ring") {
		return part(
			"anchor",
			lobedRing({ Lobes: Plan.order, Inner: 16, Amplitude: 11, Power: 2, Samples: 96 }),
			{
				method: "closed-ring",
				topology: "closed",
				width: 1.8,
				join: "round",
			},
		);
	}
	return part(
		"anchor",
		lobedRing({ Lobes: Plan.order, Inner: 10, Amplitude: 20, Power: 4, Samples: 96 }),
		{
			method: "closed-ring",
			topology: "closed",
			width: 1.8,
			join: "miter",
		},
	);
};

/** One lexicon entry's glyphs, placed by the tokens' own names. */
const glyphsOf = (Entry, Values, Plan, Seed, Random) => {
	const Count = Entry.count(Values);
	const Components = [];
	switch (Entry.glyph) {
		case "hook":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = angleOf(Values[Index], Seed);
				Components.push(
					part(`gate-${Index}`, hook({ Angle, Radius: 27, Spread: 58, Samples: 12 }), {
						method: "hook",
						width: 1.8,
						tone: Index % 2 === 0 ? "ink" : "accent",
						group: "gate",
					}),
				);
			}
			break;
		case "bead":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = angleOf(Values[Index], Seed);
				const Position = at(Angle, 42);
				Components.push(
					part(`tool-${Index}`, dot(Position.x, Position.y, 1.2), {
						method: "bead",
						topology: "closed",
						width: 0.6,
						tone: "accent",
						group: "tool",
					}),
				);
			}
			break;
		case "beads":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = (Index * 360) / Count + 15;
				const Position = at(Angle, 32);
				Components.push(
					part(`ledger-${Index}`, dot(Position.x, Position.y, 0.7), {
						method: "bead",
						topology: "closed",
						width: 0.5,
						tone: "accent2",
						group: "ledger",
					}),
				);
			}
			break;
		case "void":
			Components.push(
				part("service", superellipse({ Radius: 6, Power: 1, Samples: 32, Phase: 45 }), {
					method: "void",
					topology: "closed",
					width: 1.4,
					join: "miter",
					tone: "accent",
					group: "core",
				}),
			);
			break;
		case "ring":
			for (let Index = 0; Index < Count; Index += 1) {
				Components.push(
					part(`inject-${Index}`, circle({ Radius: 32.5 + Index * 1.5, Samples: 48 }), {
						method: "ring",
						topology: "closed",
						width: 1.1,
						tone: "accent",
						group: "evolution",
					}),
				);
			}
			break;
		case "tick":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = (Index * 360) / Count;
				Components.push(
					part(`seam-${Index}`, [at(Angle, 44), at(Angle, 46.5)], {
						method: "tick",
						width: 1.6,
						join: "miter",
						tone: "accent",
						group: "seam",
					}),
				);
			}
			break;
		case "wedgeCut": {
			const Cutouts = [];
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = (Index * 360) / Count;
				const Wedge = [];
				for (let Step = 0; Step <= 4; Step += 1) {
					const A = Angle - 4 + (Step * 8) / 4;
					Wedge.push(at(A, 47));
				}
				for (let Step = 4; Step >= 0; Step -= 1) {
					const A = Angle - 4 + (Step * 8) / 4;
					Wedge.push(at(A, 40));
				}
				Cutouts.push(Wedge);
			}
			Components.push(
				part("rim", superellipse({ Radius: 45, Power: 4, Samples: 64, Phase: 45 }), {
					method: "rim",
					topology: "closed",
					width: 1.8,
					join: "miter",
					tone: "accent",
					group: "rim",
					cutout: Cutouts,
				}),
			);
			break;
		}
		case "cusp":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = angleOf(Values[Index], Seed);
				Components.push(
					part(`transform-${Index}`, cusp({ Angle, Radius: 22, Spread: 20, Rise: 5 }), {
						method: "cusp",
						width: 1.6,
						join: "miter",
						tone: "accent",
						group: "transform",
					}),
				);
			}
			break;
		case "spiral":
			for (let Index = 0; Index < Count; Index += 1) {
				const Angle = angleOf(Values[Index], Seed);
				Components.push(
					part(
						`stream-${Index}`,
						spiral({ Angle, Radius: 27, Turns: 0.8, Samples: 18 }),
						{ method: "spiral", width: 1.5, tone: "accent", group: "stream" },
					),
				);
			}
			break;
		case "nest":
			Components.push(
				part("state-1", circle({ Radius: 5.5, Samples: 32 }), {
					method: "nest",
					topology: "closed",
					width: 1.2,
					tone: "accent",
					group: "core",
				}),
			);
			Components.push(
				part("state-2", circle({ Radius: 3, Samples: 24 }), {
					method: "nest",
					topology: "closed",
					width: 1,
					tone: "accent2",
					group: "core",
				}),
			);
			break;
		case "parallel": {
			const Ring = circle({ Radius: 24, Samples: 48 });
			Components.push(
				part("trace-1", Ring, {
					method: "parallel",
					topology: "closed",
					width: 1.1,
					tone: "accent",
					group: "trace",
				}),
			);
			Components.push(
				part("trace-2", circle({ Radius: 26.4, Samples: 48 }), {
					method: "parallel",
					topology: "closed",
					width: 1.1,
					tone: "accent2",
					group: "trace",
				}),
			);
			break;
		}
		default:
			break;
	}
	return Components;
};

/** The transliteration of one package: its tokens become a layered scene. */
export const sceneOf = (Genome, Plan, Manifest) => {
	const Seed = Number.parseInt(Genome.seed.slice(0, 6), 16) || 1;
	const Random = stream(`${Genome.seed}transliterate`);
	const Components = [anchorOf(Plan)];
	for (const Entry of Lexicon) {
		const Values = Manifest.tokens[Entry.token] ?? [];
		if (Values.length === 0) {
			continue;
		}
		Components.push(...glyphsOf(Entry, Values, Plan, Seed, Random));
	}
	// the fill treatment is a per-package material, applied to the anchor
	if (Plan.fill === "tint") {
		Components[0].fill = "tint";
	}
	if (Plan.fill === "solid") {
		const Core = Components.find(
			(Component) => Component.composition.collisionGroup === "core",
		);
		if (Core !== undefined) {
			Core.fill = "solid";
		}
	}
	return { components: Components, closure: Manifest.tokens.gate.length > 0 ? "open" : "closed" };
};

/** The reverse reading: the scene's layers back into semantics. */
export const readingOf = (Scene) => {
	const Groups = new Map();
	for (const Component of Scene.components) {
		const Group = Component.composition.collisionGroup;
		Groups.set(Group, (Groups.get(Group) ?? 0) + 1);
	}
	return [...Groups.entries()].map(([Group, Count]) => ({ group: Group, count: Count }));
};
