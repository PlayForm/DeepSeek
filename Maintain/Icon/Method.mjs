// Method.mjs - the construction-method pool (ICON-METHODS.md section 4).
//
// The reference sheet is a method library, not a shape library: 17 of its 29
// motifs carry an OPEN stroke (a ray that stops, a hook that curls into nothing,
// a needle, a woven band), and the rest are closed tiles and rings. This module
// holds both vocabularies as parts, so the composer can mix them per package.
//
// A part is { d, tone, fill?, open? }:
//   tone  "ink" | "accent" | "accent2"
//   fill  "tint" | "solid" | "ink"  (a filled method, drawn under its stroke)
//   open  true when the path must NOT be closed (the terminal is the point)

import {
	arc,
	circle,
	cusp,
	dotRing,
	hook,
	lobedRing,
	needle,
	pathOf,
	ray,
	spiral,
	superellipse,
	taper,
	tickRing,
	waveRing,
	zigzag,
} from "./Curve.mjs";

const part = (Points, tone, options = {}) => ({
	points: Points,
	closed: options.close ?? true,
	width: options.width,
	d: pathOf(Points, options.close ?? true),
	tone,
	...(options.fill === undefined ? {} : { fill: options.fill }),
	...(options.open === undefined ? {} : { open: options.open }),
});

// ---------------------------------------------------------------- closed pool

/** A closed function ring: the containment method. */
export const closedRing = ({
	Radius,
	Power = 3,
	Lobes = 4,
	Inner,
	Amplitude,
	Phase = 0,
	tone = "ink",
}) =>
	Inner === undefined
		? part(superellipse({ Radius, Power, Samples: 128, Phase }), tone)
		: part(lobedRing({ Lobes, Inner, Amplitude, Power, Samples: 168, Phase }), tone);

/** Two concentric closed lines: the double-outline method. */
export const doubleRing = ({ Radius, Inset = 3.5, Power = 3, Phase = 0, tone = "ink" }) => [
	part(superellipse({ Radius, Power, Samples: 128, Phase }), tone),
	part(superellipse({ Radius: Radius - Inset, Power, Samples: 112, Phase }), "accent"),
];

/** A closed square or diamond frame: the tile method. */
export const squareFrame = ({ Half = 44, Power = 5, Phase = 45, tone = "accent" }) =>
	part(superellipse({ Radius: Half, Power, Samples: 128, Phase }), tone);

/** A thick closed diamond with an inner void: the void method. */
export const voidDiamond = ({ Half = 40, Thickness = 8, tone = "ink" }) => [
	part(superellipse({ Radius: Half, Power: 1, Samples: 128, Phase: 45 }), tone),
	part(superellipse({ Radius: Half - Thickness, Power: 1, Samples: 112, Phase: 45 }), "accent"),
];

/** A filled quadrant wedge: the block method. */
export const filledWedge = ({ Angle, Inner = 8, Outer = 28, Spread = 40, tone = "ink" }) => {
	const Points = [];
	for (let Index = 0; Index <= 8; Index += 1) {
		Points.push(
			...[arc({ Radius: Inner, From: Angle - Spread, To: Angle + Spread, Samples: 8 })[0]],
		);
	}
	const Left = arc({ Radius: Outer, From: Angle - Spread, To: Angle + Spread, Samples: 10 });
	const Right = arc({
		Radius: Inner,
		From: Angle - Spread,
		To: Angle + Spread,
		Samples: 10,
	}).reverse();
	return part([...Right, ...Left], tone, { fill: "ink" });
};

/** An open square quadrant with an inset line: the quadrant method. */
export const quadrantBlock = ({ Angle, Inner = 12, Outer = 28, Inset = 4, tone = "accent" }) => {
	const Corner = (Radius, Offset) =>
		arc({ Radius, From: Angle - 40 + Offset, To: Angle + 40 - Offset, Samples: 10 });
	return [
		part([...Corner(Outer, 0), ...Corner(Inner, Inset).reverse()], tone, {
			open: true,
			close: false,
		}),
		part(Corner(Outer - Inset, Inset), "accent2", { open: true, close: false }),
	];
};

