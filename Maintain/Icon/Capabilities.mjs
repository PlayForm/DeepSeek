// Capabilities.mjs - the advanced feature set the libraries make possible, as
// operations the matrix can impose, infer or disable per cell.
//
// Each capability names the library that would back it in production and how it
// is implemented today:
//
//   capability          library (production)   now
//   parallelContour     paperjs-offset         in-house offset (Envelope)
//   booleanCutout       Clipper2               in-house even-odd subpaths
//   wedgeCut            Clipper2               in-house wedge polygons
//   taperWidth          perfect-freehand       in-house width profile
//   pressureRibbon      perfect-freehand       in-house width profile
//   beadsAlong          svg-path-properties    in-house arc-length sampling
//   ticksAlong          svg-path-properties    in-house arc-length sampling
//   weave               (none - composition)   in-house overlap allowance
//   nest                (none - composition)   in-house scaled copy
//   breakSymmetry       (none - composition)   in-house single-copy mutation
//   denseRepeat         (none - composition)   in-house count scaling
//
// The matrix chooses which capabilities a cell carries; the scene builder turns
// them into components. "Impose" = the feature forces it on, "infer" = the seed
// or the level picks it, "disable" = the feature forbids it.

import { dotRing, pathOf } from "./Curve.mjs";

const number = (Value) => Math.round(Value * 10) / 10;

/** The arc-length table of a polyline. */
const lengthsOf = (Points) => {
	const Lengths = [0];
	for (let Index = 1; Index < Points.length; Index += 1) {
		Lengths.push(
			Lengths[Index - 1] +
				Math.hypot(
					Points[Index].x - Points[Index - 1].x,
					Points[Index].y - Points[Index - 1].y,
				),
		);
	}
	return Lengths;
};

/** The point and tangent at a fraction of the polyline's length. */
export const pointAt = (Points, Fraction) => {
	const Lengths = lengthsOf(Points);
	const Total = Lengths[Lengths.length - 1] || 1;
	const Target = Math.max(0, Math.min(1, Fraction)) * Total;
	let Index = 1;
	while (Index < Lengths.length - 1 && Lengths[Index] < Target) {
		Index += 1;
	}
	const Span = Lengths[Index] - Lengths[Index - 1] || 1;
	const Ratio = (Target - Lengths[Index - 1]) / Span;
	const Point = {
		x: Points[Index - 1].x + (Points[Index].x - Points[Index - 1].x) * Ratio,
		y: Points[Index - 1].y + (Points[Index].y - Points[Index - 1].y) * Ratio,
	};
	const Tangent = {
		x: (Points[Index].x - Points[Index - 1].x) / Span,
		y: (Points[Index].y - Points[Index - 1].y) / Span,
	};
	return { point: Point, tangent: Tangent, length: Total };
};

/** n points at equal arc length, with their tangents (svg-path-properties role). */
export const along = (Points, Count, Phase = 0) =>
	Array.from({ length: Count }, (_, Index) => pointAt(Points, (Index + Phase) / Count));

/** Beads along any centerline: small closed circles at equal spacing. */
export const beadsAlong = (Points, Count, Dot = 0.8, Phase = 0) =>
	along(Points, Count, Phase).map(({ point }) => {
		const Ring = [];
		for (let Step = 0; Step < 6; Step += 1) {
			const Angle = (Step * 2 * Math.PI) / 6;
			Ring.push({ x: point.x + Dot * Math.cos(Angle), y: point.y + Dot * Math.sin(Angle) });
		}
		return Ring;
	});

/** Ticks along any centerline, oriented by the tangent. */
export const ticksAlong = (Points, Count, Length = 1.6, Phase = 0) =>
	along(Points, Count, Phase).map(({ point, tangent }) => {
		const Normal = { x: -tangent.y, y: tangent.x };
		return [
			{ x: point.x - Normal.x * Length, y: point.y - Normal.y * Length },
			{ x: point.x + Normal.x * Length, y: point.y + Normal.y * Length },
		];
	});

