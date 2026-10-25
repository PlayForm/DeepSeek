// Envelope.mjs - stroke envelopes, terminals, joins, footprints and clearance.
//
// The pipeline this file implements (the corrected one):
//
//   centerline -> placement transform -> stroke envelope -> cutouts/clipping
//   -> boundary contour and variant decorations -> projected clearance -> serialize
//
// An SVG stroke is centred on its path, so "drawing the same line twice" is not
// an outline. The envelope is the area a stroke occupies; the contour is the
// envelope grown by a hairline; the FOOTPRINT is envelope + contour (+ any
// decoration such as the Effect-TS echo), and clearance is measured between
// footprints, never between centerlines:
//
//   d >= gap + c1/2 + c2/2
//
// where c1, c2 are the contour widths of the two components.

const number = (Value) => {
	const Rounded = Math.round(Value * 10) / 10;
	return Object.is(Rounded, -0) ? "0" : String(Rounded);
};

const point = (Value) => `${number(Value.x)},${number(Value.y)}`;
const length = (Vector) => Math.hypot(Vector.x, Vector.y) || 1;

/** Unit tangent at each vertex (averaged when closed). */
const tangentsOf = (Points, Closed) =>
	Points.map((Entry, Index) => {
		const Next = Points[(Index + 1) % Points.length];
		const Previous = Points[(Index - 1 + Points.length) % Points.length];
		const Forward = { x: Next.x - Entry.x, y: Next.y - Entry.y };
		const Backward = { x: Entry.x - Previous.x, y: Entry.y - Previous.y };
		const Use = Closed ? { x: Forward.x + Backward.x, y: Forward.y + Backward.y } : length(Forward) === 0 ? Backward : Forward;
		const Scale = length(Use);
		return { x: Use.x / Scale, y: Use.y / Scale };
	});

/** The left normal of a tangent. */
const normalOf = (Tangent) => ({ x: -Tangent.y, y: Tangent.x });

/**
 * Offset a polyline by a per-point distance (a number or a per-point array).
 * Join modes: miter (averaged normal, the sharp default), bevel (cut corner),
 * round (averaged across three normals).
 */
export const offsetPolyline = (Points, Distance, Closed = false, Join = "miter") => {
	const Distances = Array.isArray(Distance) ? Distance : Points.map(() => Distance);
	const Normals = tangentsOf(Points, Closed).map(normalOf);
	return Points.map((Entry, Index) => {
		const Normal = Normals[Index];
		const Previous = Normals[(Index - 1 + Normals.length) % Normals.length];
		const Next = Normals[(Index + 1) % Normals.length];
		const D = Distances[Index];
		if (Join === "bevel") {
			return { x: Entry.x + Normal.x * D, y: Entry.y + Normal.y * D };
		}
		if (Join === "round") {
			const Average = { x: (Normal.x + Previous.x + Next.x) / 3, y: (Normal.y + Previous.y + Next.y) / 3 };
			const Scale = length(Average);
			return { x: Entry.x + (Average.x / Scale) * D, y: Entry.y + (Average.y / Scale) * D };
		}
		const Average = { x: Normal.x + (Previous.x + Next.x) / 2, y: Normal.y + (Previous.y + Next.y) / 2 };
		const Scale = length(Average);
		return { x: Entry.x + (Average.x / Scale) * D, y: Entry.y + (Average.y / Scale) * D };
	});
};

const ringPath = (Points) => `M${Points.map(point).join(" L")} Z`;

/** A round cap: a semicircle of points past the end. */
const capPoints = (End, Tangent, HalfWidth, Direction) => {
	if (HalfWidth <= 0) {
		return [];
	}
	const Normal = normalOf(Tangent);
	const Points = [];
	for (let Step = 1; Step < 6; Step += 1) {
		const Angle = (Math.PI * Step) / 6;
		Points.push({
			x: End.x + (Tangent.x * Math.cos(Angle) + Normal.x * Math.sin(Angle)) * HalfWidth * Direction,
			y: End.y + (Tangent.y * Math.cos(Angle) + Normal.y * Math.sin(Angle)) * HalfWidth * Direction,
		});
	}
	return Points;
};

/**
 * The stroke envelope of a centerline as SVG path data.
 * Width may be a number (constant) or an array (variable-width profile).
 * Open: left side forward + end cap + right side back + start cap.
 * Closed: outer offset + inner offset as an even-odd ring.
 */