/** A woven band pair: the interlace method (confined to one band, never crossing another zone). */
export const interlaceBand = ({
	Count = 6,
	Radius = 35,
	Width = 4,
	Phase = 0,
	tone = "accent",
}) => {
	const Parts = [part(circle({ Radius: Radius - Width, Samples: 96 }), "ink")];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = Phase + (Index * 360) / Count;
		Parts.push(
			part(
				arc({ Radius, From: Angle - 4, To: Angle + 4, Samples: 6 }),
				Index % 2 === 0 ? tone : "ink",
				{
					open: true,
					close: false,
				},
			),
		);
	}
	return Parts;
};

/** Open spokes plus arcs: the web method. */
export const webLattice = ({ Spokes = 8, Inner = 12, Outer = 30, Radii = [], tone = "ink" }) => {
	const Parts = [];
	for (let Index = 0; Index < Spokes; Index += 1) {
		const Angle = (Index * 360) / Spokes;
		Parts.push(part(needle({ Angle, Inner, Outer }), tone, { open: true, close: false }));
	}
	for (const Radius of Radii) {
		Parts.push(part(circle({ Radius, Samples: 96 }), "accent"));
	}
	return Parts;
};

// ------------------------------------------------------------------ open pool

/** An open ray to a sharp tip: the pointed method. */
export const openRay = ({ Angle, Inner = 12, Outer = 34, Bend = 0, tone = "ink" }) =>
	part(ray({ Angle, Inner, Outer, Bend }), tone, { open: true, close: false });

/** An open needle through the motif: the needle method. */
export const openNeedle = ({ Angle, Inner = 10, Outer = 34, tone = "ink" }) =>
	part(needle({ Angle, Inner, Outer }), tone, { open: true, close: false });

/** An open S that curls inward and stops: the hook method. */
export const openHook = ({
	Angle,
	Radius = 26,
	Curl = 0.55,
	Direction = 1,
	Spread = 72,
	tone = "ink",
}) => part(hook({ Angle, Radius, Curl, Direction, Spread }), tone, { open: true, close: false });

/** An open spiral: the spiral method. */
export const openSpiral = ({ Angle, Radius = 26, Turns = 1.4, Direction = 1, tone = "accent" }) =>
	part(spiral({ Angle, Radius, Turns, Direction }), tone, { open: true, close: false });

/** Two arcs meeting at a sharp point: the cusp method. */
export const cuspPair = ({ Angle, Radius = 26, Spread = 24, Rise = 5, tone = "ink" }) =>
	part(cusp({ Angle, Radius, Spread, Rise }), tone, { open: true, close: false });

/** A filled tapered spike: wide base, point at the tip (the sheet's solid spikes). */
export const taperSpike = ({ Angle, Inner = 10, Outer = 32, HalfWidth = 6, tone = "ink" }) =>
	part(taper({ Angle, Inner, Outer, HalfWidth }), tone, { fill: "ink" });

/** A bead string on a circle: the bead method (dots with air between them). */
export const beadString = ({ Radius = 20, Count = 8, Dot = 0.9, Phase = 0, tone = "accent" }) =>
	dotRing({ Radius, Count, Dot, OffsetAngle: Phase }).map((Ring) => part(Ring, tone));

/** Dots on a common radius: the orbit method. */
export const dotOrbit = ({ Radius = 42, Count = 8, Dot = 1.3, Phase = 0, tone = "accent" }) =>
	dotRing({ Radius, Count, Dot, OffsetAngle: Phase }).map((Ring) => part(Ring, tone));

/** A scalloped rim: the scallop method. */
export const scallopEdge = ({ Radius = 45, Lobes = 8, tone = "accent" }) => [
	part(waveRing({ Radius, Amplitude: 1.4, Lobes, Samples: 168 }), tone),
];

/** An open zigzag rim: the chevron method. */
export const chevronEdge = ({ Radius = 45, Teeth = 12, Depth = 2.5, tone = "accent" }) =>
	part(zigzag({ Radius, Teeth, Depth }), tone, { open: true, close: false });

/** A ring of open ticks: the tick method. */
export const tickOrbit = ({ Radius = 41, Count = 8, Length = 2.5, Phase = 0, tone = "accent" }) =>
	tickRing({ Radius, Count, Length, OffsetAngle: Phase }).map((Tick) =>
		part(Tick, tone, { open: true, close: false }),
	);