/** Parallel contours: the centerline offset by ±Distance (paperjs-offset role). */
export const parallelContours = (Points, Width, Distance = 1.2) => {
	const Contours = [];
	for (const Side of [1, -1]) {
		const Offset = Points.map((Entry, Index) => {
			const Previous = Points[(Index - 1 + Points.length) % Points.length];
			const Next = Points[(Index + 1) % Points.length];
			const Forward = { x: Next.x - Entry.x, y: Next.y - Entry.y };
			const Backward = { x: Entry.x - Previous.x, y: Entry.y - Previous.y };
			const Mixed = { x: Forward.x + Backward.x, y: Forward.y + Backward.y };
			const Scale = Math.hypot(Mixed.x, Mixed.y) || 1;
			const Normal = { x: -Mixed.y / Scale, y: Mixed.x / Scale };
			return {
				x: Entry.x + Normal.x * (Width / 2 + Distance) * Side,
				y: Entry.y + Normal.y * (Width / 2 + Distance) * Side,
			};
		});
		Contours.push(Offset);
	}
	return Contours;
};

/** Wedge cutouts on a ring: n angular wedges subtracted from the body. */
export const wedgeCutouts = (Radius, Count, Spread = 8, Inner = 0) =>
	Array.from({ length: Count }, (_, Index) => {
		const Angle = (Index * 360) / Count;
		const Points = [];
		const Start = ((Angle - Spread / 2) * Math.PI) / 180;
		const End = ((Angle + Spread / 2) * Math.PI) / 180;
		for (let Step = 0; Step <= 4; Step += 1) {
			const A = Start + ((End - Start) * Step) / 4;
			Points.push({ x: 50 + Radius * Math.cos(A), y: 50 + Radius * Math.sin(A) });
		}
		for (let Step = 4; Step >= 0; Step -= 1) {
			const A = Start + ((End - Start) * Step) / 4;
			Points.push({ x: 50 + Inner * Math.cos(A), y: 50 + Inner * Math.sin(A) });
		}
		return Points;
	});

/** A pressure profile: a smooth swell from a thin start to a thin end. */
export const pressureProfile = (Points, Peak) =>
	Points.map((_, Index) => {
		const Ratio = Points.length === 1 ? 0.5 : Index / (Points.length - 1);
		return 0.5 + Peak * Math.sin(Math.PI * Ratio);
	});

/** The capability registry, with the library each one maps to in production. */
export const Capabilities = {
	parallelContour: { library: "paperjs-offset", state: "in-house" },
	booleanCutout: { library: "Clipper2", state: "in-house" },
	wedgeCut: { library: "Clipper2", state: "in-house" },
	taperWidth: { library: "perfect-freehand", state: "in-house" },
	pressureRibbon: { library: "perfect-freehand", state: "in-house" },
	beadsAlong: { library: "svg-path-properties", state: "in-house" },
	ticksAlong: { library: "svg-path-properties", state: "in-house" },
	weave: { library: "composition", state: "in-house" },
	nest: { library: "composition", state: "in-house" },
	breakSymmetry: { library: "composition", state: "in-house" },
	denseRepeat: { library: "composition", state: "in-house" },
};

/** Export helper: the path of a cutout ring (even-odd holes). */
export const cutoutPathOf = (Envelope, Cutouts) =>
	`${Envelope} ${Cutouts.map((Polygon) => `${pathOf(Polygon, true)}`).join(" ")}`;

/** Export helper: a bead ring as its own path. */
export const beadPathOf = (Radius, Count, Dot = 0.8, Phase = 0) =>
	dotRing({ Radius, Count, Dot, OffsetAngle: Phase })
		.map((Ring) => pathOf(Ring, true))
		.join(" ");

/** The number formatting the capabilities share. */
export const round = number;