export const envelopeOf = (Points, Width, Closed = false, Options = {}) => {
	if (Points.length < 2) {
		return "";
	}
	const Join = Options.join ?? "miter";
	const Widths = Array.isArray(Width) ? Width : Points.map(() => Width);
	const Halves = Widths.map((Value) => Value / 2);
	if (Closed) {
		return `${ringPath(offsetPolyline(Points, Halves, true, Join))} ${ringPath(
			offsetPolyline(Points, Halves.map((Value) => -Value), true, Join),
		)}`;
	}
	const Left = offsetPolyline(Points, Halves, false, Join);
	const Right = offsetPolyline(Points, Halves.map((Value) => -Value), false, Join);
	const Tangents = tangentsOf(Points, false);
	const EndCap = Options.endCap === "round" ? capPoints(Points[Points.length - 1], Tangents[Tangents.length - 1], Halves[Halves.length - 1], 1) : [];
	const StartCap = Options.startCap === "round" ? capPoints(Points[0], Tangents[0], Halves[0], -1) : [];
	return ringPath([...Left, ...EndCap, ...Right.reverse(), ...StartCap]);
};

/** The footprint: the envelope grown by the contour (and any decoration). */
export const footprintOf = (Points, Width, Closed = false, Options = {}) => {
	const Contour = Options.contour ?? 0.7;
	const Grown = (Array.isArray(Width) ? Width : [Width]).map((Value) => Value + Contour * 2);
	return envelopeOf(Points, Array.isArray(Width) ? Grown : Grown[0], Closed, Options);
};

/** Translate points (used for the Effect-TS echo footprint). */
export const translatePoints = (Points, DX, DY) => Points.map((Entry) => ({ x: Entry.x + DX, y: Entry.y + DY }));

/** Rotate points about the canvas centre. */
export const rotatePoints = (Points, Degrees) => {
	const Radians = (Degrees * Math.PI) / 180;
	const Cos = Math.cos(Radians);
	const Sin = Math.sin(Radians);
	return Points.map((Entry) => ({
		x: 50 + (Entry.x - 50) * Cos - (Entry.y - 50) * Sin,
		y: 50 + (Entry.x - 50) * Sin + (Entry.y - 50) * Cos,
	}));
};

/** Scale points about the canvas centre. */
export const scalePoints = (Points, ScaleX, ScaleY = ScaleX) =>
	Points.map((Entry) => ({ x: 50 + (Entry.x - 50) * ScaleX, y: 50 + (Entry.y - 50) * ScaleY }));

/** The minimum distance between two polygons' vertices and edges. */
export const polygonDistance = (A, B) => {
	const segment = (P, Start, End) => {
		const DX = End.x - Start.x;
		const DY = End.y - Start.y;
		const Denom = DX * DX + DY * DY;
		const T = Denom === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - Start.x) * DX + (P.y - Start.y) * DY) / Denom));
		return Math.hypot(P.x - (Start.x + T * DX), P.y - (Start.y + T * DY));
	};
	let Minimum = Number.POSITIVE_INFINITY;
	for (let Index = 0; Index < A.length; Index += 1) {
		for (let Other = 0; Other < B.length; Other += 1) {
			Minimum = Math.min(Minimum, segment(A[Index], B[Other], B[(Other + 1) % B.length]));
			Minimum = Math.min(Minimum, segment(B[Other], A[Index], A[(Index + 1) % A.length]));
		}
	}
	return Minimum;
};

/** The minimum distance between two POLYLINES (open, no closing chord). */
export const polylineDistance = (A, B) => {
	const segment = (P, Start, End) => {
		const DX = End.x - Start.x;
		const DY = End.y - Start.y;
		const Denom = DX * DX + DY * DY;
		const T = Denom === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - Start.x) * DX + (P.y - Start.y) * DY) / Denom));
		return Math.hypot(P.x - (Start.x + T * DX), P.y - (Start.y + T * DY));
	};
	let Minimum = Number.POSITIVE_INFINITY;
	for (let Index = 0; Index < A.length - 1; Index += 1) {
		for (let Other = 0; Other < B.length - 1; Other += 1) {
			Minimum = Math.min(Minimum, segment(A[Index], B[Other], B[Other + 1]));
			Minimum = Math.min(Minimum, segment(B[Other], A[Index], A[Index + 1]));
		}
	}
	return Minimum;
};

/**
 * The clearance between two components, on their FOOTPRINTS:
 * required = gap + contourA/2 + contourB/2 (the formula the brief states).
 * Returns the margin: positive means clear, negative means overlapping.
 */
export const clearanceOf = (A, B, Gap = 1.5) => {
	const Required =
		Gap + ((A.width ?? 1.5) / 2 + (A.contour ?? 0.7) / 2) + ((B.width ?? 1.5) / 2 + (B.contour ?? 0.7) / 2);
	const Actual = polylineDistance(A.points, B.points);
	return { required: Required, actual: Actual, margin: Actual - Required, ok: Actual >= Required };
};
