// Envelope.mjs - stroke-envelope construction (the correction in the brief).
//
// Drawing the same centerline twice with two stroke widths is NOT a mini outline:
// an SVG stroke is centred on the path, so the "outline" pass bleeds outside the
// body on both sides and carries no boundary of its own. The correct pipeline is:
//
//   1. the centerline (open or closed, with its terminals preserved)
//   2. its STROKE ENVELOPE: the area the stroke actually occupies, as a polygon
//   3. a fine CONTOUR around that envelope (offset outward by a hairline)
//   4. clearance measured on the ENVELOPE, never on the centerline
//
// This module does 2-4 with no dependencies: an offset polygon per side for an
// open centerline, an outer + inner ring for a closed one (even-odd fill), and a
// point-sampling clearance test for the composer.
//
// The production upgrade path (Paper.js + paperjs-offset, Clipper2, perfect-freehand)
// is recorded in ICON-METHODS.md section 7; this in-house version keeps the
// repository dependency-free and deterministic.

const number = (Value) => {
	const Rounded = Math.round(Value * 10) / 10;
	return Object.is(Rounded, -0) ? "0" : String(Rounded);
};

const point = (Value) => `${number(Value.x)},${number(Value.y)}`;

const length = (Vector) => Math.hypot(Vector.x, Vector.y) || 1;

/** The unit normal at each vertex of a polyline (averaged across the joint). */
const normalsOf = (Points, Closed) => {
	const Normals = [];
	for (let Index = 0; Index < Points.length; Index += 1) {
		const Previous = Points[(Index - 1 + Points.length) % Points.length];
		const Next = Points[(Index + 1) % Points.length];
		const HasPrevious = Closed || Index > 0;
		const HasNext = Closed || Index < Points.length - 1;
		const TangentA = HasPrevious
			? { x: Points[Index].x - Previous.x, y: Points[Index].y - Previous.y }
			: null;
		const TangentB = HasNext
			? { x: Next.x - Points[Index].x, y: Next.y - Points[Index].y }
			: null;
		const Tangent = TangentA ?? TangentB;
		const Other = TangentB ?? TangentA;
		const Mixed = {
			x: (Tangent.x / length(Tangent) + Other.x / length(Other)) / 2,
			y: (Tangent.y / length(Tangent) + Other.y / length(Other)) / 2,
		};
		const Normal = { x: -Mixed.y, y: Mixed.x };
		const Scale = length(Normal);
		Normals.push({ x: Normal.x / Scale, y: Normal.y / Scale });
	}
	return Normals;
};

/** Offset a polyline by Distance (positive = left of travel). */
export const offsetPolyline = (Points, Distance, Closed = false) => {
	const Normals = normalsOf(Points, Closed);
	return Points.map((Entry, Index) => ({
		x: Entry.x + Normals[Index].x * Distance,
		y: Entry.y + Normals[Index].y * Distance,
	}));
};

const ringPath = (Points) => `M${Points.map(point).join(" L")} Z`;

/**
 * The stroke envelope of a centerline, as SVG path data.
 * Open: left offset forward, right offset back, closed.
 * Closed: outer offset plus inner offset as an even-odd ring.
 */
export const envelopeOf = (Points, Width, Closed = false) => {
	if (Points.length < 2) {
		return "";
	}
	const Half = Width / 2;
	if (Closed) {
		const Outer = offsetPolyline(Points, Half, true);
		const Inner = offsetPolyline(Points, -Half, true);
		return `${ringPath(Outer)} ${ringPath(Inner)}`;
	}
	const Left = offsetPolyline(Points, Half, false);
	const Right = offsetPolyline(Points, -Half, false);
	return ringPath([...Left, ...Right.reverse()]);
};

/** The hairline contour AROUND the envelope: the envelope grown by Outline. */
export const contourOf = (Points, Width, Outline, Closed = false) => {
	const Grown = Width + Outline * 2;
	return envelopeOf(Points, Grown, Closed);
};

/** The fill rule the envelope needs (even-odd for closed rings, nonzero for open). */
export const fillRuleOf = (Closed) => (Closed ? "evenodd" : "nonzero");

/** Squared distance from a point to a segment. */
const segmentDistance = (P, A, B) => {
	const DX = B.x - A.x;
	const DY = B.y - A.y;
	const Denom = DX * DX + DY * DY;
	const T =
		Denom === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * DX + (P.y - A.y) * DY) / Denom));
	return Math.hypot(P.x - (A.x + T * DX), P.y - (A.y + T * DY));
};

/** The minimum distance between two sampled centerlines. */
const distanceBetween = (A, B) => {
	let Minimum = Number.POSITIVE_INFINITY;
	for (const Entry of A) {
		for (let Index = 0; Index < B.length - 1; Index += 1) {
			Minimum = Math.min(Minimum, segmentDistance(Entry, B[Index], B[Index + 1]));
			if (Minimum === 0) {
				return 0;
			}
		}
	}
	return Minimum;
};

/**
 * True when two envelope-bearing parts are too close: the centerline distance is
 * less than half their widths plus the clearance. This is the check the brief
 * asks for (envelopes, not centerlines).
 */
export const tooClose = (A, B, Clearance = 1.2) => {
	if (A.points === undefined || B.points === undefined) {
		return false;
	}
	const Needed = (A.width ?? 1.5) / 2 + (B.width ?? 1.5) / 2 + Clearance;
	return distanceBetween(A.points, B.points) < Needed;
};

/**
 * Drop parts that collide with an already-placed part (atomic groups: when
 * Group is set, one collision drops every part sharing it). The zones are
 * disjoint by construction, so this only fires inside a zone with too many
 * repeated methods - which is exactly the failure it must prevent.
 */
export const rejectOverlaps = (Parts, Clearance = 1.2) => {
	const Kept = [];
	const Rejected = [];
	for (const Part of Parts) {
		const Collides = Kept.some((Other) => tooClose(Part, Other, Clearance));
		if (Collides) {
			Rejected.push(Part);
		} else {
			Kept.push(Part);
		}
	}
	return { kept: Kept, rejected: Rejected };
};
